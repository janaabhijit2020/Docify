package com.docify.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class SupabaseStorageService {

    private final RestClient restClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String bucketName;

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.service-role-key:}") String serviceRoleKey,
            @Value("${supabase.storage.bucket:docify-documents}") String bucketName
    ) {
        this.supabaseUrl = removeTrailingSlash(supabaseUrl);
        this.serviceRoleKey = serviceRoleKey;
        this.bucketName = bucketName;

        this.restClient = RestClient.builder().build();
    }

    public void upload(
            InputStream inputStream,
            String objectPath,
            String contentType
    ) throws IOException {

        validateConfiguration();

        byte[] fileBytes = inputStream.readAllBytes();

        String url = buildObjectUrl(objectPath);

        restClient
                .post()
                .uri(url)
                .header("apikey", serviceRoleKey)
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        contentType != null && !contentType.isBlank()
                                ? contentType
                                : MediaType.APPLICATION_OCTET_STREAM_VALUE
                )
                .header("x-upsert", "true")
                .body(new ByteArrayResource(fileBytes))
                .retrieve()
                .toBodilessEntity();
    }

    public void download(
            String objectPath,
            Path targetPath
    ) throws IOException {

        validateConfiguration();

        String url = buildObjectUrl(objectPath);

        byte[] fileBytes = restClient
                .get()
                .uri(url)
                .header("apikey", serviceRoleKey)
                .retrieve()
                .body(byte[].class);

        if (fileBytes == null) {
            throw new IOException(
                    "Supabase Storage returned an empty response."
            );
        }

        Path parent = targetPath.getParent();

        if (parent != null) {
            Files.createDirectories(parent);
        }

        Files.write(targetPath, fileBytes);
    }

    public void delete(String objectPath) {

        validateConfiguration();

        String url = buildObjectUrl(objectPath);

        restClient
                .delete()
                .uri(url)
                .header("apikey", serviceRoleKey)
                .retrieve()
                .toBodilessEntity();
    }

    private String buildObjectUrl(String objectPath) {

        return supabaseUrl
                + "/storage/v1/object/"
                + bucketName
                + "/"
                + encodeObjectPath(objectPath);
    }

    private void validateConfiguration() {

        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            throw new IllegalStateException(
                    "SUPABASE_URL is not configured."
            );
        }

        if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new IllegalStateException(
                    "SUPABASE_SERVICE_ROLE_KEY is not configured."
            );
        }

        if (bucketName == null || bucketName.isBlank()) {
            throw new IllegalStateException(
                    "SUPABASE_STORAGE_BUCKET is not configured."
            );
        }
    }

    private String removeTrailingSlash(String value) {

        if (value == null) {
            return "";
        }

        return value.replaceAll("/+$", "");
    }

    private String encodeObjectPath(String objectPath) {

        return objectPath
                .replace("\\", "/")
                .replace(" ", "%20");
    }
}