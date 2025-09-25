package com.community.crm.external;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;

/**
 * Service for handling Google Service Account authentication
 * Alternative to OAuth 2.0 for server-to-server communication
 */
@Service
public class GoogleServiceAccountService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleServiceAccountService.class);
    
    @Value("${app.external-apis.google-service-account.path:}")
    private String serviceAccountPath;
    
    @Value("${app.external-apis.google-service-account.scopes:https://www.googleapis.com/auth/cloud-platform}")
    private String scopes;
    
    private GoogleCredentials credentials;
    
    @PostConstruct
    public void init() {
        loadCredentials();
    }
    
    /**
     * Get valid access token using Service Account
     */
    public CompletableFuture<String> getValidAccessToken() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (credentials == null) {
                    loadCredentials();
                }
                
                if (credentials != null) {
                    credentials.refreshIfExpired();
                    return credentials.getAccessToken().getTokenValue();
                } else {
                    logger.warn("No service account credentials available");
                    return null;
                }
                
            } catch (Exception e) {
                logger.error("Error getting access token from service account", e);
                return null;
            }
        });
    }
    
    /**
     * Load credentials from service account file
     */
    private void loadCredentials() {
        try {
            if (serviceAccountPath != null && !serviceAccountPath.isEmpty()) {
                credentials = ServiceAccountCredentials.fromStream(
                    new FileInputStream(serviceAccountPath)
                ).createScoped(Collections.singletonList(scopes));
                
                logger.info("Service account credentials loaded successfully");
            } else {
                logger.warn("No service account path configured");
            }
        } catch (IOException e) {
            logger.error("Error loading service account credentials", e);
        }
    }
    
    /**
     * Check if service account is configured
     */
    public boolean isConfigured() {
        return credentials != null;
    }
}
