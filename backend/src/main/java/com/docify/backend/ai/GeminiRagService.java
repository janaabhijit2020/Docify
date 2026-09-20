package com.docify.backend.ai;

import com.docify.backend.rag.RagPromptService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeminiRagService {

    private final ChatClient chatClient;
    private final RagPromptService ragPromptService;

    public GeminiRagService(
            ChatClient.Builder chatClientBuilder,
            RagPromptService ragPromptService
    ) {
        this.chatClient = chatClientBuilder.build();
        this.ragPromptService = ragPromptService;
    }

    /**
     * Generates an answer using Gemini and the retrieved
     * document chunks.
     */
    public String generateAnswer(
            String question,
            List<Document> documents
    ) {

        String prompt =
                ragPromptService.buildPrompt(
                        question,
                        documents
                );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}