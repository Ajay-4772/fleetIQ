package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ingestion_jobs")
public class IngestionJob {

    @Id
    @Column(name = "job_id", length = 64)
    private String jobId;

    @Column(name = "source_id", length = 64)
    private String sourceId;

    @Column(name = "file_name", length = 256)
    private String fileName;

    @Column(name = "source_type", nullable = false, length = 32)
    private String sourceType;

    @Column(name = "total_records")
    private int totalRecords = 0;

    @Column(name = "processed_records")
    private int processedRecords = 0;

    @Column(name = "rejected_records")
    private int rejectedRecords = 0;

    @Column(name = "warning_records")
    private int warningRecords = 0;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // QUEUED, PROCESSING, COMPLETED, PARTIALLY_COMPLETED, FAILED

    @Column(name = "uploaded_by", length = 64)
    private String uploadedBy;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public IngestionJob() {}

    public IngestionJob(String jobId, String sourceId, String fileName, String sourceType, String status, String uploadedBy) {
        this.jobId = jobId;
        this.sourceId = sourceId;
        this.fileName = fileName;
        this.sourceType = sourceType;
        this.status = status;
        this.uploadedBy = uploadedBy;
        this.startedAt = Instant.now();
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public int getTotalRecords() { return totalRecords; }
    public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

    public int getProcessedRecords() { return processedRecords; }
    public void setProcessedRecords(int processedRecords) { this.processedRecords = processedRecords; }

    public int getRejectedRecords() { return rejectedRecords; }
    public void setRejectedRecords(int rejectedRecords) { this.rejectedRecords = rejectedRecords; }

    public int getWarningRecords() { return warningRecords; }
    public void setWarningRecords(int warningRecords) { this.warningRecords = warningRecords; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
