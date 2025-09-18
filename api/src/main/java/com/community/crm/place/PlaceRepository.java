package com.community.crm.place;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlaceRepository extends JpaRepository<Place, UUID> {
    
    @Query("SELECT p FROM Place p WHERE " +
           "(:city IS NULL OR LOWER(p.city) LIKE :cityPattern) AND " +
           "(:state IS NULL OR LOWER(p.state) LIKE :statePattern) AND " +
           "(:name IS NULL OR LOWER(p.name) LIKE :namePattern) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Place> findByFilters(@Param("city") String city, 
                              @Param("state") String state, 
                              @Param("name") String name, 
                              @Param("status") String status,
                              @Param("cityPattern") String cityPattern,
                              @Param("statePattern") String statePattern,
                              @Param("namePattern") String namePattern,
                              Pageable pageable);
    
    @Query("SELECT DISTINCT p FROM Place p " +
           "JOIN p.categories c " +
           "WHERE c.id IN :categoryIds AND " +
           "(:city IS NULL OR LOWER(p.city) LIKE :cityPattern) AND " +
           "(:state IS NULL OR LOWER(p.state) LIKE :statePattern) AND " +
           "(:name IS NULL OR LOWER(p.name) LIKE :namePattern) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Place> findByFiltersWithCategories(@Param("city") String city, 
                                           @Param("state") String state, 
                                           @Param("name") String name, 
                                           @Param("status") String status,
                                           @Param("categoryIds") List<UUID> categoryIds,
                                           @Param("cityPattern") String cityPattern,
                                           @Param("statePattern") String statePattern,
                                           @Param("namePattern") String namePattern,
                                           Pageable pageable);
    
    @Query("SELECT p FROM Place p WHERE " +
           "p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND " +
           "p.status = 'active' AND " +
           "6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * " +
           "cos(radians(p.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(p.latitude))) <= :radiusKm")
    Page<Place> findByLocation(@Param("lat") Double latitude, 
                               @Param("lng") Double longitude, 
                               @Param("radiusKm") Double radiusKm, 
                               Pageable pageable);
    
    @Query("SELECT DISTINCT p FROM Place p " +
           "JOIN p.categories c " +
           "WHERE c.id IN :categoryIds AND " +
           "p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND " +
           "p.status = 'active' AND " +
           "6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * " +
           "cos(radians(p.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(p.latitude))) <= :radiusKm")
    Page<Place> findByLocationWithCategories(@Param("lat") Double latitude, 
                                            @Param("lng") Double longitude, 
                                            @Param("radiusKm") Double radiusKm,
                                            @Param("categoryIds") List<UUID> categoryIds,
                                            Pageable pageable);
}


