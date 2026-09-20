package com.docify.backend.controller;

import com.docify.backend.dto.document.DocumentResponse;
import com.docify.backend.entity.Document;
import com.docify.backend.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {

        Document document = documentService.uploadDocument(
                file,
                authentication.getName()
        );

        Map<String, Object> response = new HashMap<>();

        response.put(
                "message",
                "Document uploaded successfully."
        );

        response.put("documentId", document.getId());
        response.put(
                "fileName",
                document.getOriginalFileName()
        );
        response.put("fileType", document.getFileType());
        response.put("fileSize", document.getFileSize());
        response.put("status", document.getStatus().name());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            Authentication authentication
    ) {

        List<DocumentResponse> documents =
                documentService.getUserDocuments(
                        authentication.getName()
                );

        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long documentId,
            Authentication authentication
    ) {

        documentService.deleteDocument(
                documentId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Document deleted successfully."
                )
        );
    }
}