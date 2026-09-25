package com.fleetiq.repository;

import com.fleetiq.model.UserAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {
    List<UserAuditLog> findTop50ByOrderByTimestampDesc();
    List<UserAuditLog> findByTargetUsernameOrderByTimestampDesc(String targetUsername);
}
