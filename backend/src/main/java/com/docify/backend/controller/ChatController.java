package com.docify.backend.controller;

import com.docify.backend.dto.chat.ChatRequest;
import com.docify.backend.dto.chat.ChatResponse;
import com.docify.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        ChatResponse response =
                chatService.chat(
                        request,
                        userEmail
                );

        return ResponseEntity.ok(response);
    }
}