package com.docify.backend.service;

import com.docify.backend.entity.Conversation;
import com.docify.backend.entity.Document;
import com.docify.backend.entity.User;
import com.docify.backend.repository.ConversationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;

    public ConversationService(
            ConversationRepository conversationRepository
    ) {
        this.conversationRepository = conversationRepository;
    }

    /**
     * Creates a new conversation for the authenticated user
     * and associates it with the selected document.
     */
    public Conversation createConversation(
            User user,
            Document document,
            String title
    ) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null."
            );
        }

        if (document == null) {
            throw new IllegalArgumentException(
                    "Document cannot be null."
            );
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Conversation title cannot be empty."
            );
        }

        Conversation conversation =
                new Conversation(
                        user,
                        document,
                        title.trim()
                );

        return conversationRepository.save(conversation);
    }

    /**
     * Retrieves all conversations belonging to a user,
     * ordered by most recent activity.
     */
    public List<Conversation> getUserConversations(
            Long userId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID cannot be null."
            );
        }

        return conversationRepository
                .findAllByUserIdOrderByUpdatedAtDesc(userId);
    }

    /**
     * Retrieves one conversation only if it belongs
     * to the specified user.
     */
    public Conversation getUserConversation(
            Long conversationId,
            Long userId
    ) {

        if (conversationId == null) {
            throw new IllegalArgumentException(
                    "Conversation ID cannot be null."
            );
        }

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID cannot be null."
            );
        }

        return conversationRepository
                .findByIdAndUserId(
                        conversationId,
                        userId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found or does not belong to the authenticated user."
                        )
                );
    }

    /**
     * Updates the last-activity timestamp of a conversation.
     */
    public Conversation touchConversation(
            Conversation conversation
    ) {

        if (conversation == null) {
            throw new IllegalArgumentException(
                    "Conversation cannot be null."
            );
        }

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        return conversationRepository.save(conversation);
    }
}