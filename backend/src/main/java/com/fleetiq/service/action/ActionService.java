package com.fleetiq.service.action;

import com.fleetiq.dto.ActionStatusUpdateRequest;
import com.fleetiq.model.ActionItem;
import com.fleetiq.model.Decision;
import com.fleetiq.repository.ActionItemRepository;
import com.fleetiq.service.sse.DashboardEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class ActionService {

    private final ActionItemRepository actionRepository;
    private final DashboardEventPublisher eventPublisher;

    public ActionService(ActionItemRepository actionRepository, DashboardEventPublisher eventPublisher) {
        this.actionRepository = actionRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionItem createActionFromDecision(Decision decision, String severity) {
        // Skip creating action if telemetry is normal and priority is LOW
        if ("TELEMETRY_NORMAL".equalsIgnoreCase(decision.getIssueDetected()) && "LOW".equalsIgnoreCase(decision.getPriority())) {
            return null;
        }

        String actionId = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ActionItem item = new ActionItem(
                actionId,
                decision.getDecisionId(),
                decision.getVehicleId(),
                decision.getIssueDetected(),
                decision.getPriority(),
                severity,
                decision.getEstimatedCostImpact(),
                decision.getRecommendedAction(),
                decision.getConfidenceScore(),
                "OPEN",
                decision.getDecisionSource(),
                decision.getRequiresHumanReview()
        );

        ActionItem saved = actionRepository.save(item);
        eventPublisher.publishActionUpdate(saved);
        return saved;
    }

    @Transactional
    public ActionItem updateStatus(String actionId, ActionStatusUpdateRequest request) {
        Optional<ActionItem> opt = actionRepository.findById(actionId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Action not found with ID: " + actionId);
        }

        ActionItem item = opt.get();
        String newStatus = request.getStatus().toUpperCase();

        if (!newStatus.equals("OPEN") && !newStatus.equals("IN_PROGRESS") &&
            !newStatus.equals("RESOLVED") && !newStatus.equals("DISMISSED")) {
            throw new IllegalArgumentException("Invalid action status: " + newStatus);
        }

        item.setStatus(newStatus);
        if (request.getNotes() != null) {
            item.setNotes(request.getNotes());
        }
        item.setUpdatedAt(Instant.now());

        if ("RESOLVED".equals(newStatus) || "DISMISSED".equals(newStatus)) {
            item.setResolvedAt(Instant.now());
        } else {
            item.setResolvedAt(null);
        }

        ActionItem saved = actionRepository.save(item);
        eventPublisher.publishActionUpdate(saved);
        return saved;
    }

    public Page<ActionItem> getActions(String status, String priority, Boolean humanReview, Pageable pageable) {
        return actionRepository.filterActions(status, priority, humanReview, pageable);
    }

    public Optional<ActionItem> getActionById(String actionId) {
        return actionRepository.findById(actionId);
    }
}
