package com.fleetiq.repository;

import com.fleetiq.model.ActionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, String> {
    List<ActionItem> findByVehicleIdOrderByCreatedAtDesc(String vehicleId);
    List<ActionItem> findByVehicleId(String vehicleId);
    List<ActionItem> findByStatusOrderByCreatedAtDesc(String status);
    List<ActionItem> findByStatus(String status);
    List<ActionItem> findByRequiresHumanReviewTrue();
    List<ActionItem> findTop50ByOrderByCreatedAtDesc();

    long countByStatus(String status);
    long countByPriority(String priority);
    long countByPriorityAndStatus(String priority, String status);
    long countByRequiresHumanReviewTrue();

    @Query("SELECT SUM(a.estimatedImpact) FROM ActionItem a WHERE a.status = :status")
    Double sumImpactByStatus(@Param("status") String status);

    @Query("SELECT SUM(a.estimatedImpact) FROM ActionItem a")
    Double sumTotalImpact();

    @Query("SELECT a FROM ActionItem a WHERE (:status IS NULL OR a.status = :status) AND (:priority IS NULL OR a.priority = :priority) AND (:requiresHumanReview IS NULL OR a.requiresHumanReview = :requiresHumanReview) ORDER BY a.createdAt DESC")
    Page<ActionItem> filterActions(@Param("status") String status,
                                   @Param("priority") String priority,
                                   @Param("requiresHumanReview") Boolean requiresHumanReview,
                                   Pageable pageable);
}
