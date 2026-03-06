package com.oop.EventTicketingSystem.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final BlobContainerClient containerClient;

    public FileStorageService(
            @Value("${azure.storage.connection-string}") String connectionString,
            @Value("${azure.storage.container-name}") String containerName) {
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
        this.containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!this.containerClient.exists()) {
            this.containerClient.create();
        }
    }

    /**
     * Stores a file in Azure Blob Storage and returns the full blob URL.
     */
    public String storeFile(MultipartFile file) {
        String fileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());

        if (fileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
        }

        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

        try {
            BlobClient blobClient = containerClient.getBlobClient(uniqueFileName);
            blobClient.upload(file.getInputStream(), file.getSize(), true);
            return blobClient.getBlobUrl();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    /**
     * Deletes a file from Azure Blob Storage.
     * Accepts either the blob name or a full blob URL.
     */
    public void deleteFile(String fileNameOrUrl) {
        String blobName = fileNameOrUrl;
        // If a full URL was passed, extract the blob name from the last path segment
        if (fileNameOrUrl.startsWith("http")) {
            blobName = fileNameOrUrl.substring(fileNameOrUrl.lastIndexOf("/") + 1);
        }
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        blobClient.deleteIfExists();
    }
}
