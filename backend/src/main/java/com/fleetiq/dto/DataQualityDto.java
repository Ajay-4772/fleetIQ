package com.fleetiq.dto;

public class DataQualityDto {
    private long eventsReceived;
    private long successfullyNormalized;
    private long normalizationFailed;
    private long invalidPayloads;
    private long duplicateEvents;
    private long unsupportedSources;
    private long processingFailed;
    private long aiFailures;
    private long fallbackDecisions;

    public DataQualityDto() {}

    public DataQualityDto(long eventsReceived, long successfullyNormalized, long normalizationFailed,
                          long invalidPayloads, long duplicateEvents, long unsupportedSources,
                          long processingFailed, long aiFailures, long fallbackDecisions) {
        this.eventsReceived = eventsReceived;
        this.successfullyNormalized = successfullyNormalized;
        this.normalizationFailed = normalizationFailed;
        this.invalidPayloads = invalidPayloads;
        this.duplicateEvents = duplicateEvents;
        this.unsupportedSources = unsupportedSources;
        this.processingFailed = processingFailed;
        this.aiFailures = aiFailures;
        this.fallbackDecisions = fallbackDecisions;
    }

    public long getEventsReceived() { return eventsReceived; }
    public void setEventsReceived(long eventsReceived) { this.eventsReceived = eventsReceived; }

    public long getSuccessfullyNormalized() { return successfullyNormalized; }
    public void setSuccessfullyNormalized(long successfullyNormalized) { this.successfullyNormalized = successfullyNormalized; }

    public long getNormalizationFailed() { return normalizationFailed; }
    public void setNormalizationFailed(long normalizationFailed) { this.normalizationFailed = normalizationFailed; }

    public long getInvalidPayloads() { return invalidPayloads; }
    public void setInvalidPayloads(long invalidPayloads) { this.invalidPayloads = invalidPayloads; }

    public long getDuplicateEvents() { return duplicateEvents; }
    public void setDuplicateEvents(long duplicateEvents) { this.duplicateEvents = duplicateEvents; }

    public long getUnsupportedSources() { return unsupportedSources; }
    public void setUnsupportedSources(long unsupportedSources) { this.unsupportedSources = unsupportedSources; }

    public long getProcessingFailed() { return processingFailed; }
    public void setProcessingFailed(long processingFailed) { this.processingFailed = processingFailed; }

    public long getAiFailures() { return aiFailures; }
    public void setAiFailures(long aiFailures) { this.aiFailures = aiFailures; }

    public long getFallbackDecisions() { return fallbackDecisions; }
    public void setFallbackDecisions(long fallbackDecisions) { this.fallbackDecisions = fallbackDecisions; }
}
