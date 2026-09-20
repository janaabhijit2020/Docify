package com.docify.backend.dto.document;

import com.docify.backend.entity.Document;
import com.docify.backend.entity.DocumentStatus;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long documentId,
        String fileName,
        String fileType,
        Long fileSize,
        DocumentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static DocumentResponse fromEntity(Document document) {

        return new DocumentResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getFileType(),
                document.getFileSize(),
                document.getStatus(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}