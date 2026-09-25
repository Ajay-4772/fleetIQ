package com.fleetiq.controller;

import com.fleetiq.dto.ActionStatusUpdateRequest;
import com.fleetiq.model.ActionItem;
import com.fleetiq.service.action.ActionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/actions", "/api/actions"})
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @GetMapping
    public ResponseEntity<Page<ActionItem>> getActions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean requiresHumanReview,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<ActionItem> result = actionService.getActions(status, priority, requiresHumanReview, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActionItem> getActionById(@PathVariable String id) {
        return actionService.getActionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ActionItem> updateStatus(
            @PathVariable String id,
            @RequestBody ActionStatusUpdateRequest request) {
        if (request == null || request.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ActionItem updated = actionService.updateStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
