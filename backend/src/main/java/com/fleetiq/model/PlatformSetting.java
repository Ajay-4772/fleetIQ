package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "platform_settings")
public class PlatformSetting {

    @Id
    @Column(name = "setting_key", length = 64)
    private String key;

    @Column(name = "setting_value", nullable = false, length = 256)
    private String value;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    public PlatformSetting() {}

    public PlatformSetting(String key, String value, String updatedBy) {
        this.key = key;
        this.value = value;
        this.updatedBy = updatedBy;
        this.updatedAt = Instant.now();
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
