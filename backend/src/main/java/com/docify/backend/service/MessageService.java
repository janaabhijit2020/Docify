package com.docify.backend.service;

import com.docify.backend.entity.Conversation;
import com.docify.backend.entity.Message;
import com.docify.backend.entity.MessageRole;
import com.docify.backend.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(
            MessageRepository messageRepository
    ) {
        this.messageRepository = messageRepository;
    }

    /**
     * Saves a message inside a conversation.
     */
    public Message saveMessage(
            Conversation conversation,
            MessageRole role,
            String content
    ) {

        if (conversation == null) {
            throw new IllegalArgumentException(
                    "Conversation cannot be null."
            );
        }

        if (role == null) {
            throw new IllegalArgumentException(
                    "Message role cannot be null."
            );
        }

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "Message content cannot be empty."
            );
        }

        Message message =
                new Message(
                        conversation,
                        role,
                        content.trim()
                );

        return messageRepository.save(message);
    }

    /**
     * Retrieves all messages belonging to a conversation,
     * ordered from oldest to newest.
     */
    public List<Message> getConversationMessages(
            Long conversationId
    ) {

        if (conversationId == null) {
            throw new IllegalArgumentException(
                    "Conversation ID cannot be null."
            );
        }

        return messageRepository
                .findAllByConversationIdOrderByCreatedAtAsc(
                        conversationId
                );
    }
}