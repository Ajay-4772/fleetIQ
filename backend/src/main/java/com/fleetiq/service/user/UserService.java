package com.fleetiq.service.user;

import com.fleetiq.dto.CreateUserRequest;
import com.fleetiq.dto.UserAdminDto;
import com.fleetiq.model.PlatformSetting;
import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.repository.PlatformSettingRepository;
import com.fleetiq.repository.UserAuditLogRepository;
import com.fleetiq.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PlatformSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       UserAuditLogRepository auditLogRepository,
                       PlatformSettingRepository settingRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.settingRepository = settingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserAdminDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserAdminDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserAdminDto> getAccessRequests() {
        return userRepository.findByStatus("PENDING_APPROVAL").stream()
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
                .filter(u -> u.getUsername().toLowerCase().contains(q) ||
                        (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)))
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
        user.setStatus("ACTIVE");
        user.setEnabled(true);
        user.setApprovedBy(actorUsername);
        user.setApprovedAt(Instant.now());

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
    public UserAdminDto approveAccessRequest(Long userId, Role approvedRole, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        if (!"PENDING_APPROVAL".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("User is not in PENDING_APPROVAL status (Current: " + user.getStatus() + ")");
        }

        user.setStatus("ACTIVE");
        user.setEnabled(true);
        user.setRole(approvedRole != null ? approvedRole : Role.ROLE_OPERATOR);
        user.setApprovedBy(actorUsername);
        user.setApprovedAt(Instant.now());

        User updated = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                "ACCESS_REQUEST_APPROVED",
                user.getUsername(),
                "Access request approved with role " + user.getRole().name() + " by " + actorUsername,
                ip
        ));

        return new UserAdminDto(updated);
    }

    @Transactional
    public UserAdminDto rejectAccessRequest(Long userId, String reason, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        user.setStatus("REJECTED");
        user.setEnabled(false);
        user.setApprovedBy(actorUsername);
        user.setApprovedAt(Instant.now());

        User updated = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                "ACCESS_REQUEST_REJECTED",
                user.getUsername(),
                "Access request rejected: " + (reason != null ? reason : "Administrative rejection"),
                ip
        ));

        return new UserAdminDto(updated);
    }

    @Transactional
    public UserAdminDto updateUserStatus(Long userId, boolean enabled, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        if (user.getUsername().equalsIgnoreCase(actorUsername)) {
            throw new IllegalArgumentException("Administrators cannot change their own account status");
        }

        // Prevent deactivating the last active administrator
        if (!enabled && user.getRole() == Role.ROLE_ADMIN && userRepository.countByRoleAndEnabled(Role.ROLE_ADMIN, true) <= 1) {
            throw new IllegalArgumentException("Cannot deactivate the last active administrator on the platform.");
        }

        user.setEnabled(enabled);
        user.setStatus(enabled ? "ACTIVE" : "DEACTIVATED");
        User updated = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                enabled ? "USER_REACTIVATED" : "USER_DEACTIVATED",
                user.getUsername(),
                "Account status set to " + (enabled ? "ENABLED/ACTIVE" : "DISABLED/DEACTIVATED"),
                ip
        ));

        return new UserAdminDto(updated);
    }

    @Transactional
    public UserAdminDto updateUserRole(Long userId, Role newRole, String actorUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found"));

        if (user.getUsername().equalsIgnoreCase(actorUsername) && newRole != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Administrators cannot demote their own account role");
        }

        // Prevent demoting the last active administrator
        if (user.getRole() == Role.ROLE_ADMIN && newRole != Role.ROLE_ADMIN && userRepository.countByRoleAndEnabled(Role.ROLE_ADMIN, true) <= 1) {
            throw new IllegalArgumentException("Cannot demote the last active administrator on the platform.");
        }

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
    public String getRegistrationPolicy() {
        return settingRepository.findById("registration_policy")
                .map(PlatformSetting::getValue)
                .orElse("APPROVAL_REQUIRED");
    }

    @Transactional
    public String updateRegistrationPolicy(String policy, String actorUsername, String ip) {
        String cleanPolicy = policy.trim().toUpperCase();
        if (!cleanPolicy.equals("APPROVAL_REQUIRED") && !cleanPolicy.equals("AUTO_APPROVE_OPERATOR") && !cleanPolicy.equals("DISABLED")) {
            throw new IllegalArgumentException("Invalid registration policy. Allowed: APPROVAL_REQUIRED, AUTO_APPROVE_OPERATOR, DISABLED");
        }

        PlatformSetting setting = new PlatformSetting("registration_policy", cleanPolicy, actorUsername);
        settingRepository.save(setting);

        auditLogRepository.save(new UserAuditLog(
                actorUsername,
                "POLICY_CHANGED",
                "REGISTRATION_POLICY",
                "Registration policy updated to " + cleanPolicy + " by " + actorUsername,
                ip
        ));

        return cleanPolicy;
    }

    @Transactional(readOnly = true)
    public List<UserAuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
