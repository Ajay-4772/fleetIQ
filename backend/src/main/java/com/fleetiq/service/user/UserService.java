package com.fleetiq.service.user;

import com.fleetiq.dto.CreateUserRequest;
import com.fleetiq.dto.UserAdminDto;
import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.repository.UserAuditLogRepository;
import com.fleetiq.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       UserAuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserAdminDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserAdminDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserAdminDto> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return getAllUsers();
        }
        String q = query.trim().toLowerCase();
        return userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(q) || u.getFullName().toLowerCase().contains(q))
                .map(UserAdminDto::new)
                .toList();
    }

    @Transactional
    public UserAdminDto createUser(CreateUserRequest request, String actorUsername, String ip) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already registered");
        }

        User user = new User(
                request.getUsername().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getRole()
        );

        User saved = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                "USER_CREATED",
                saved.getUsername(),
                "Created user with role " + saved.getRole(),
                ip
        ));

        return new UserAdminDto(saved);
    }

    @Transactional
    public UserAdminDto updateUserStatus(Long userId, boolean enabled, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        if (user.getUsername().equals(actorUsername)) {
            throw new IllegalArgumentException("Administrators cannot change their own account status");
        }

        user.setEnabled(enabled);
        User updated = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                enabled ? "USER_REACTIVATED" : "USER_DEACTIVATED",
                user.getUsername(),
                "Account status set to " + (enabled ? "ENABLED" : "DISABLED"),
                ip
        ));

        return new UserAdminDto(updated);
    }

    @Transactional
    public UserAdminDto updateUserRole(Long userId, Role newRole, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User updated = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                "ROLE_UPDATED",
                user.getUsername(),
                "Role changed from " + oldRole + " to " + newRole,
                ip
        ));

        return new UserAdminDto(updated);
    }

    @Transactional(readOnly = true)
    public List<UserAuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
