package com.fleetiq.repository;

import com.fleetiq.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
    List<ChatConversation> findByUserIdAndArchivedFalseOrderByUpdatedAtDesc(String userId);
    Optional<ChatConversation> findByIdAndUserId(String id, String userId);
}
