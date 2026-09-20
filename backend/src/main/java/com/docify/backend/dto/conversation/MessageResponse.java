package com.docify.backend.dto.conversation;

import com.docify.backend.entity.MessageRole;

import java.time.LocalDateTime;

public record MessageResponse(

        Long id,

        MessageRole role,

        String content,

        LocalDateTime createdAt

) {
}
