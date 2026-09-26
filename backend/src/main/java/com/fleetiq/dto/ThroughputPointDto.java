package com.fleetiq.dto;

import java.time.Instant;

public class ThroughputPointDto {
    private Instant timestamp;
    private String label;
    private long received;
    private long processed;
    private long rejected;

    public ThroughputPointDto() {}

    public ThroughputPointDto(Instant timestamp, String label, long received, long processed, long rejected) {
        this.timestamp = timestamp;
        this.label = label;
        this.received = received;
        this.processed = processed;
        this.rejected = rejected;
    }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getReceived() { return received; }
    public void setReceived(long received) { this.received = received; }

    public long getProcessed() { return processed; }
    public void setProcessed(long processed) { this.processed = processed; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }
}
