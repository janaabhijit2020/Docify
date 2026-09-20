package com.docify.backend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ChatRequest(

        @NotNull(message = "Document ID is required.")
        @Positive(message = "Document ID must be greater than zero.")
        Long documentId,

        @NotBlank(message = "Question cannot be empty.")
        String question,

        @Positive(message = "Conversation ID must be greater than zero.")
        Long conversationId

) {
}