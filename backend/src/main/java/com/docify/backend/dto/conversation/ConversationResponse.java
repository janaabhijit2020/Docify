package com.docify.backend.dto.conversation;

import java.time.LocalDateTime;

public record ConversationResponse(

        Long id,

        Long documentId,

        String title,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}