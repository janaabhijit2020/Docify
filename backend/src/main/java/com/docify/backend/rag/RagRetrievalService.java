package com.docify.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagRetrievalService {

    private final VectorStore vectorStore;

    public RagRetrievalService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public List<Document> retrieve(
            String question,
            Long userId,
            Long documentId,
            int topK
    ) {
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException(
                    "Question cannot be empty."
            );
        }

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID cannot be null."
            );
        }

        if (documentId == null) {
            throw new IllegalArgumentException(
                    "Document ID cannot be null."
            );
        }

        if (topK <= 0) {
            throw new IllegalArgumentException(
                    "Top K must be greater than zero."
            );
        }

        String filterExpression =
                "userId == '" + userId + "'" +
                        " && documentId == '" + documentId + "'";

        SearchRequest searchRequest =
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .filterExpression(filterExpression)
                        .build();

        return vectorStore.similaritySearch(searchRequest);
    }
}