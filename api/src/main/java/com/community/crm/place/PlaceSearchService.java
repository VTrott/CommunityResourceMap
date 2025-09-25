package com.community.crm.place;

import com.community.crm.category.Category;
import com.community.crm.external.ExternalApiService;
import com.community.crm.external.GoogleServiceAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service for handling place search operations
 * Separates business logic from controller
 */
@Service
public class PlaceSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(PlaceSearchService.class);
    
    private final ExternalApiService externalApiService;
    private final GoogleServiceAccountService serviceAccountService;
    
    
    public PlaceSearchService(ExternalApiService externalApiService,
                            GoogleServiceAccountService serviceAccountService) {
        this.externalApiService = externalApiService;
        this.serviceAccountService = serviceAccountService;
    }
    
    /**
     * Search for places within a specified radius
     */
    public CompletableFuture<PlaceSearchResult> searchPlaces(int radiusMiles, 
                                                           double latitude, 
                                                           double longitude, 
                                                           List<String> categoryIds) {
        
        logger.info("Searching for places within {} miles of ({}, {})", radiusMiles, latitude, longitude);
        
        // Convert miles to meters for Google Places API
        int radiusMeters = (int) (radiusMiles * 1609.34);
        
        // Get community-focused search queries
        List<String> communityQueries = getCommunityQueries();
        
        // Search using multiple queries in parallel
        List<CompletableFuture<List<Place>>> searchFutures = communityQueries.stream()
            .map(query -> searchGooglePlacesAsync(query, latitude, longitude, radiusMeters))
            .collect(Collectors.toList());
        
        // Combine all results
        return CompletableFuture.allOf(searchFutures.toArray(new CompletableFuture[0]))
            .thenApply(v -> {
                List<Place> allPlaces = searchFutures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .collect(Collectors.toList());
                
                // Filter by category if specified
                if (categoryIds != null && !categoryIds.isEmpty()) {
                    allPlaces = filterByCategories(allPlaces, categoryIds);
                }
                
                // Remove duplicates and sort by distance
                allPlaces = deduplicateAndSort(allPlaces, latitude, longitude);
                
                logger.info("Found {} places after filtering and deduplication", allPlaces.size());
                
                return PlaceSearchResult.builder()
                    .places(allPlaces)
                    .totalElements(allPlaces.size())
                    .radiusMiles(radiusMiles)
                    .location(new Location(latitude, longitude))
                    .build();
            });
    }
    
    /**
     * Search Google Places API asynchronously (New API with Service Account)
     */
    private CompletableFuture<List<Place>> searchGooglePlacesAsync(String query, 
                                                                  double latitude, 
                                                                  double longitude, 
                                                                  int radiusMeters) {
        
        Map<String, Object> requestBody = Map.of(
            "textQuery", query,
            "locationBias", Map.of(
                "circle", Map.of(
                    "center", Map.of("latitude", latitude, "longitude", longitude),
                    "radius", radiusMeters
                )
            ),
            "maxResultCount", 20
        );
        
        logger.info("Searching Google Places API for query: '{}' at location: {},{} with radius: {}m", 
                   query, latitude, longitude, radiusMeters);
        
        // Use Service Account for Google Places API
        if (serviceAccountService.isConfigured()) {
            return serviceAccountService.getValidAccessToken()
                .thenCompose(accessToken -> {
                    if (accessToken != null) {
                        logger.info("Using Service Account for Google Places API");
                        return callNewGooglePlacesApi(requestBody, accessToken, latitude, longitude);
                    } else {
                        logger.error("Service Account failed to get access token");
                        return CompletableFuture.completedFuture(Collections.emptyList());
                    }
                })
                .exceptionally(throwable -> {
                    logger.error("Service Account failed: {}", throwable.getMessage());
                    return Collections.emptyList();
                });
        } else {
            logger.error("Service Account not configured");
            return CompletableFuture.completedFuture(Collections.emptyList());
        }
    }
    
    
    /**
     * Call the new Google Places API with Service Account
     */
    private CompletableFuture<List<Place>> callNewGooglePlacesApi(Map<String, Object> requestBody, 
                                                                 String accessToken, 
                                                                 double latitude, 
                                                                 double longitude) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = "https://places.googleapis.com/v1/places:searchText";
                
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.set("Content-Type", "application/json");
                headers.set("Authorization", "Bearer " + accessToken);
                headers.set("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.location,places.types,places.id,places.websiteUri,places.nationalPhoneNumber");
                
                org.springframework.http.HttpEntity<Map<String, Object>> request = new org.springframework.http.HttpEntity<>(requestBody, headers);
                
                org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.POST, 
                    request, 
                    Map.class
                );
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    logger.info("Google Places API response received: {}", response.getBody());
                    return processGooglePlacesResponse(response.getBody(), latitude, longitude);
                } else {
                    logger.warn("Google Places API call failed: {}", response.getStatusCode());
                    return Collections.<Place>emptyList();
                }
            } catch (Exception e) {
                logger.error("Error calling Google Places API", e);
                return Collections.<Place>emptyList();
            }
        });
    }
    
    
    /**
     * Process Google Places API response (New API)
     */
    private List<Place> processGooglePlacesResponse(Map<String, Object> responseBody, 
                                                   double latitude, 
                                                   double longitude) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> places = (List<Map<String, Object>>) responseBody.get("places");
            
            if (places == null) {
                return Collections.emptyList();
            }
            
            return places.stream()
                .map(placeData -> convertToPlace(placeData, latitude, longitude))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error processing Google Places response", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Convert Google Places data to Place entity (New API only)
     */
    public Place convertToPlace(Map<String, Object> placeData, double latitude, double longitude) {
        try {
            // Handle new Google Places API response format
            String name = null;
            if (placeData.containsKey("displayName")) {
                Object displayNameObj = placeData.get("displayName");
                if (displayNameObj instanceof String) {
                    name = (String) displayNameObj;
                } else if (displayNameObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> displayNameMap = (Map<String, Object>) displayNameObj;
                    name = (String) displayNameMap.get("text");
                }
            }
            
            if (name == null || !isCommunityResource(name, placeData)) {
                return null;
            }
            
            Place place = new Place();
            place.setName(name);
            place.setDescription("Community resource found via Google Places");
            
            // Set location - new API format only
            Double lat = null;
            Double lng = null;

            if (placeData.containsKey("location")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> location = (Map<String, Object>) placeData.get("location");
                if (location != null) {
                    lat = (Double) location.get("latitude");
                    lng = (Double) location.get("longitude");
                }
            }
            
            if (lat != null && lng != null) {
                place.setLatitude(BigDecimal.valueOf(lat));
                place.setLongitude(BigDecimal.valueOf(lng));
                
                // Calculate distance and filter out places that are too far
                double distance = calculateDistance(latitude, longitude, lat, lng);
                if (distance > 100) { // Filter out places more than 100 miles away
                    return null;
                }
            }
            
            // Set address - new API format only
            String address = null;
            if (placeData.containsKey("formattedAddress")) {
                address = (String) placeData.get("formattedAddress");
            }
            
            if (address != null) {
                String[] addressParts = address.split(",");
                if (addressParts.length >= 3) {
                    place.setAddressLine1(addressParts[0].trim());
                    place.setCity(addressParts[1].trim());
                    place.setState(addressParts[2].trim());
                } else {
                    // If we can't parse the address, use the full formatted address
                    place.setAddressLine1(address);
                }
            }
            
            // Set other fields - new API format only
            String phone = null;
            if (placeData.containsKey("nationalPhoneNumber")) {
                phone = (String) placeData.get("nationalPhoneNumber");
            }
            place.setPhone(phone);

            String website = null;
            if (placeData.containsKey("websiteUri")) {
                website = (String) placeData.get("websiteUri");
            }
            place.setWebsite(website);
            
            place.setStatus("active");
            
            // Set categories based on place name and types
            List<Category> categories = getCategoriesFromPlaceData(placeData);
            place.setCategories(categories);
            
            return place;
            
        } catch (Exception e) {
            logger.error("Error converting place data", e);
            return null;
        }
    }
    
    
    /**
     * Get community-focused search queries
     */
    private List<String> getCommunityQueries() {
        return Arrays.asList(
            // Food Assistance - Comprehensive terms
            "food bank", "food pantry", "soup kitchen", "community kitchen",
            "meal program", "food assistance", "hunger relief", "emergency food",
            "free meals", "community meals", "food distribution", "food rescue",
            "mobile food pantry", "food shelf", "bread line", "community food",
            "food support", "nutrition assistance", "food security", "feeding program",
            
            // Other community resources
            "homeless shelter", "community center", "library", "hospital",
            "pharmacy", "social services", "legal aid", "employment center",
            "job training", "housing assistance", "mental health services",
            "senior center", "youth center"
        );
    }
    
    /**
     * Check if a place is a community resource - simplified approach
     */
    public boolean isCommunityResource(String name, Map<String, Object> placeData) {
        if (name == null) return false;
        
        // First check Google Places API types - this is more reliable
        @SuppressWarnings("unchecked")
        List<String> types = (List<String>) placeData.get("types");
        if (types != null) {
            for (String type : types) {
                if (isCommunityResourceType(type)) {
                    return true;
                }
            }
        }
        
        // Fallback to name-based filtering for food assistance specifically
        String lowerName = name.toLowerCase();
        return lowerName.contains("food bank") || lowerName.contains("food pantry") ||
               lowerName.contains("soup kitchen") || lowerName.contains("community kitchen") ||
               lowerName.contains("meal program") || lowerName.contains("hunger relief") ||
               lowerName.contains("food assistance") || lowerName.contains("emergency food") ||
               lowerName.contains("free meals") || lowerName.contains("community meals") ||
               lowerName.contains("food distribution") || lowerName.contains("food rescue") ||
               lowerName.contains("mobile food pantry") || lowerName.contains("food shelf") ||
               lowerName.contains("bread line") || lowerName.contains("community food") ||
               lowerName.contains("food support") || lowerName.contains("nutrition assistance") ||
               lowerName.contains("food security") || lowerName.contains("feeding program") ||
               lowerName.contains("food ministry") || lowerName.contains("food closet") ||
               lowerName.contains("food cupboard") || lowerName.contains("food share") ||
               lowerName.contains("food drive") || lowerName.contains("food giveaway") ||
               lowerName.contains("food outreach") || lowerName.contains("food service") ||
               lowerName.contains("food program");
    }
    
    /**
     * Check if a Google Places API type indicates a community resource
     */
    private boolean isCommunityResourceType(String type) {
        return type.equals("community_center") || type.equals("hospital") || 
               type.equals("library") || type.equals("pharmacy") || 
               type.equals("government_office") || type.equals("courthouse") ||
               type.equals("child_care_agency") || type.equals("health") ||
               type.equals("fitness_center") || type.equals("event_venue") ||
               type.equals("gym") || type.equals("sports_activity_location") ||
               type.equals("childrens_camp") || type.equals("summer_camp_organizer");
        // Removed "point_of_interest" and "establishment" as they're too broad
    }
    
    /**
     * Get categories from place data (New API only)
     */
    private List<Category> getCategoriesFromPlaceData(Map<String, Object> placeData) {
        String name = null;
        if (placeData.containsKey("displayName")) {
            Object displayNameObj = placeData.get("displayName");
            if (displayNameObj instanceof String) {
                name = (String) displayNameObj;
            } else if (displayNameObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> displayNameMap = (Map<String, Object>) displayNameObj;
                name = (String) displayNameMap.get("text");
            }
        }
        if (name == null) return Collections.emptyList();
        
        String lowerName = name.toLowerCase();
        List<Category> categories = new ArrayList<>();
        
        // Get Google Places API types
        @SuppressWarnings("unchecked")
        List<String> types = (List<String>) placeData.get("types");
        
        // Categorize based on Google Places API types and name keywords
        if (types != null) {
            if (types.contains("pharmacy")) {
                categories.add(createCategory("Healthcare", "2", "healthcare"));
            } else if (types.contains("hospital") || types.contains("health")) {
                categories.add(createCategory("Healthcare", "2", "healthcare"));
            } else if (types.contains("library")) {
                categories.add(createCategory("Education", "3", "education"));
            } else if (types.contains("community_center") || types.contains("government_office")) {
                categories.add(createCategory("Community Services", "4", "community-services"));
            } else if (types.contains("fitness_center") || types.contains("gym") || types.contains("sports_activity_location")) {
                categories.add(createCategory("Recreation", "5", "recreation"));
            } else if (types.contains("child_care_agency")) {
                categories.add(createCategory("Youth Services", "6", "youth-services"));
            }
        }
        
        // Food Assistance keywords (only for actual food assistance places)
        if (lowerName.contains("food bank") || lowerName.contains("food pantry") ||
            lowerName.contains("soup kitchen") || lowerName.contains("community kitchen") ||
            lowerName.contains("meal program") || lowerName.contains("hunger relief") ||
            lowerName.contains("food assistance") || lowerName.contains("emergency food") ||
            lowerName.contains("free meals") || lowerName.contains("community meals") ||
            lowerName.contains("food distribution") || lowerName.contains("food rescue") ||
            lowerName.contains("mobile food pantry") || lowerName.contains("food shelf") ||
            lowerName.contains("bread line") || lowerName.contains("community food") ||
            lowerName.contains("food support") || lowerName.contains("nutrition assistance") ||
            lowerName.contains("food security") || lowerName.contains("feeding program") ||
            lowerName.contains("food ministry") || lowerName.contains("food closet") ||
            lowerName.contains("food cupboard") || lowerName.contains("food share") ||
            lowerName.contains("food drive") || lowerName.contains("food giveaway") ||
            lowerName.contains("food outreach") || lowerName.contains("food service") ||
            lowerName.contains("food program")) {
            categories.add(createCategory("Food Assistance", "1", "food-assistance"));
        }
        
        // Default to Community Services if no specific category found
        if (categories.isEmpty()) {
            categories.add(createCategory("Community Services", "4", "community-services"));
        }
        
        return categories;
    }
    
    
    /**
     * Create a category
     */
    private Category createCategory(String name, String id, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setId(UUID.nameUUIDFromBytes(id.getBytes()));
        category.setSlug(slug);
        return category;
    }
    
    /**
     * Filter places by categories
     */
    private List<Place> filterByCategories(List<Place> places, List<String> categoryIds) {
        // Map category IDs to category names for filtering
        Map<String, String> categoryIdToName = Map.of(
            "1", "Food Assistance",
            "2", "Healthcare", 
            "3", "Education",
            "4", "Community Services",
            "5", "Recreation",
            "6", "Youth Services"
        );
        
        return places.stream()
            .filter(place -> place.getCategories() != null)
            .filter(place -> place.getCategories().stream()
                .anyMatch(category -> {
                    String categoryName = categoryIdToName.get(categoryIds.get(0));
                    return categoryName != null && categoryName.equals(category.getName());
                }))
            .collect(Collectors.toList());
    }
    
    /**
     * Remove duplicates and sort by distance
     */
    private List<Place> deduplicateAndSort(List<Place> places, double latitude, double longitude) {
        return places.stream()
            .collect(Collectors.toMap(
                Place::getName,
                place -> place,
                (existing, replacement) -> existing
            ))
            .values()
            .stream()
            .sorted(Comparator.comparing(place -> calculateDistance(
                latitude, longitude, 
                place.getLatitude().doubleValue(), 
                place.getLongitude().doubleValue()
            )))
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate distance between two points
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 0.621371; // Convert to miles
    }
}
