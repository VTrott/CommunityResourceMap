package com.community.crm.place;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.stream.Collectors;
import java.lang.Math;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class PlaceSearchController {

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Category mapping based on Google Places types
    private static final Map<String, List<String>> GOOGLE_PLACES_CATEGORY_MAP;
    
    static {
        Map<String, List<String>> map = new HashMap<>();
        
        // Healthcare
        map.put("hospital", List.of("Healthcare"));
        map.put("doctor", List.of("Healthcare"));
        map.put("pharmacy", List.of("Healthcare"));
        map.put("dentist", List.of("Healthcare"));
        map.put("veterinary_care", List.of("Healthcare"));
        map.put("physiotherapist", List.of("Healthcare"));
        map.put("health", List.of("Healthcare"));
        
        // Food Assistance
        map.put("meal_takeaway", List.of("Food Assistance"));
        map.put("restaurant", List.of("Food Assistance"));
        map.put("food", List.of("Food Assistance"));
        map.put("bakery", List.of("Food Assistance"));
        map.put("grocery_or_supermarket", List.of("Food Assistance"));
        map.put("convenience_store", List.of("Food Assistance"));
        
        // Housing
        map.put("lodging", List.of("Housing"));
        map.put("real_estate_agency", List.of("Housing"));
        map.put("room", List.of("Housing"));
        
        // Education
        map.put("school", List.of("Education"));
        map.put("university", List.of("Education"));
        map.put("library", List.of("Education"));
        map.put("book_store", List.of("Education"));
        
        // Legal Aid
        map.put("lawyer", List.of("Legal Aid"));
        map.put("courthouse", List.of("Legal Aid"));
        map.put("local_government_office", List.of("Legal Aid"));
        
        // Family Services
        map.put("social_services", List.of("Family Services"));
        map.put("child_care", List.of("Family Services"));
        map.put("community_center", List.of("Family Services"));
        
        // Employment
        map.put("employment_agency", List.of("Employment"));
        map.put("job_center", List.of("Employment"));
        map.put("unemployment_office", List.of("Employment"));
        
        // Emergency Services
        map.put("police", List.of("Emergency Services"));
        map.put("fire_station", List.of("Emergency Services"));
        map.put("ambulance", List.of("Emergency Services"));
        
        GOOGLE_PLACES_CATEGORY_MAP = Collections.unmodifiableMap(map);
    }

    private static final Map<String, String> CATEGORY_ID_MAP;
    
    static {
        Map<String, String> map = new HashMap<>();
        map.put("Food Assistance", "1");
        map.put("Healthcare", "2");
        map.put("Housing", "3");
        map.put("Legal Aid", "4");
        map.put("Family Services", "5");
        map.put("Employment", "6");
        map.put("Education", "7");
        map.put("Community Centers", "8");
        map.put("Emergency Services", "9");
        CATEGORY_ID_MAP = Collections.unmodifiableMap(map);
    }

        @GetMapping("/test")
        public ResponseEntity<Map<String, Object>> test() {
            Map<String, Object> response = new HashMap<>();
            response.put("apiKeyLength", googleMapsApiKey != null ? googleMapsApiKey.length() : 0);
            response.put("apiKeyConfigured", googleMapsApiKey != null && !googleMapsApiKey.isEmpty());
            response.put("message", "Test endpoint working");
            return ResponseEntity.ok(response);
        }
        
        @GetMapping("/test-coords/{latitude}/{longitude}")
        public ResponseEntity<Map<String, Object>> testCoords(
                @PathVariable String latitude,
                @PathVariable String longitude) {
            try {
                double lat = Double.parseDouble(latitude);
                double lng = Double.parseDouble(longitude);
                Map<String, Object> response = new HashMap<>();
                response.put("latitude", lat);
                response.put("longitude", lng);
                response.put("message", "Coordinates received successfully");
                return ResponseEntity.ok(response);
            } catch (NumberFormatException e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid number format");
                errorResponse.put("latitude", latitude);
                errorResponse.put("longitude", longitude);
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }
        
    



        @PostMapping("/search/5-miles")
        public ResponseEntity<Map<String, Object>> search5Miles(@RequestBody Map<String, Object> request) {
            try {
                double latitude = Double.parseDouble(request.get("latitude").toString());
                double longitude = Double.parseDouble(request.get("longitude").toString());
                @SuppressWarnings("unchecked")
                List<String> categoryIds = (List<String>) request.get("categoryIds");
                return searchWithRadius(5, latitude, longitude, categoryIds);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid coordinates");
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }
        
        @PostMapping("/search/10-miles")
        public ResponseEntity<Map<String, Object>> search10Miles(@RequestBody Map<String, Object> request) {
            try {
                double latitude = Double.parseDouble(request.get("latitude").toString());
                double longitude = Double.parseDouble(request.get("longitude").toString());
                @SuppressWarnings("unchecked")
                List<String> categoryIds = (List<String>) request.get("categoryIds");
                return searchWithRadius(10, latitude, longitude, categoryIds);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid coordinates");
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }
        
        @PostMapping("/search/25-miles")
        public ResponseEntity<Map<String, Object>> search25Miles(@RequestBody Map<String, Object> request) {
            try {
                double latitude = Double.parseDouble(request.get("latitude").toString());
                double longitude = Double.parseDouble(request.get("longitude").toString());
                @SuppressWarnings("unchecked")
                List<String> categoryIds = (List<String>) request.get("categoryIds");
                return searchWithRadius(25, latitude, longitude, categoryIds);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid coordinates");
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }
        
        @PostMapping("/search/50-miles")
        public ResponseEntity<Map<String, Object>> search50Miles(@RequestBody Map<String, Object> request) {
            try {
                double latitude = Double.parseDouble(request.get("latitude").toString());
                double longitude = Double.parseDouble(request.get("longitude").toString());
                @SuppressWarnings("unchecked")
                List<String> categoryIds = (List<String>) request.get("categoryIds");
                return searchWithRadius(50, latitude, longitude, categoryIds);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid coordinates");
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }
        
        private ResponseEntity<Map<String, Object>> searchWithRadius(int radiusMiles, double latitude, double longitude, List<String> categoryIds) {
            System.out.println("=== SEARCH WITH RADIUS: " + radiusMiles + " MILES ===");
            System.out.println("Using coordinates: " + latitude + ", " + longitude);
            
            try {
                // Convert miles to meters (Google Places API uses meters)
                int radiusMeters = radiusMiles * 1609; // Convert miles to meters
                
                // Cap at Google Places API limit (50km = 50,000 meters)
                if (radiusMeters > 50000) {
                    radiusMeters = 50000;
                    System.out.println("Radius capped at 50km (Google Places API limit)");
                }
                
                System.out.println("Using radius: " + radiusMeters + " meters (" + radiusMiles + " miles)");
                
                List<Map<String, Object>> allPlaces = new ArrayList<>();
                String query = "community services"; // Broader search term
                System.out.println("Searching for '" + query + "' at " + latitude + ", " + longitude + " with " + radiusMiles + " mile radius");
                
                List<Map<String, Object>> places = searchGooglePlaces(query, latitude, longitude, radiusMeters);
                allPlaces.addAll(places);
                System.out.println("Found " + places.size() + " places for " + query);
                
                List<String> additionalQueries = Arrays.asList("hospital", "pharmacy", "library");
                int maxResultsPerQuery = Math.min(20, radiusMiles * 2); // Adjust results based on radius
                
                for (String additionalQuery : additionalQueries) {
                    System.out.println("Searching for " + additionalQuery + " (max " + maxResultsPerQuery + " results)");
                    List<Map<String, Object>> additionalPlaces = searchGooglePlacesWithLimit(additionalQuery, latitude, longitude, radiusMeters, maxResultsPerQuery);
                    System.out.println("Found " + additionalPlaces.size() + " places for " + additionalQuery);
                    allPlaces.addAll(additionalPlaces);
                }
                
                List<Map<String, Object>> convertedPlaces = new ArrayList<>();
                for (Map<String, Object> googlePlace : allPlaces) {
                    try {
                        Map<String, Object> convertedPlace = convertGooglePlaceToPlace(googlePlace);
                        
                        Double placeLat = (Double) convertedPlace.get("latitude");
                        Double placeLng = (Double) convertedPlace.get("longitude");
                        
                        if (placeLat != null && placeLng != null) {
                            double distance = calculateDistance(latitude, longitude, placeLat, placeLng);
                            convertedPlace.put("distance", Math.round(distance * 10) / 10.0);
                            
                            if (distance <= radiusMiles) {
                                if (categoryIds == null || categoryIds.isEmpty() || matchesCategoryFilter(convertedPlace, categoryIds)) {
                                    convertedPlaces.add(convertedPlace);
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error converting place: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("content", convertedPlaces);
                response.put("page", 0);
                response.put("size", convertedPlaces.size());
                response.put("totalElements", (long) convertedPlaces.size());
                response.put("totalPages", 1);

                System.out.println("=== SEARCH COMPLETE: " + convertedPlaces.size() + " places for " + radiusMiles + " mile radius ===");
                return ResponseEntity.ok(response);

            } catch (Exception e) {
                System.err.println("Error in place search: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.internalServerError().build();
            }
        }

    private List<Map<String, Object>> searchGooglePlaces(String query, double latitude, double longitude, int radiusMeters) {
        return searchGooglePlacesWithLimit(query, latitude, longitude, radiusMeters, 20);
    }
    
    private List<Map<String, Object>> searchGooglePlacesWithLimit(String query, double latitude, double longitude, int radiusMeters, int maxResults) {
        // Use the new Places API with text search
        String url = "https://places.googleapis.com/v1/places:searchText";
        System.out.println("Making Google Places API request to: " + url);

        try {
            // Create request body for the new Places API
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("textQuery", query);
            System.out.println("Request body: " + requestBody);
            
            Map<String, Object> locationBias = new HashMap<>();
            Map<String, Object> circle = new HashMap<>();
            Map<String, Object> center = new HashMap<>();
            center.put("latitude", latitude);
            center.put("longitude", longitude);
            circle.put("center", center);
            circle.put("radius", radiusMeters);
            locationBias.put("circle", circle);
            requestBody.put("locationBias", locationBias);
            
            requestBody.put("maxResultCount", maxResults);
            requestBody.put("languageCode", "en");

            // Set headers for the new API
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Goog-Api-Key", googleMapsApiKey);
            headers.set("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.location,places.types,places.id,places.websiteUri,places.nationalPhoneNumber");

            org.springframework.http.HttpEntity<Map<String, Object>> request = new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            System.out.println("Google Places API response status: " + response.getStatusCode());
            System.out.println("Google Places API response body: " + response.getBody());
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> places = (List<Map<String, Object>>) response.getBody().get("places");
            System.out.println("Extracted " + (places != null ? places.size() : 0) + " places from response");
            return places != null ? places : Collections.emptyList();
        } catch (RestClientException e) {
            System.err.println("Google Places API error: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private Map<String, Object> convertGooglePlaceToPlace(Map<String, Object> googlePlace) {
        Map<String, Object> place = new HashMap<>();
        
        place.put("id", googlePlace.get("id"));
        
        // Extract display name from the new API format
        String displayName = null;
        Object displayNameObj = googlePlace.get("displayName");
        if (displayNameObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> displayNameMap = (Map<String, Object>) displayNameObj;
            displayName = (String) displayNameMap.get("text");
        } else if (displayNameObj instanceof String) {
            displayName = (String) displayNameObj;
        }
        place.put("name", displayName);
        
        place.put("description", "Community resource found via Google Places");
        place.put("website", googlePlace.get("websiteUri"));
        place.put("phone", googlePlace.get("nationalPhoneNumber"));
        place.put("addressLine1", googlePlace.get("formattedAddress"));
        
        // Parse address components
        String formattedAddress = (String) googlePlace.get("formattedAddress");
        if (formattedAddress != null) {
            String[] parts = formattedAddress.split(",");
            if (parts.length >= 2) {
                place.put("city", parts.length >= 3 ? parts[parts.length - 3].trim() : "");
                String statePart = parts[parts.length - 2].trim();
                // Extract state abbreviation (usually 2 letters)
                String state = statePart.matches(".*\\b([A-Z]{2})\\b.*") ? 
                    statePart.replaceAll(".*\\b([A-Z]{2})\\b.*", "$1") : statePart;
                place.put("state", state);
                
                // Extract postal code
                String zipMatch = formattedAddress.replaceAll(".*\\b(\\d{5}(?:-\\d{4})?)\\b.*", "$1");
                place.put("postalCode", zipMatch.matches("\\d{5}(-\\d{4})?") ? zipMatch : "");
            }
        }
        
        // Extract coordinates from new API format
        @SuppressWarnings("unchecked")
        Map<String, Object> location = (Map<String, Object>) googlePlace.get("location");
        if (location != null) {
            place.put("latitude", location.get("latitude"));
            place.put("longitude", location.get("longitude"));
        }
        
        place.put("status", "active");
        place.put("createdAt", new Date().toInstant().toString());
        place.put("updatedAt", new Date().toInstant().toString());
        
        // Convert categories from new API format
        @SuppressWarnings("unchecked")
        List<String> types = (List<String>) googlePlace.get("types");
        List<Map<String, Object>> categories = getCategoriesFromGooglePlace(displayName, types);
        place.put("categories", categories);
        
        return place;
    }

    private List<Map<String, Object>> getCategoriesFromGooglePlace(String name, List<String> types) {
        Set<String> categoryNames = new HashSet<>();
        
        if (types != null) {
            for (String type : types) {
                List<String> mappedCategories = GOOGLE_PLACES_CATEGORY_MAP.get(type);
                if (mappedCategories != null) {
                    categoryNames.addAll(mappedCategories);
                }
            }
        }
        
        if (categoryNames.isEmpty() && name != null) {
            String lowerName = name.toLowerCase();
            if (lowerName.contains("hospital") || lowerName.contains("medical") || lowerName.contains("health")) {
                categoryNames.add("Healthcare");
            } else if (lowerName.contains("library")) {
                categoryNames.add("Education");
            } else if (lowerName.contains("shelter") || lowerName.contains("housing")) {
                categoryNames.add("Housing");
            } else if (lowerName.contains("food") || lowerName.contains("bank")) {
                categoryNames.add("Food Assistance");
            } else {
                categoryNames.add("Community Centers"); // Default fallback
            }
        }
        
        return categoryNames.stream()
            .map(categoryName -> {
                Map<String, Object> category = new HashMap<>();
                category.put("id", CATEGORY_ID_MAP.getOrDefault(categoryName, UUID.randomUUID().toString()));
                category.put("name", categoryName);
                category.put("slug", categoryName.toLowerCase().replace(" ", "-"));
                return category;
            })
            .collect(Collectors.toList());
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 3959; // Earth's radius in miles
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Check if a place matches the category filter
     */
    private boolean matchesCategoryFilter(Map<String, Object> place, List<String> categoryIds) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> categories = (List<Map<String, Object>>) place.get("categories");
        
        if (categories == null || categories.isEmpty()) {
            return false;
        }
        
        Set<String> placeCategoryIds = categories.stream()
                .map(cat -> cat.get("id").toString())
                .collect(Collectors.toSet());
        
        return categoryIds.stream().anyMatch(placeCategoryIds::contains);
    }
}
