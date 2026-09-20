package com.docify.backend.dto.chat;

public record ChatResponse(

        Long conversationId,

        Long documentId,

        String question,

        String answer,

        int retrievedChunks

) {
}