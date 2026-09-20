package com.docify.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagPromptService {

    /**
     * Builds the prompt that will be sent to Gemini.
     *
     * The retrieved document chunks are supplied as context.
     * Gemini is instructed to answer using that context.
     */
    public String buildPrompt(
            String question,
            List<Document> documents
    ) {

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException(
                    "Question cannot be empty."
            );
        }

        if (documents == null || documents.isEmpty()) {
            return """
                    You are DOCIFY, an AI document assistant.

                    The user's question is:

                    %s

                    No relevant information was found in the user's
                    uploaded documents.

                    Do not invent or assume information from the documents.
                    Clearly tell the user that the answer could not be
                    found in the uploaded documents.
                    """.formatted(question);
        }

        StringBuilder context = new StringBuilder();

        for (int i = 0; i < documents.size(); i++) {

            Document document = documents.get(i);

            context.append("\n--- Document Chunk ")
                    .append(i + 1)
                    .append(" ---\n");

            context.append(document.getText());

            context.append("\n");
        }

        return """
                You are DOCIFY, an AI-powered document assistant.

                Your job is to answer the user's question using ONLY the
                information provided in the document context below.

                IMPORTANT RULES:

                1. Use the provided document context as your primary source.
                2. Do not invent facts that are not supported by the context.
                3. If the answer cannot be found in the context, clearly say
                   that the information is not available in the uploaded
                   document.
                4. Do not claim that something is present in the document
                   when it is not.
                5. Keep the answer clear and directly related to the question.
                6. You may combine information from multiple chunks when
                   necessary.
                7. Do not mention internal RAG implementation details unless
                   the user specifically asks about them.

                DOCUMENT CONTEXT:

                %s

                USER QUESTION:

                %s

                ANSWER:
                """.formatted(
                context,
                question
        );
    }
}