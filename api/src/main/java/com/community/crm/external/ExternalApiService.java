package com.community.crm.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Service for handling external API integrations
 * Follows the Strategy pattern for different API providers
 */
@Service
public class ExternalApiService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExternalApiService.class);
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;
    
    @Value("${app.external-apis.google-maps.api-key:}")
    private String googleMapsApiKey;
    
    @Value("${app.external-apis.google-maps.base-url:https://places.googleapis.com/v1/places:searchText}")
    private String googleMapsBaseUrl;
    
    public ExternalApiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newFixedThreadPool(10);
    }
    
    /**
     * Generic method to call external APIs with proper error handling
     */
    public <T> CompletableFuture<ApiResponse<T>> callExternalApi(
            String url, 
            HttpMethod method, 
            HttpEntity<?> request, 
            Class<T> responseType,
            String apiName) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                long startTime = System.currentTimeMillis();
                ResponseEntity<T> response = restTemplate.exchange(url, method, request, responseType);
                long executionTime = System.currentTimeMillis() - startTime;
                
                logger.info("External API call successful: {} - {}ms", apiName, executionTime);
                
                return ApiResponse.<T>builder()
                    .success(true)
                    .data(response.getBody())
                    .statusCode(response.getStatusCode().value())
                    .executionTimeMs(executionTime)
                    .build();
                    
            } catch (Exception e) {
                logger.error("External API call failed: {} - {}", apiName, e.getMessage(), e);
                return ApiResponse.<T>builder()
                    .success(false)
                    .error(e.getMessage())
                    .statusCode(500)
                    .build();
            }
        }, executorService);
    }
    
    /**
     * Specific method for Google Places API calls
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<ApiResponse<Map<String, Object>>> callGooglePlacesApi(
            Map<String, Object> requestBody) {
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("X-Goog-Api-Key", googleMapsApiKey);
        headers.set("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.location,places.types,places.id,places.websiteUri,places.nationalPhoneNumber");
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        CompletableFuture<ApiResponse<Map>> future = callExternalApi(
            googleMapsBaseUrl,
            HttpMethod.POST,
            request,
            Map.class,
            "Google Places API"
        );
        
        return future.thenApply(response -> {
            if (response.isSuccess()) {
                return ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .data((Map<String, Object>) response.getData())
                    .statusCode(response.getStatusCode())
                    .executionTimeMs(response.getExecutionTimeMs())
                    .build();
            } else {
                return ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .error(response.getError())
                    .statusCode(response.getStatusCode())
                    .executionTimeMs(response.getExecutionTimeMs())
                    .build();
            }
        });
    }
    
    /**
     * Shutdown method for graceful cleanup
     */
    public void shutdown() {
        executorService.shutdown();
    }
}