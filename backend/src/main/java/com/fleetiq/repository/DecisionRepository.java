package com.fleetiq.repository;

import com.fleetiq.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, String> {
    List<Decision> findByVehicleIdOrderByCreatedAtDesc(String vehicleId);
    List<Decision> findTop20ByOrderByCreatedAtDesc();

    long countByDecisionSource(String decisionSource);
    long countByRequiresHumanReviewTrue();

    @Query("SELECT d.decisionSource, COUNT(d) FROM Decision d GROUP BY d.decisionSource")
    List<Object[]> countByDecisionSourceGrouped();
}
