package com.docify.backend.rag;

import com.docify.backend.entity.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;

@Service
public class DocumentIngestionService {

    private final DocumentTextExtractor documentTextExtractor;
    private final DocumentChunker documentChunker;
    private final VectorStore vectorStore;

    public DocumentIngestionService(
            DocumentTextExtractor documentTextExtractor,
            DocumentChunker documentChunker,
            VectorStore vectorStore
    ) {
        this.documentTextExtractor = documentTextExtractor;
        this.documentChunker = documentChunker;
        this.vectorStore = vectorStore;
    }

    public int ingest(Document document, Path filePath) {

        if (document == null) {
            throw new IllegalArgumentException(
                    "Document cannot be null."
            );
        }

        if (filePath == null) {
            throw new IllegalArgumentException(
                    "File path cannot be null."
            );
        }

        String extractedText =
                documentTextExtractor.extractText(filePath);

        List<org.springframework.ai.document.Document> chunks =
                documentChunker.chunk(extractedText);

        if (chunks.isEmpty()) {
            throw new IllegalStateException(
                    "No chunks were generated from the document."
            );
        }

        for (org.springframework.ai.document.Document chunk : chunks) {

            chunk.getMetadata().put(
                    "documentId",
                    document.getId().toString()
            );

            chunk.getMetadata().put(
                    "fileName",
                    document.getOriginalFileName()
            );

            chunk.getMetadata().put(
                    "userId",
                    document.getUser().getId().toString()
            );
        }

        vectorStore.add(chunks);

        return chunks.size();
    }
}