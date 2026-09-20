package com.docify.backend.rag;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class DocumentTextExtractor {

    private final Tika tika;

    public DocumentTextExtractor() {
        this.tika = new Tika();
    }

    public String extractText(Path filePath) {

        if (filePath == null) {
            throw new IllegalArgumentException(
                    "File path cannot be null."
            );
        }

        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException(
                    "Document file does not exist."
            );
        }

        if (!Files.isRegularFile(filePath)) {
            throw new IllegalArgumentException(
                    "Document path does not point to a regular file."
            );
        }

        try (InputStream inputStream =
                     Files.newInputStream(filePath)) {

            String text = tika.parseToString(inputStream);

            if (text == null || text.isBlank()) {
                throw new IllegalArgumentException(
                        "No readable text was found in the document."
                );
            }

            return text.trim();

        } catch (IOException | TikaException exception) {

            throw new IllegalStateException(
                    "Failed to extract text from the document.",
                    exception
            );
        }
    }
}