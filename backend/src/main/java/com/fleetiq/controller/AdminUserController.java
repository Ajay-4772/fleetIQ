package com.fleetiq.controller;

import com.fleetiq.dto.CreateUserRequest;
import com.fleetiq.dto.UserAdminDto;
import com.fleetiq.model.Role;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @GetMapping
    public ResponseEntity<List<UserAdminDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/access-requests")
    public ResponseEntity<List<UserAdminDto>> getAccessRequests() {
        return ResponseEntity.ok(userService.getAccessRequests());
    }

    @PostMapping("/access-requests/{id}/approve")
    public ResponseEntity<UserAdminDto> approveAccessRequest(@PathVariable Long id,
                                                             @RequestParam(required = false, defaultValue = "ROLE_OPERATOR") Role role,
                                                             Authentication authentication,
                                                             HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        return ResponseEntity.ok(userService.approveAccessRequest(id, role, actor, ip));
    }

    @PostMapping("/access-requests/{id}/reject")
    public ResponseEntity<UserAdminDto> rejectAccessRequest(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> body,
                                                            Authentication authentication,
                                                            HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        String reason = body != null ? body.get("reason") : "Administrative rejection";
        return ResponseEntity.ok(userService.rejectAccessRequest(id, reason, actor, ip));
    }

    @GetMapping("/policy")
    public ResponseEntity<Map<String, String>> getRegistrationPolicy() {
        return ResponseEntity.ok(Map.of("policy", userService.getRegistrationPolicy()));
    }

    @PutMapping("/policy")
    public ResponseEntity<Map<String, String>> updateRegistrationPolicy(@RequestBody Map<String, String> body,
                                                                        Authentication authentication,
                                                                        HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        String policy = body.getOrDefault("policy", "APPROVAL_REQUIRED");
        String updated = userService.updateRegistrationPolicy(policy, actor, ip);
        return ResponseEntity.ok(Map.of("policy", updated));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserAdminDto>> searchUsers(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @PostMapping
    public ResponseEntity<UserAdminDto> createUser(@Valid @RequestBody CreateUserRequest request,
                                                   Authentication authentication,
                                                   HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        UserAdminDto created = userService.createUser(request, actor, ip);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserAdminDto> updateUserStatus(@PathVariable Long id,
                                                         @RequestParam boolean enabled,
                                                         Authentication authentication,
                                                         HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        return ResponseEntity.ok(userService.updateUserStatus(id, enabled, actor, ip));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserAdminDto> updateUserRole(@PathVariable Long id,
                                                       @RequestParam Role role,
                                                       Authentication authentication,
                                                       HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = getClientIp(servletRequest);
        return ResponseEntity.ok(userService.updateUserRole(id, role, actor, ip));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<UserAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(userService.getAuditLogs());
    }
}
