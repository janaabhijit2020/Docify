package com.docify.backend.repository;

import com.docify.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    List<Conversation> findAllByUserIdOrderByUpdatedAtDesc(
            Long userId
    );

    Optional<Conversation> findByIdAndUserId(
            Long conversationId,
            Long userId
    );

    List<Conversation> findAllByDocumentIdAndUserId(
            Long documentId,
            Long userId
    );
}