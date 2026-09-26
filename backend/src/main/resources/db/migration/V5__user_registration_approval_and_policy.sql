-- ==============================================================================
-- VEHYRON Database Schema Migration: V5__user_registration_approval_and_policy.sql
-- Compatible with: PostgreSQL 15/16 and H2 (PostgreSQL compatibility mode)
-- ==============================================================================

-- 1. EXTEND USERS TABLE WITH ACCESS APPROVAL & GOVERNANCE FIELDS
ALTER TABLE users ADD COLUMN status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL;
ALTER TABLE users ADD COLUMN requested_role VARCHAR(32);
ALTER TABLE users ADD COLUMN approved_by VARCHAR(64);
ALTER TABLE users ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_users_status ON users(status);

-- 2. PLATFORM SETTINGS TABLE (DYNAMIC GOVERNANCE & REGISTRATION POLICIES)
CREATE TABLE platform_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value VARCHAR(256) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by VARCHAR(64)
);

-- Insert baseline registration governance policy (APPROVAL_REQUIRED by default)
INSERT INTO platform_settings (setting_key, setting_value, updated_at, updated_by)
VALUES ('registration_policy', 'APPROVAL_REQUIRED', CURRENT_TIMESTAMP, 'SYSTEM');
