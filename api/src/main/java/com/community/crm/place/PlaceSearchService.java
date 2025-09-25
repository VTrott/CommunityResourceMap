package com.community.crm.place;

import com.community.crm.category.Category;
import com.community.crm.category.CategoryRepository;
import com.community.crm.external.ExternalApiService;
import com.community.crm.external.ApiResponse;
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
    
    private final PlaceRepository placeRepository;
    private final CategoryRepository categoryRepository;
    private final ExternalApiService externalApiService;
    
    @Value("${app.external-apis.google-maps.api-key:}")
    private String googleMapsApiKey;
    
    public PlaceSearchService(PlaceRepository placeRepository, 
                            CategoryRepository categoryRepository,
                            ExternalApiService externalApiService) {
        this.placeRepository = placeRepository;
        this.categoryRepository = categoryRepository;
        this.externalApiService = externalApiService;
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
     * Search Google Places API asynchronously
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
        
        return externalApiService.callGooglePlacesApi(requestBody)
            .thenApply(response -> {
                if (response.isSuccess() && response.getData() != null) {
                    return processGooglePlacesResponse(response.getData(), latitude, longitude);
                } else {
                    logger.warn("Google Places API call failed for query '{}': {}", query, response.getError());
                    return Collections.<Place>emptyList();
                }
            });
    }
    
    /**
     * Process Google Places API response
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
     * Convert Google Places data to Place entity
     */
    public Place convertToPlace(Map<String, Object> placeData, double latitude, double longitude) {
        try {
            String name = (String) placeData.get("displayName");
            if (name == null || !isCommunityResource(name)) {
                return null;
            }
            
            Place place = new Place();
            place.setName(name);
            place.setDescription("Community resource found via Google Places");
            
            // Set location
            @SuppressWarnings("unchecked")
            Map<String, Object> location = (Map<String, Object>) placeData.get("location");
            if (location != null) {
                Double lat = (Double) location.get("latitude");
                Double lng = (Double) location.get("longitude");
                if (lat != null && lng != null) {
                    place.setLatitude(BigDecimal.valueOf(lat));
                    place.setLongitude(BigDecimal.valueOf(lng));
                    // Note: Place entity doesn't have distance field, we'll calculate it in the result
                }
            }
            
            // Set address
            String address = (String) placeData.get("formattedAddress");
            if (address != null) {
                String[] addressParts = address.split(",");
                if (addressParts.length >= 3) {
                    place.setAddressLine1(addressParts[0].trim());
                    place.setCity(addressParts[1].trim());
                    place.setState(addressParts[2].trim());
                }
            }
            
            // Set other fields
            place.setPhone((String) placeData.get("nationalPhoneNumber"));
            place.setWebsite((String) placeData.get("websiteUri"));
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
     * Check if a place is a community resource
     */
    public boolean isCommunityResource(String name) {
        if (name == null) return false;
        
        String lowerName = name.toLowerCase();
        
        // Exclude commercial businesses
        if (lowerName.contains("restaurant") || lowerName.contains("grocery") ||
            lowerName.contains("convenience") || lowerName.contains("hotel") ||
            lowerName.contains("bank") || lowerName.contains("mcdonald") ||
            lowerName.contains("kfc") || lowerName.contains("subway") ||
            lowerName.contains("walmart") || lowerName.contains("target") ||
            lowerName.contains("costco")) {
            return false;
        }
        
        // Include community resources
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
               lowerName.contains("food program") || lowerName.contains("shelter") ||
               lowerName.contains("community center") || lowerName.contains("library") ||
               lowerName.contains("hospital") || lowerName.contains("clinic") ||
               lowerName.contains("pharmacy") || lowerName.contains("social services") ||
               lowerName.contains("legal aid") || lowerName.contains("employment") ||
               lowerName.contains("housing") || lowerName.contains("senior center") ||
               lowerName.contains("youth center") || lowerName.contains("police") ||
               lowerName.contains("fire station") || lowerName.contains("emergency") ||
               lowerName.contains("community") || lowerName.contains("public") ||
               lowerName.contains("nonprofit") || lowerName.contains("non-profit") ||
               lowerName.contains("charity") || lowerName.contains("foundation") ||
               lowerName.contains("government") || lowerName.contains("civic") ||
               lowerName.contains("recreation center");
    }
    
    /**
     * Get categories from place data
     */
    private List<Category> getCategoriesFromPlaceData(Map<String, Object> placeData) {
        String name = (String) placeData.get("displayName");
        if (name == null) return Collections.emptyList();
        
        String lowerName = name.toLowerCase();
        List<Category> categories = new ArrayList<>();
        
        // Food Assistance keywords
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
        
        // Add other category logic here...
        
        return categories;
    }
    
    /**
     * Create a category
     */
    private Category createCategory(String name, String id, String slug) {
        Category category = new Category();
        category.setName(name);
        // Generate a proper UUID from the id string
        category.setId(UUID.nameUUIDFromBytes(id.getBytes()));
        category.setSlug(slug);
        return category;
    }
    
    /**
     * Filter places by categories
     */
    private List<Place> filterByCategories(List<Place> places, List<String> categoryIds) {
        return places.stream()
            .filter(place -> place.getCategories() != null)
            .filter(place -> place.getCategories().stream()
                .anyMatch(category -> categoryIds.contains(category.getId().toString())))
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
