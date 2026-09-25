package com.fleetiq.repository;

import com.fleetiq.model.IngestionJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngestionJobRepository extends JpaRepository<IngestionJob, String> {
    List<IngestionJob> findAllByOrderByStartedAtDesc();
    List<IngestionJob> findByStatus(String status);
    List<IngestionJob> findBySourceIdOrderByStartedAtDesc(String sourceId);
}
