package com.docify.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Bean
    public Path documentStoragePath(
            @Value("${file.storage.documents}") String storagePath
    ) {
        return Paths.get(storagePath)
                .toAbsolutePath()
                .normalize();
    }
}