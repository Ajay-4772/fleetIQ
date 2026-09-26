package com.fleetiq.repository;

import com.fleetiq.model.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {
}
