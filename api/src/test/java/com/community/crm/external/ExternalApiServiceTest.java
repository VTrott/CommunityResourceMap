package com.community.crm.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ExternalApiService
 * Tests the generic external API integration functionality
 */
@ExtendWith(MockitoExtension.class)
class ExternalApiServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ExternalApiService externalApiService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        externalApiService = new ExternalApiService(restTemplate, objectMapper);
        
        ReflectionTestUtils.setField(externalApiService, "googleMapsApiKey", "test-api-key");
        ReflectionTestUtils.setField(externalApiService, "googleMapsBaseUrl", "https://test-api.com");
    }

    @Test
    void testCallExternalApi_Success() throws Exception {
        String url = "https://test-api.com/test";
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", "success");
        responseData.put("data", "test data");
        
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);
        when(restTemplate.exchange(eq(url), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
            .thenReturn(responseEntity);

        CompletableFuture<ApiResponse<Map>> future = externalApiService.callExternalApi(
            url, HttpMethod.GET, new HttpEntity<>(new HashMap<>()), Map.class, "Test API"
        );
        
        ApiResponse<Map> result = future.get();

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertEquals("test data", result.getData().get("data"));
        assertEquals(200, result.getStatusCode());
        assertTrue(result.getExecutionTimeMs() >= 0);
    }

    @Test
    void testCallExternalApi_Failure() throws Exception {
        String url = "https://test-api.com/test";
        when(restTemplate.exchange(eq(url), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
            .thenThrow(new RuntimeException("API Error"));

        CompletableFuture<ApiResponse<Map>> future = externalApiService.callExternalApi(
            url, HttpMethod.GET, new HttpEntity<>(new HashMap<>()), Map.class, "Test API"
        );
        
        ApiResponse<Map> result = future.get();

        assertFalse(result.isSuccess());
        assertNull(result.getData());
        assertEquals("API Error", result.getError());
        assertEquals(500, result.getStatusCode());
    }

    @Test
    void testCallGooglePlacesApi_Success() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("textQuery", "test query");
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("places", new Object[]{});
        
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
            .thenReturn(responseEntity);

        CompletableFuture<ApiResponse<Map<String, Object>>> future = 
            externalApiService.callGooglePlacesApi(requestBody);
        
        ApiResponse<Map<String, Object>> result = future.get();

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertEquals(200, result.getStatusCode());
    }

    @Test
    void testCallGooglePlacesApi_Failure() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("textQuery", "test query");
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
            .thenThrow(new RuntimeException("Google API Error"));

        CompletableFuture<ApiResponse<Map<String, Object>>> future = 
            externalApiService.callGooglePlacesApi(requestBody);
        
        ApiResponse<Map<String, Object>> result = future.get();
        assertFalse(result.isSuccess());
        assertNull(result.getData());
        assertEquals("Google API Error", result.getError());
        assertEquals(500, result.getStatusCode());
    }
}
