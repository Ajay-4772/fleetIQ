package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "raw_ingestion_records")
public class RawIngestionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source", length = 64)
    private String source;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "status", length = 32)
    private String status; // SUCCESS, FAILED, DUPLICATE

    @Column(name = "error_message", length = 512)
    private String errorMessage;

    @Column(name = "received_at")
    private Instant receivedAt = Instant.now();

    public RawIngestionRecord() {}

    public RawIngestionRecord(String source, String rawPayload, String status, String errorMessage) {
        this.source = source;
        this.rawPayload = rawPayload;
        this.status = status;
        this.errorMessage = errorMessage;
        this.receivedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getRawPayload() { return rawPayload; }
    public void setRawPayload(String rawPayload) { this.rawPayload = rawPayload; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
}
