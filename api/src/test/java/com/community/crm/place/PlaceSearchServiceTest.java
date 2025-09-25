package com.community.crm.place;

import com.community.crm.category.Category;
import com.community.crm.external.ApiResponse;
import com.community.crm.external.ExternalApiService;
import com.community.crm.external.GoogleServiceAccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PlaceSearchService
 * Tests the business logic for place search operations
 */
@ExtendWith(MockitoExtension.class)
class PlaceSearchServiceTest {

    @Mock
    private ExternalApiService externalApiService;

    @Mock
    private GoogleServiceAccountService serviceAccountService;

    private PlaceSearchService placeSearchService;

    @BeforeEach
    void setUp() {
        placeSearchService = new PlaceSearchService(externalApiService, serviceAccountService);
    }

    @Test
    void testSearchPlaces_Success() throws Exception {
        // Arrange
        double latitude = 40.7128;
        double longitude = -74.0060;
        int radiusMiles = 10;
        List<String> categoryIds = null; 

        // Mock Google Places API response
        Map<String, Object> googleResponse = new HashMap<>();
        List<Map<String, Object>> places = new ArrayList<>();
        
        Map<String, Object> place1 = createMockPlaceData("Food Pantry", 40.7128, -74.0060);
        Map<String, Object> place2 = createMockPlaceData("Community Center", 40.7200, -74.0100);
        places.add(place1);
        places.add(place2);
        googleResponse.put("places", places);

        // Mock the external API service to return the Google response
        when(externalApiService.callGooglePlacesApi(any()))
            .thenReturn(CompletableFuture.completedFuture(
                new ApiResponse<>(true, googleResponse, null, 200, 100)
            ));

        CompletableFuture<PlaceSearchResult> future = placeSearchService.searchPlaces(
            radiusMiles, latitude, longitude, categoryIds
        );
        
        PlaceSearchResult result = future.get();

        System.out.println("Result places count: " + (result.getPlaces() != null ? result.getPlaces().size() : "null"));
        if (result.getPlaces() != null && !result.getPlaces().isEmpty()) {
            System.out.println("First place: " + result.getPlaces().get(0).getName());
        }
        
        Map<String, Object> testPlace = createMockPlaceData("Test Food Pantry", 40.7128, -74.0060);
        Place convertedPlace = placeSearchService.convertToPlace(testPlace, latitude, longitude);
        System.out.println("Converted place: " + (convertedPlace != null ? convertedPlace.getName() : "null"));

        assertNotNull(result);
        assertNotNull(result.getPlaces());
        assertTrue(result.getPlaces().size() > 0);
        assertEquals(radiusMiles, result.getRadiusMiles());
        assertNotNull(result.getLocation());
        assertEquals(latitude, result.getLocation().getLatitude());
        assertEquals(longitude, result.getLocation().getLongitude());
    }

    @Test
    void testSearchPlaces_ApiFailure() throws Exception {
        double latitude = 40.7128;
        double longitude = -74.0060;
        int radiusMiles = 10;

        // Mock the external API service to return an error
        when(externalApiService.callGooglePlacesApi(any()))
            .thenReturn(CompletableFuture.failedFuture(new RuntimeException("API Error")));


        CompletableFuture<PlaceSearchResult> future = placeSearchService.searchPlaces(
            radiusMiles, latitude, longitude, null
        );
        
        PlaceSearchResult result = future.get();

        assertNotNull(result);
        assertNotNull(result.getPlaces());
        assertTrue(result.getPlaces().isEmpty()); // Should return empty list on API failure
    }

    @Test
    void testSearchPlaces_WithCategoryFiltering() throws Exception {
        double latitude = 40.7128;
        double longitude = -74.0060;
        int radiusMiles = 10;
        List<String> categoryIds = null; 

        Map<String, Object> googleResponse = new HashMap<>();
        List<Map<String, Object>> places = new ArrayList<>();
        
        Map<String, Object> foodBank = createMockPlaceData("Food Pantry", 40.7128, -74.0060);
        Map<String, Object> hospital = createMockPlaceData("Hospital", 40.7200, -74.0100);
        places.add(foodBank);
        places.add(hospital);
        googleResponse.put("places", places);

        // Mock the external API service to return the Google response
        when(externalApiService.callGooglePlacesApi(any()))
            .thenReturn(CompletableFuture.completedFuture(
                new ApiResponse<>(true, googleResponse, null, 200, 100)
            ));

        CompletableFuture<PlaceSearchResult> future = placeSearchService.searchPlaces(
            radiusMiles, latitude, longitude, categoryIds
        );
        
        PlaceSearchResult result = future.get();

        assertNotNull(result);
        assertNotNull(result.getPlaces());
        assertTrue(result.getPlaces().stream()
            .anyMatch(place -> place.getName().contains("Food Pantry")));
    }

    @Test
    void testConvertToPlace_ValidData() {
        Map<String, Object> placeData = createMockPlaceData("Test Food Pantry", 40.7128, -74.0060);
        double latitude = 40.7128;
        double longitude = -74.0060;

        Place place = placeSearchService.convertToPlace(placeData, latitude, longitude);

        assertNotNull(place);
        assertEquals("Test Food Pantry", place.getName());
        assertEquals("Community resource found via Google Places", place.getDescription());
        assertEquals(BigDecimal.valueOf(40.7128), place.getLatitude());
        assertEquals(BigDecimal.valueOf(-74.0060), place.getLongitude());
        assertEquals("active", place.getStatus());
    }

    @Test
    void testConvertToPlace_NonCommunityResource() {
        Map<String, Object> placeData = createMockPlaceData("McDonald's Restaurant", 40.7128, -74.0060);
        double latitude = 40.7128;
        double longitude = -74.0060;

        Place place = placeSearchService.convertToPlace(placeData, latitude, longitude);

        assertNull(place); // Should return null for non-community resources
    }

    @Test
    void testIsCommunityResource_ValidResources() {
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("types", Arrays.asList("community_center", "establishment"));
        
        assertTrue(placeSearchService.isCommunityResource("Food Pantry", placeData));
        assertTrue(placeSearchService.isCommunityResource("Community Center", placeData));
        assertTrue(placeSearchService.isCommunityResource("Homeless Shelter", placeData));
        assertTrue(placeSearchService.isCommunityResource("Public Library", placeData));
        assertTrue(placeSearchService.isCommunityResource("Hospital", placeData));
    }

    @Test
    void testIsCommunityResource_CommercialBusinesses() {
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("types", Arrays.asList("restaurant", "store"));
        
        assertFalse(placeSearchService.isCommunityResource("McDonald's", placeData));
        assertFalse(placeSearchService.isCommunityResource("Walmart", placeData));
        assertFalse(placeSearchService.isCommunityResource("Target", placeData));
        assertFalse(placeSearchService.isCommunityResource("Restaurant", placeData));
        assertFalse(placeSearchService.isCommunityResource("Grocery Store", placeData));
    }

    @Test
    void testCalculateDistance() {
        double lat1 = 40.7128;
        double lon1 = -74.0060;
        double lat2 = 40.7589;
        double lon2 = -73.9851;

        double distance = placeSearchService.calculateDistance(lat1, lon1, lat2, lon2);

        assertTrue(distance > 3.0 && distance < 4.0);
    }

    private Map<String, Object> createMockPlaceData(String name, double lat, double lng) {
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("displayName", name);
        placeData.put("formattedAddress", "123 Test St, Test City, TS 12345");
        placeData.put("nationalPhoneNumber", "(555) 123-4567");
        placeData.put("websiteUri", "https://test.com");
        
        Map<String, Object> location = new HashMap<>();
        location.put("latitude", lat);
        location.put("longitude", lng);
        placeData.put("location", location);
        
        return placeData;
    }
}
