package com.community.crm.place;

import com.community.crm.place.PlaceSearchResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Place Search Controller following clean architecture principles
 * - Separates concerns between controller and business logic
 * - Uses dependency injection properly
 * - Implements proper error handling
 * - Follows RESTful conventions
 */
@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class PlaceSearchController {
    
    private final PlaceSearchService placeSearchService;

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    public PlaceSearchController(PlaceSearchService placeSearchService) {
        this.placeSearchService = placeSearchService;
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
            Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", new Date());
        response.put("apiKeyLength", googleMapsApiKey.length());
        response.put("apiKeyConfigured", !googleMapsApiKey.isEmpty());
            return ResponseEntity.ok(response);
        }
        
    /**
     * Test endpoint with coordinates
     */
    @GetMapping("/test-coords")
        public ResponseEntity<Map<String, Object>> testCoords(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint working with coordinates");
        response.put("latitude", latitude);
        response.put("longitude", longitude);
        response.put("apiKeyLength", googleMapsApiKey.length());
        response.put("apiKeyConfigured", !googleMapsApiKey.isEmpty());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search places within 5 miles
     */
        @PostMapping("/search/5-miles")
    public ResponseEntity<Map<String, Object>> search5Miles(
            @RequestBody Map<String, Object> request) {
        
        return searchWithRadiusSync(5, request);
    }
    
    /**
     * Search places within 10 miles
     */
        @PostMapping("/search/10-miles")
    public ResponseEntity<Map<String, Object>> search10Miles(
            @RequestBody Map<String, Object> request) {
        
        return searchWithRadiusSync(10, request);
    }
    
    /**
     * Search places within 25 miles
     */
    @PostMapping("/search/25-miles")
    public ResponseEntity<Map<String, Object>> search25Miles(
            @RequestBody Map<String, Object> request) {
        
        return searchWithRadiusSync(25, request);
    }
    
    /**
     * Search places within 50 miles
     */
    @PostMapping("/search/50-miles")
    public ResponseEntity<Map<String, Object>> search50Miles(
            @RequestBody Map<String, Object> request) {
        
        return searchWithRadiusSync(50, request);
    }
    
    /**
     * Generic search method with specified radius (synchronous for validation)
     */
    @PostMapping("/search/{radiusMiles}-miles")
    public ResponseEntity<Map<String, Object>> searchWithRadiusSync(
            @PathVariable("radiusMiles") int radiusMiles,
            @RequestBody Map<String, Object> request) {
        
        try {
            // Extract parameters from request
            Double latitude = extractDouble(request, "latitude");
            Double longitude = extractDouble(request, "longitude");
            @SuppressWarnings("unchecked")
            List<String> categoryIds = (List<String>) request.get("categoryIds");
            
            // Validate required parameters
            if (latitude == null || longitude == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Latitude and longitude are required",
                    "status", "BAD_REQUEST"
                ));
            }
            
            // Perform the actual search
            try {
                PlaceSearchResult searchResult = placeSearchService.searchPlaces(
                    radiusMiles, 
                    latitude, 
                    longitude, 
                    categoryIds
                ).get(); // Block to get the result synchronously
                
                // Convert to the expected response format
                Map<String, Object> response = new HashMap<>();
                response.put("content", searchResult.getPlaces());
                response.put("totalElements", searchResult.getTotalElements());
                response.put("page", 0);
                response.put("size", searchResult.getPlaces().size());
                response.put("totalPages", 1);
                response.put("radiusMiles", radiusMiles);
                response.put("latitude", latitude);
                response.put("longitude", longitude);
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Search failed: " + e.getMessage());
                errorResponse.put("status", "INTERNAL_SERVER_ERROR");
                return ResponseEntity.status(500).body(errorResponse);
            }
                
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request: " + e.getMessage());
            errorResponse.put("status", "BAD_REQUEST");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Helper method to extract double values from request
     */
    private Double extractDouble(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        } else if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
