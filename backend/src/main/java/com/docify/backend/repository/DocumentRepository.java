package com.docify.backend.repository;

import com.docify.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserId(Long userId);

    List<Document> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Document> findByIdAndUserId(Long documentId, Long userId);
}