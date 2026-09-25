package com.fleetiq.dto;

import com.fleetiq.model.ChatConversation;
import java.time.Instant;

public class ChatConversationDto {

    private String id;
    private String title;
    private boolean archived;
    private Instant createdAt;
    private Instant updatedAt;
    private int messageCount;

    public ChatConversationDto() {}

    public ChatConversationDto(ChatConversation conv, int messageCount) {
        this.id = conv.getId();
        this.title = conv.getTitle();
        this.archived = conv.isArchived();
        this.createdAt = conv.getCreatedAt();
        this.updatedAt = conv.getUpdatedAt();
        this.messageCount = messageCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public int getMessageCount() { return messageCount; }
    public void setMessageCount(int messageCount) { this.messageCount = messageCount; }
}
