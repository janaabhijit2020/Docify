package com.docify.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DocumentChunker {

    private final TokenTextSplitter textSplitter;

    public DocumentChunker() {

        this.textSplitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(350)
                .withMinChunkLengthToEmbed(20)
                .withMaxNumChunks(10000)
                .build();
    }

    public List<Document> chunk(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Text cannot be empty."
            );
        }

        Document document = new Document(text);

        return textSplitter.apply(List.of(document));
    }
}