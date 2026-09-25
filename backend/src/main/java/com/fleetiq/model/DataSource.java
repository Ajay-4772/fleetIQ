package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "data_sources")
public class DataSource {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "source_type", nullable = false, length = 32)
    private String sourceType; // KAFKA, MQTT, REST, WEBHOOK, PUBSUB, KINESIS, EVENT_HUBS, EXCEL, CSV

    @Column(name = "status", nullable = false, length = 32)
    private String status; // CONNECTED, CONNECTING, DISCONNECTED, ERROR, PAUSED

    @Column(name = "configuration", columnDefinition = "TEXT")
    private String configuration;

    @Column(name = "credential_reference", length = 256)
    private String credentialReference;

    @Column(name = "schema_mapping", columnDefinition = "TEXT")
    private String schemaMapping;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "events_received")
    private long eventsReceived = 0;

    @Column(name = "events_processed")
    private long eventsProcessed = 0;

    @Column(name = "events_rejected")
    private long eventsRejected = 0;

    @Column(name = "last_connected_at")
    private Instant lastConnectedAt;

    @Column(name = "last_event_at")
    private Instant lastEventAt;

    @Column(name = "last_error_at")
    private Instant lastErrorAt;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    public DataSource() {}

    public DataSource(String id, String name, String sourceType, String status, String configuration, String credentialReference, String createdBy) {
        this.id = id;
        this.name = name;
        this.sourceType = sourceType;
        this.status = status;
        this.configuration = configuration;
        this.credentialReference = credentialReference;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getType() { return sourceType; }
    public void setType(String type) { this.sourceType = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }

    public String getCredentialReference() { return credentialReference; }
    public void setCredentialReference(String credentialReference) { this.credentialReference = credentialReference; }

    public String getSchemaMapping() { return schemaMapping; }
    public void setSchemaMapping(String schemaMapping) { this.schemaMapping = schemaMapping; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public long getEventsReceived() { return eventsReceived; }
    public void setEventsReceived(long eventsReceived) { this.eventsReceived = eventsReceived; }

    public long getEventsProcessed() { return eventsProcessed; }
    public void setEventsProcessed(long eventsProcessed) { this.eventsProcessed = eventsProcessed; }

    public long getEventsRejected() { return eventsRejected; }
    public void setEventsRejected(long eventsRejected) { this.eventsRejected = eventsRejected; }

    public Instant getLastConnectedAt() { return lastConnectedAt; }
    public void setLastConnectedAt(Instant lastConnectedAt) { this.lastConnectedAt = lastConnectedAt; }

    public Instant getLastEventAt() { return lastEventAt; }
    public void setLastEventAt(Instant lastEventAt) { this.lastEventAt = lastEventAt; }

    public Instant getLastErrorAt() { return lastErrorAt; }
    public void setLastErrorAt(Instant lastErrorAt) { this.lastErrorAt = lastErrorAt; }

    public String getLastError() { return lastError; }
    public void setLastError(String lastError) { this.lastError = lastError; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
