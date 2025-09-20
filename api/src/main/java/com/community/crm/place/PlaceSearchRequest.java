package com.community.crm.place;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlaceSearchRequest {
    private String city;
    private String state;
    private List<UUID> categoryIds;
    private String name;
    private String status = "active";
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortDirection = "asc";
    
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double radiusMiles;

    public PlaceSearchRequest() {}

    // Getters and setters
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public List<UUID> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<UUID> categoryIds) { this.categoryIds = categoryIds; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
   
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public Double getRadiusMiles() { return radiusMiles; }
    public void setRadiusMiles(Double radiusMiles) { this.radiusMiles = radiusMiles; }
}
