package com.docify.backend.controller;

import com.docify.backend.entity.Document;
import com.docify.backend.entity.User;
import com.docify.backend.rag.DocumentIngestionService;
import com.docify.backend.repository.DocumentRepository;
import com.docify.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentIngestionController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentIngestionService documentIngestionService;

    public DocumentIngestionController(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            DocumentIngestionService documentIngestionService
    ) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentIngestionService = documentIngestionService;
    }

    @PostMapping("/{documentId}/ingest")
    public ResponseEntity<?> ingestDocument(
            @PathVariable Long documentId,
            Authentication authentication
    ) {

        // Get authenticated user's email from JWT.
        String userEmail = authentication.getName();

        // Find authenticated user.
        User authenticatedUser = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user was not found."
                        )
                );

        // Find document belonging specifically to this user.
        Document document = documentRepository
                .findByIdAndUserId(
                        documentId,
                        authenticatedUser.getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Document not found or does not belong to the authenticated user."
                        )
                );

        // Get physical file path.
        Path filePath = Path.of(document.getStoragePath());

        // Verify physical file exists.
        if (!Files.exists(filePath)) {

            return ResponseEntity.status(404).body(
                    Map.of(
                            "message",
                            "The physical document file was not found."
                    )
            );
        }

        // Start RAG ingestion.
        int chunkCount =
                documentIngestionService.ingest(
                        document,
                        filePath
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Document ingested successfully.",
                        "documentId",
                        documentId,
                        "chunkCount",
                        chunkCount
                )
        );
    }
}