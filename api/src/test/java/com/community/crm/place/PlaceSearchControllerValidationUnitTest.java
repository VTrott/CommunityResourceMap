package com.community.crm.place;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for PlaceSearchController validation logic
 * Tests controller validation without Spring context
 */
class PlaceSearchControllerValidationUnitTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private PlaceSearchController controller;

    @BeforeEach
    void setUp() {
        // Create a mock PlaceSearchService using Mockito
        PlaceSearchService mockService = org.mockito.Mockito.mock(PlaceSearchService.class);
        
        controller = new PlaceSearchController(mockService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testSearch10Miles_MissingCoordinates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        // Missing latitude and longitude

        mockMvc.perform(post("/api/places/search/10-miles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Latitude and longitude are required"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"));
    }

    @Test
    void testSearch10Miles_InvalidCoordinates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("latitude", "invalid");
        request.put("longitude", "invalid");

        mockMvc.perform(post("/api/places/search/10-miles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Latitude and longitude are required"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"));
    }

    @Test
    void testSearch5Miles_MissingCoordinates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        // Missing latitude and longitude

        mockMvc.perform(post("/api/places/search/5-miles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Latitude and longitude are required"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"));
    }

    @Test
    void testSearch25Miles_MissingCoordinates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        // Missing latitude and longitude

        mockMvc.perform(post("/api/places/search/25-miles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Latitude and longitude are required"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"));
    }

    @Test
    void testSearch50Miles_MissingCoordinates() throws Exception {
        Map<String, Object> request = new HashMap<>();
        // Missing latitude and longitude

        mockMvc.perform(post("/api/places/search/50-miles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Latitude and longitude are required"))
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"));
    }
}
