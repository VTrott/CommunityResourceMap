package com.community.crm.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    Optional<Category> findByName(String name);
    
    Optional<Category> findBySlug(String slug);
    
    @Query("SELECT c FROM Category c WHERE c.name ILIKE %:name% ORDER BY c.name")
    List<Category> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT c FROM Category c ORDER BY c.name")
    List<Category> findAllOrderByName();
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
}
