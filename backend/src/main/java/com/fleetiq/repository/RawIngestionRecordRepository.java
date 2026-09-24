package com.fleetiq.repository;

import com.fleetiq.model.RawIngestionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawIngestionRecordRepository extends JpaRepository<RawIngestionRecord, Long> {
    long countByStatus(String status);
    long countBySource(String source);
}
