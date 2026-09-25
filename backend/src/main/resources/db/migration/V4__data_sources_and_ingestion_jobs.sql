-- ==============================================================================
-- VEHYRON Database Schema Migration: V4__data_sources_and_ingestion_jobs.sql
-- Compatible with: PostgreSQL 15/16 and H2 (PostgreSQL compatibility mode)
-- ==============================================================================

-- 1. DATA SOURCES TABLE
CREATE TABLE data_sources (
    id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    source_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    configuration TEXT,
    credential_reference VARCHAR(256),
    schema_mapping TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    events_received BIGINT DEFAULT 0,
    events_processed BIGINT DEFAULT 0,
    events_rejected BIGINT DEFAULT 0,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    last_event_at TIMESTAMP WITH TIME ZONE,
    last_error_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_data_sources PRIMARY KEY (id)
);

CREATE INDEX idx_data_sources_type ON data_sources(source_type);
CREATE INDEX idx_data_sources_status ON data_sources(status);
CREATE INDEX idx_data_sources_enabled ON data_sources(enabled);

-- 2. INGESTION JOBS TABLE
CREATE TABLE ingestion_jobs (
    job_id VARCHAR(64) NOT NULL,
    source_id VARCHAR(64),
    file_name VARCHAR(256),
    source_type VARCHAR(32) NOT NULL,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    rejected_records INTEGER DEFAULT 0,
    warning_records INTEGER DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    uploaded_by VARCHAR(64),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    CONSTRAINT pk_ingestion_jobs PRIMARY KEY (job_id)
);

CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_started ON ingestion_jobs(started_at);
CREATE INDEX idx_ingestion_jobs_source ON ingestion_jobs(source_id);
