package com.community.crm.place;

import java.util.List;

/**
 * Result wrapper for place search operations
 */
public class PlaceSearchResult {
    private List<Place> places;
    private int totalElements;
    private int radiusMiles;
    private Location location;
    
    public PlaceSearchResult() {}
    
    public PlaceSearchResult(List<Place> places, int totalElements, int radiusMiles, Location location) {
        this.places = places;
        this.totalElements = totalElements;
        this.radiusMiles = radiusMiles;
        this.location = location;
    }
    
    public static PlaceSearchResultBuilder builder() {
        return new PlaceSearchResultBuilder();
    }
    
    public List<Place> getPlaces() {
        return places;
    }
    
    public void setPlaces(List<Place> places) {
        this.places = places;
    }
    
    public int getTotalElements() {
        return totalElements;
    }
    
    public void setTotalElements(int totalElements) {
        this.totalElements = totalElements;
    }
    
    public int getRadiusMiles() {
        return radiusMiles;
    }
    
    public void setRadiusMiles(int radiusMiles) {
        this.radiusMiles = radiusMiles;
    }
    
    public Location getLocation() {
        return location;
    }
    
    public void setLocation(Location location) {
        this.location = location;
    }
    
    public static class PlaceSearchResultBuilder {
        private List<Place> places;
        private int totalElements;
        private int radiusMiles;
        private Location location;
        
        public PlaceSearchResultBuilder places(List<Place> places) {
            this.places = places;
            return this;
        }
        
        public PlaceSearchResultBuilder totalElements(int totalElements) {
            this.totalElements = totalElements;
            return this;
        }
        
        public PlaceSearchResultBuilder radiusMiles(int radiusMiles) {
            this.radiusMiles = radiusMiles;
            return this;
        }
        
        public PlaceSearchResultBuilder location(Location location) {
            this.location = location;
            return this;
        }
        
        public PlaceSearchResult build() {
            return new PlaceSearchResult(places, totalElements, radiusMiles, location);
        }
    }
}
