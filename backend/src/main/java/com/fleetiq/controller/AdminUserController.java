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

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserAdminDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
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
        String ip = servletRequest.getRemoteAddr();
        UserAdminDto created = userService.createUser(request, actor, ip);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserAdminDto> updateUserStatus(@PathVariable Long id,
                                                         @RequestParam boolean enabled,
                                                         Authentication authentication,
                                                         HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(userService.updateUserStatus(id, enabled, actor, ip));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserAdminDto> updateUserRole(@PathVariable Long id,
                                                       @RequestParam Role role,
                                                       Authentication authentication,
                                                       HttpServletRequest servletRequest) {
        String actor = authentication != null ? authentication.getName() : "system";
        String ip = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(userService.updateUserRole(id, role, actor, ip));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<UserAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(userService.getAuditLogs());
    }
}
