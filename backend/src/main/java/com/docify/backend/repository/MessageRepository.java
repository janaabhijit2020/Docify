package com.docify.backend.repository;

import com.docify.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findAllByConversationIdOrderByCreatedAtAsc(
            Long conversationId
    );

    void deleteAllByConversationId(Long conversationId);
}