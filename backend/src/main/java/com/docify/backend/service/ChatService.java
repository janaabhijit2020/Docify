package com.docify.backend.service;

import com.docify.backend.ai.GeminiRagService;
import com.docify.backend.dto.chat.ChatRequest;
import com.docify.backend.dto.chat.ChatResponse;
import com.docify.backend.entity.Conversation;
import com.docify.backend.entity.Document;
import com.docify.backend.entity.MessageRole;
import com.docify.backend.entity.User;
import com.docify.backend.rag.RagRetrievalService;
import com.docify.backend.repository.DocumentRepository;
import com.docify.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final RagRetrievalService ragRetrievalService;
    private final GeminiRagService geminiRagService;
    private final ConversationService conversationService;
    private final MessageService messageService;

    public ChatService(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            RagRetrievalService ragRetrievalService,
            GeminiRagService geminiRagService,
            ConversationService conversationService,
            MessageService messageService
    ) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.ragRetrievalService = ragRetrievalService;
        this.geminiRagService = geminiRagService;
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    @Transactional
    public ChatResponse chat(
            ChatRequest request,
            String userEmail
    ) {

        User authenticatedUser =
                userRepository.findByEmail(userEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Authenticated user was not found."
                                )
                        );

        Document document =
                documentRepository.findByIdAndUserId(
                                request.documentId(),
                                authenticatedUser.getId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Document not found or does not belong to the authenticated user."
                                )
                        );

        Conversation conversation;

        if (request.conversationId() == null) {

            String title =
                    createConversationTitle(
                            request.question()
                    );

            conversation =
                    conversationService.createConversation(
                            authenticatedUser,
                            document,
                            title
                    );

        } else {

            conversation =
                    conversationService.getUserConversation(
                            request.conversationId(),
                            authenticatedUser.getId()
                    );

            if (!conversation.getDocument().getId()
                    .equals(document.getId())) {

                throw new IllegalArgumentException(
                        "Conversation does not belong to the requested document."
                );
            }
        }

        List<org.springframework.ai.document.Document>
                documentChunks =
                ragRetrievalService.retrieve(
                        request.question(),
                        authenticatedUser.getId(),
                        document.getId(),
                        5
                );

        messageService.saveMessage(
                conversation,
                MessageRole.USER,
                request.question()
        );

        String answer =
                geminiRagService.generateAnswer(
                        request.question(),
                        documentChunks
                );

        messageService.saveMessage(
                conversation,
                MessageRole.ASSISTANT,
                answer
        );

        conversationService.touchConversation(
                conversation
        );

        return new ChatResponse(
                conversation.getId(),
                document.getId(),
                request.question(),
                answer,
                documentChunks.size()
        );
    }

    private String createConversationTitle(
            String question
    ) {

        String cleanedQuestion =
                question.trim();

        if (cleanedQuestion.length() <= 200) {
            return cleanedQuestion;
        }

        return cleanedQuestion.substring(0, 197)
                + "...";
    }
}