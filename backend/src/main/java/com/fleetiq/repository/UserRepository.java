package com.fleetiq.repository;

import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:identifier) OR LOWER(u.email) = LOWER(:identifier)")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    List<User> findByStatus(String status);
    List<User> findByRole(Role role);
    long countByRoleAndEnabled(Role role, boolean enabled);
}
