package com.docify.backend.service;

import com.docify.backend.dto.document.DocumentResponse;
import com.docify.backend.entity.Conversation;
import com.docify.backend.entity.Document;
import com.docify.backend.entity.DocumentStatus;
import com.docify.backend.entity.User;
import com.docify.backend.rag.DocumentIngestionService;
import com.docify.backend.repository.ConversationRepository;
import com.docify.backend.repository.DocumentRepository;
import com.docify.backend.repository.MessageRepository;
import com.docify.backend.repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentService {

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf",
            ".docx",
            ".txt"
    );

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final DocumentIngestionService documentIngestionService;
    private final JdbcTemplate jdbcTemplate;
    private final Path documentStoragePath;
    private final SupabaseStorageService supabaseStorageService;
    private final String storageMode;
    private final Tika tika;

    public DocumentService(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            DocumentIngestionService documentIngestionService,
            JdbcTemplate jdbcTemplate,
            Path documentStoragePath,
            SupabaseStorageService supabaseStorageService,
            @Value("${app.storage.mode:local}") String storageMode
    ) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.documentIngestionService = documentIngestionService;
        this.jdbcTemplate = jdbcTemplate;
        this.documentStoragePath = documentStoragePath;
        this.supabaseStorageService = supabaseStorageService;
        this.storageMode = storageMode;
        this.tika = new Tika();
    }

    @Transactional
    public Document uploadDocument(
            MultipartFile file,
            String userEmail
    ) {

        validateFile(file);

        User user = findUserByEmail(userEmail);

        String originalFileName = sanitizeFileName(
                file.getOriginalFilename()
        );

        String extension = getExtension(originalFileName);

        validateDetectedFileType(file, extension);

        String storedFileName = UUID.randomUUID() + extension;

        if (isSupabaseStorage()) {
            return uploadToSupabase(
                    file,
                    user,
                    originalFileName,
                    extension,
                    storedFileName
            );
        }

        return uploadToLocalStorage(
                file,
                user,
                originalFileName,
                extension,
                storedFileName
        );
    }

    private Document uploadToLocalStorage(
            MultipartFile file,
            User user,
            String originalFileName,
            String extension,
            String storedFileName
    ) {

        Path targetPath = null;

        try {

            Files.createDirectories(documentStoragePath);

            targetPath = documentStoragePath
                    .resolve(storedFileName)
                    .normalize();

            if (!targetPath.getParent().equals(
                    documentStoragePath.toAbsolutePath()
            )) {
                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            try (InputStream inputStream = file.getInputStream()) {

                Files.copy(
                        inputStream,
                        targetPath,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            Document document = new Document(
                    user,
                    originalFileName,
                    storedFileName,
                    determineFileType(file, extension),
                    file.getSize(),
                    targetPath.toString(),
                    DocumentStatus.UPLOADED
            );

            document = documentRepository.save(document);

            document.setStatus(DocumentStatus.PROCESSING);
            document = documentRepository.save(document);

            try {

                documentIngestionService.ingest(
                        document,
                        targetPath
                );

                document.setStatus(DocumentStatus.READY);
                document = documentRepository.save(document);

            } catch (Exception ingestionException) {

                document.setStatus(DocumentStatus.FAILED);
                documentRepository.save(document);

                throw new IllegalStateException(
                        "Document was uploaded but RAG ingestion failed.",
                        ingestionException
                );
            }

            return document;

        } catch (IOException exception) {

            if (targetPath != null) {

                try {
                    Files.deleteIfExists(targetPath);
                } catch (IOException ignored) {
                    // Nothing else can be done here.
                }
            }

            throw new IllegalStateException(
                    "Failed to store the uploaded file.",
                    exception
            );
        }
    }

    private Document uploadToSupabase(
            MultipartFile file,
            User user,
            String originalFileName,
            String extension,
            String storedFileName
    ) {

        String objectPath =
                "user-" + user.getId() + "/" + storedFileName;

        Path temporaryPath = null;

        try {

            try (InputStream inputStream = file.getInputStream()) {

                supabaseStorageService.upload(
                        inputStream,
                        objectPath,
                        determineFileType(file, extension)
                );
            }

            Document document = new Document(
                    user,
                    originalFileName,
                    storedFileName,
                    determineFileType(file, extension),
                    file.getSize(),
                    objectPath,
                    DocumentStatus.UPLOADED
            );

            document = documentRepository.save(document);

            document.setStatus(DocumentStatus.PROCESSING);
            document = documentRepository.save(document);

            temporaryPath = Files.createTempFile(
                    "docify-ingestion-",
                    extension
            );

            supabaseStorageService.download(
                    objectPath,
                    temporaryPath
            );

            try {

                documentIngestionService.ingest(
                        document,
                        temporaryPath
                );

                document.setStatus(DocumentStatus.READY);
                document = documentRepository.save(document);

            } catch (Exception ingestionException) {

                document.setStatus(DocumentStatus.FAILED);
                documentRepository.save(document);

                throw new IllegalStateException(
                        "Document was uploaded but RAG ingestion failed.",
                        ingestionException
                );
            }

            return document;

        } catch (IOException exception) {

            try {
                supabaseStorageService.delete(objectPath);
            } catch (Exception ignored) {
                // Preserve the original failure.
            }

            throw new IllegalStateException(
                    "Failed to process the uploaded file.",
                    exception
            );

        } catch (RuntimeException exception) {

            try {
                supabaseStorageService.delete(objectPath);
            } catch (Exception ignored) {
                // Preserve the original failure.
            }

            throw exception;

        } finally {

            if (temporaryPath != null) {

                try {
                    Files.deleteIfExists(temporaryPath);
                } catch (IOException ignored) {
                    // Temporary cleanup failure does not affect the result.
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(
            String userEmail
    ) {

        User user = findUserByEmail(userEmail);

        return documentRepository
                .findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(DocumentResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteDocument(
            Long documentId,
            String userEmail
    ) {

        User user = findUserByEmail(userEmail);

        Document document = documentRepository
                .findByIdAndUserId(
                        documentId,
                        user.getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Document not found."
                        )
                );

        jdbcTemplate.update(
                """
                DELETE FROM vector_store
                WHERE metadata->>'documentId' = ?
                """,
                documentId.toString()
        );

        List<Conversation> conversations =
                conversationRepository
                        .findAllByDocumentIdAndUserId(
                                documentId,
                                user.getId()
                        );

        for (Conversation conversation : conversations) {

            messageRepository.deleteAllByConversationId(
                    conversation.getId()
            );
        }

        if (!conversations.isEmpty()) {

            conversationRepository.deleteAll(
                    conversations
            );
        }

        deleteStoredFile(document);

        documentRepository.delete(document);
    }

    private void deleteStoredFile(Document document) {

        String storagePath = document.getStoragePath();

        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        if (isSupabaseStorage()) {

            try {

                supabaseStorageService.delete(
                        storagePath
                );

            } catch (Exception exception) {

                throw new IllegalStateException(
                        "Failed to delete the stored file from Supabase Storage.",
                        exception
                );
            }

            return;
        }

        try {

            Path filePath = Path.of(
                            storagePath
                    )
                    .toAbsolutePath()
                    .normalize();

            Path storageRoot = documentStoragePath
                    .toAbsolutePath()
                    .normalize();

            if (!storageRoot.equals(filePath.getParent())) {

                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Files.deleteIfExists(filePath);

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to delete the stored file.",
                    exception
            );
        }
    }

    private boolean isSupabaseStorage() {

        return "supabase".equalsIgnoreCase(
                storageMode
        );
    }

    private User findUserByEmail(String email) {

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "Authenticated user no longer exists."
                )
        );
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select a file to upload."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "File size must not exceed 20 MB."
            );
        }

        String originalFileName = sanitizeFileName(
                file.getOriginalFilename()
        );

        if (originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "File name is required."
            );
        }

        if (originalFileName.length() > 255) {

            throw new IllegalArgumentException(
                    "File name must not exceed 255 characters."
            );
        }

        String extension = getExtension(
                originalFileName
        );

        if (!ALLOWED_EXTENSIONS.contains(extension)) {

            throw new IllegalArgumentException(
                    "Only PDF, DOCX, and TXT files are supported."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || contentType.isBlank()) {

            throw new IllegalArgumentException(
                    "File content type could not be determined."
            );
        }

        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new IllegalArgumentException(
                    "Unsupported file type."
            );
        }

        if (!isContentTypeCompatible(
                extension,
                contentType
        )) {

            throw new IllegalArgumentException(
                    "File extension does not match the declared file type."
            );
        }
    }

    private void validateDetectedFileType(
            MultipartFile file,
            String extension
    ) {

        try (InputStream inputStream = file.getInputStream()) {

            String detectedType = tika.detect(
                    inputStream,
                    file.getOriginalFilename()
            );

            if (detectedType == null || detectedType.isBlank()) {
                return;
            }

            if ("application/octet-stream".equalsIgnoreCase(
                    detectedType
            )) {
                return;
            }

            String expectedType = determineExpectedContentType(
                    extension
            );

            if (!expectedType.equalsIgnoreCase(
                    detectedType
            )) {

                throw new IllegalArgumentException(
                        "The actual file content does not match the selected file type."
                );
            }

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to inspect the uploaded file.",
                    exception
            );
        }
    }

    private boolean isContentTypeCompatible(
            String extension,
            String contentType
    ) {

        return switch (extension) {

            case ".pdf" ->
                    "application/pdf".equalsIgnoreCase(
                            contentType
                    );

            case ".docx" ->
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            .equalsIgnoreCase(contentType);

            case ".txt" ->
                    "text/plain".equalsIgnoreCase(contentType);

            default ->
                    false;
        };
    }

    private String determineExpectedContentType(
            String extension
    ) {

        return switch (extension) {

            case ".pdf" ->
                    "application/pdf";

            case ".docx" ->
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            case ".txt" ->
                    "text/plain";

            default ->
                    "application/octet-stream";
        };
    }

    private String sanitizeFileName(String fileName) {

        if (fileName == null) {
            return "";
        }

        String normalized = fileName.replace(
                "\\",
                "/"
        );

        int lastSlash = normalized.lastIndexOf('/');

        if (lastSlash >= 0) {

            normalized = normalized.substring(
                    lastSlash + 1
            );
        }

        return normalized.trim();
    }

    private String getExtension(String fileName) {

        int lastDot = fileName.lastIndexOf('.');

        if (lastDot < 0) {
            return "";
        }

        return fileName
                .substring(lastDot)
                .toLowerCase();
    }

    private String determineFileType(
            MultipartFile file,
            String extension
    ) {

        String contentType = file.getContentType();

        if (contentType != null
                && !contentType.isBlank()) {

            return contentType;
        }

        return determineExpectedContentType(extension);
    }
}