package com.community.crm.validation;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;

@Service
public class ValidationService {
    
    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[\\+]?[1-9][\\d]{0,15}$"
    );
    
    private static final Pattern URL_PATTERN = Pattern.compile(
        "^(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?$"
    );
    
    private static final Pattern SLUG_PATTERN = Pattern.compile(
        "^[a-z0-9-]+$"
    );

    public ValidationResult validatePlace(PlaceValidationData data) {
        List<String> errors = new ArrayList<>();
        
        // Required field validation
        if (data.getName() == null || data.getName().trim().isEmpty()) {
            errors.add("Name is required");
        } else if (data.getName().length() > 255) {
            errors.add("Name must be less than 255 characters");
        }
        
        // Optional field validation
        if (data.getDescription() != null && data.getDescription().length() > 1000) {
            errors.add("Description must be less than 1000 characters");
        }
        
        if (data.getWebsite() != null && !data.getWebsite().isEmpty()) {
            if (!URL_PATTERN.matcher(data.getWebsite()).matches()) {
                errors.add("Invalid website URL format");
            }
        }
        
        if (data.getPhone() != null && !data.getPhone().isEmpty()) {
            if (!PHONE_PATTERN.matcher(data.getPhone()).matches()) {
                errors.add("Invalid phone number format");
            }
        }
        
        if (data.getEmail() != null && !data.getEmail().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(data.getEmail()).matches()) {
                errors.add("Invalid email address format");
            }
        }
        
        if (data.getCity() != null && data.getCity().length() > 100) {
            errors.add("City must be less than 100 characters");
        }
        
        if (data.getState() != null && data.getState().length() > 100) {
            errors.add("State must be less than 100 characters");
        }
        
        if (data.getPostalCode() != null && data.getPostalCode().length() > 20) {
            errors.add("Postal code must be less than 20 characters");
        }
        
        // Coordinate validation
        if (data.getLatitude() != null) {
            if (data.getLatitude().doubleValue() < -90 || data.getLatitude().doubleValue() > 90) {
                errors.add("Latitude must be between -90 and 90");
            }
        }
        
        if (data.getLongitude() != null) {
            if (data.getLongitude().doubleValue() < -180 || data.getLongitude().doubleValue() > 180) {
                errors.add("Longitude must be between -180 and 180");
            }
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    public ValidationResult validateCategory(CategoryValidationData data) {
        List<String> errors = new ArrayList<>();
        
        if (data.getName() == null || data.getName().trim().isEmpty()) {
            errors.add("Name is required");
        } else if (data.getName().length() > 100) {
            errors.add("Name must be less than 100 characters");
        }
        
        if (data.getSlug() == null || data.getSlug().trim().isEmpty()) {
            errors.add("Slug is required");
        } else if (data.getSlug().length() > 100) {
            errors.add("Slug must be less than 100 characters");
        } else if (!SLUG_PATTERN.matcher(data.getSlug()).matches()) {
            errors.add("Slug must contain only lowercase letters, numbers, and hyphens");
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    public ValidationResult validateSearchRequest(SearchValidationData data) {
        List<String> errors = new ArrayList<>();
        
        if (data.getPage() < 0) {
            errors.add("Page must be non-negative");
        }
        
        if (data.getSize() < 1 || data.getSize() > 100) {
            errors.add("Size must be between 1 and 100");
        }
        
        if (data.getRadiusMiles() != null) {
            if (data.getRadiusMiles() < 0.1 || data.getRadiusMiles() > 500) {
                errors.add("Radius must be between 0.1 and 500 miles");
            }
        }
        
        if (data.getLatitude() != null) {
            if (data.getLatitude().doubleValue() < -90 || data.getLatitude().doubleValue() > 90) {
                errors.add("Latitude must be between -90 and 90");
            }
        }
        
        if (data.getLongitude() != null) {
            if (data.getLongitude().doubleValue() < -180 || data.getLongitude().doubleValue() > 180) {
                errors.add("Longitude must be between -180 and 180");
            }
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    // Data classes for validation
    public static class PlaceValidationData {
        private String name;
        private String description;
        private String website;
        private String phone;
        private String email;
        private String city;
        private String state;
        private String postalCode;
        private java.math.BigDecimal latitude;
        private java.math.BigDecimal longitude;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getWebsite() { return website; }
        public void setWebsite(String website) { this.website = website; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public java.math.BigDecimal getLatitude() { return latitude; }
        public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }
        public java.math.BigDecimal getLongitude() { return longitude; }
        public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }
    }
    
    public static class CategoryValidationData {
        private String name;
        private String slug;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
    }
    
    public static class SearchValidationData {
        private int page;
        private int size;
        private Double radiusMiles;
        private java.math.BigDecimal latitude;
        private java.math.BigDecimal longitude;
        
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public Double getRadiusMiles() { return radiusMiles; }
        public void setRadiusMiles(Double radiusMiles) { this.radiusMiles = radiusMiles; }
        public java.math.BigDecimal getLatitude() { return latitude; }
        public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }
        public java.math.BigDecimal getLongitude() { return longitude; }
        public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        
        public ValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }
        
        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public String getErrorMessage() { return String.join(", ", errors); }
    }
}
