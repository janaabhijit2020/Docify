package com.docify.backend.controller;

import com.docify.backend.dto.conversation.ConversationResponse;
import com.docify.backend.dto.conversation.MessageResponse;
import com.docify.backend.entity.Conversation;
import com.docify.backend.entity.Message;
import com.docify.backend.entity.User;
import com.docify.backend.repository.UserRepository;
import com.docify.backend.service.ConversationService;
import com.docify.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final UserRepository userRepository;
    private final ConversationService conversationService;
    private final MessageService messageService;

    public ConversationController(
            UserRepository userRepository,
            ConversationService conversationService,
            MessageService messageService
    ) {
        this.userRepository = userRepository;
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    /**
     * Returns all conversations belonging to the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getConversations(
            Authentication authentication
    ) {

        User authenticatedUser =
                userRepository
                        .findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Authenticated user was not found."
                                )
                        );

        List<ConversationResponse> conversations =
                conversationService
                        .getUserConversations(
                                authenticatedUser.getId()
                        )
                        .stream()
                        .map(this::toConversationResponse)
                        .toList();

        return ResponseEntity.ok(conversations);
    }

    /**
     * Returns one conversation and all of its messages.
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getConversation(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {

        User authenticatedUser =
                userRepository
                        .findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Authenticated user was not found."
                                )
                        );

        Conversation conversation =
                conversationService.getUserConversation(
                        conversationId,
                        authenticatedUser.getId()
                );

        List<MessageResponse> messages =
                messageService
                        .getConversationMessages(
                                conversationId
                        )
                        .stream()
                        .map(this::toMessageResponse)
                        .toList();

        return ResponseEntity.ok(
                new ConversationDetailsResponse(
                        toConversationResponse(conversation),
                        messages
                )
        );
    }

    /**
     * Converts a Conversation entity into the API response DTO.
     */
    private ConversationResponse toConversationResponse(
            Conversation conversation
    ) {

        return new ConversationResponse(
                conversation.getId(),
                conversation.getDocument().getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    /**
     * Converts a Message entity into the API response DTO.
     */
    private MessageResponse toMessageResponse(
            Message message
    ) {

        return new MessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    /**
     * Response object containing conversation metadata
     * together with its messages.
     */
    public record ConversationDetailsResponse(

            ConversationResponse conversation,

            List<MessageResponse> messages

    ) {
    }
}