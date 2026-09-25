package com.fleetiq.service.assistant;

import com.fleetiq.dto.ChatConversationDetailDto;
import com.fleetiq.dto.ChatConversationDto;
import com.fleetiq.dto.ChatMessageDto;
import com.fleetiq.model.ChatConversation;
import com.fleetiq.model.ChatMessage;
import com.fleetiq.repository.ChatConversationRepository;
import com.fleetiq.repository.ChatMessageRepository;
import com.fleetiq.service.ai.AIModelProvider;
import com.fleetiq.service.rag.RagChunk;
import com.fleetiq.service.rag.RagService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class CopilotChatService {

    private final ChatConversationRepository conversationRepo;
    private final ChatMessageRepository messageRepo;
    private final AIModelProvider aiProvider;
    private final RagService ragService;

    public CopilotChatService(ChatConversationRepository conversationRepo,
                              ChatMessageRepository messageRepo,
                              AIModelProvider aiProvider,
                              RagService ragService) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.aiProvider = aiProvider;
        this.ragService = ragService;
    }

    @Transactional(readOnly = true)
    public List<ChatConversationDto> getUserConversations(String username) {
        return conversationRepo.findByUserIdAndArchivedFalseOrderByUpdatedAtDesc(username).stream()
                .map(conv -> new ChatConversationDto(conv, conv.getMessages() != null ? conv.getMessages().size() : 0))
                .toList();
    }

    @Transactional
    public ChatConversationDto createConversation(String username, String initialTitle) {
        String id = "CONV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String title = (initialTitle != null && !initialTitle.isBlank()) ? initialTitle.trim() : "New Discussion";

        ChatConversation conv = new ChatConversation(id, username, title);
        ChatConversation saved = conversationRepo.save(conv);
        return new ChatConversationDto(saved, 0);
    }

    @Transactional(readOnly = true)
    public ChatConversationDetailDto getConversationDetails(String conversationId, String username) {
        ChatConversation conv = conversationRepo.findByIdAndUserId(conversationId, username)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found or access denied"));

        List<ChatMessageDto> messages = messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(ChatMessageDto::new)
                .toList();

        return new ChatConversationDetailDto(new ChatConversationDto(conv, messages.size()), messages);
    }

    @Transactional
    public ChatMessageDto sendMessage(String conversationId, String username, String messageText) {
        ChatConversation conv = conversationRepo.findByIdAndUserId(conversationId, username)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found or access denied"));

        // 1. Persist User Message
        String userMsgId = "MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ChatMessage userMsg = new ChatMessage(userMsgId, conv, "USER", messageText.trim());
        messageRepo.save(userMsg);

        // Update conversation title if default
        if ("New Discussion".equalsIgnoreCase(conv.getTitle())) {
            String newTitle = messageText.length() > 40 ? messageText.substring(0, 37) + "..." : messageText;
            conv.setTitle(newTitle);
        }
        conv.setUpdatedAt(Instant.now());

        // 2. Retrieve grounded RAG context & invoke AI Provider
        List<RagChunk> ragKnowledge = ragService.retrieveRelevantChunks(messageText, 3);
        AssistantResponseDto aiResponse = aiProvider.generateResponse(messageText, username, ragKnowledge);

        // 3. Persist AI Assistant Response
        String aiMsgId = "MSG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ChatMessage assistantMsg = new ChatMessage(aiMsgId, conv, "ASSISTANT", aiResponse.getAnswer());
        assistantMsg.setQueryType(aiResponse.getQueryType());
        assistantMsg.setSources(aiResponse.getSources() != null ? String.join("; ", aiResponse.getSources()) : null);
        assistantMsg.setEvidence(aiResponse.getRecommendedAction());
        assistantMsg.setConfidence(aiResponse.getConfidence());
        assistantMsg.setModelProvider(aiResponse.getAiProviderStatus());

        ChatMessage savedAssistantMsg = messageRepo.save(assistantMsg);
        conversationRepo.save(conv);

        return new ChatMessageDto(savedAssistantMsg);
    }

    @Transactional
    public ChatConversationDto renameConversation(String conversationId, String username, String newTitle) {
        ChatConversation conv = conversationRepo.findByIdAndUserId(conversationId, username)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found or access denied"));

        conv.setTitle(newTitle.trim());
        conv.setUpdatedAt(Instant.now());
        ChatConversation saved = conversationRepo.save(conv);
        return new ChatConversationDto(saved, conv.getMessages() != null ? conv.getMessages().size() : 0);
    }

    @Transactional
    public void deleteConversation(String conversationId, String username) {
        ChatConversation conv = conversationRepo.findByIdAndUserId(conversationId, username)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found or access denied"));

        conv.setArchived(true);
        conv.setUpdatedAt(Instant.now());
        conversationRepo.save(conv);
    }
}
