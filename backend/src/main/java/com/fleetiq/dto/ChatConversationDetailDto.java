package com.fleetiq.dto;

import java.util.List;

public class ChatConversationDetailDto {

    private ChatConversationDto conversation;
    private List<ChatMessageDto> messages;

    public ChatConversationDetailDto() {}

    public ChatConversationDetailDto(ChatConversationDto conversation, List<ChatMessageDto> messages) {
        this.conversation = conversation;
        this.messages = messages;
    }

    public ChatConversationDto getConversation() { return conversation; }
    public void setConversation(ChatConversationDto conversation) { this.conversation = conversation; }

    public List<ChatMessageDto> getMessages() { return messages; }
    public void setMessages(List<ChatMessageDto> messages) { this.messages = messages; }
}
