package com.community.crm.category;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAllOrderByName();
    }
    
    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
    
    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }
    
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        }
        
        // Check for duplicates
        if (categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category with name '" + category.getName() + "' already exists");
        }
        
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + category.getSlug() + "' already exists");
        }
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(UUID id, Category updatedCategory) {
        Category existingCategory = categoryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        if (!existingCategory.getName().equals(updatedCategory.getName()) && 
            categoryRepository.existsByName(updatedCategory.getName())) {
            throw new IllegalArgumentException("Category with name '" + updatedCategory.getName() + "' already exists");
        }
        
        if (!existingCategory.getSlug().equals(updatedCategory.getSlug()) && 
            categoryRepository.existsBySlug(updatedCategory.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + updatedCategory.getSlug() + "' already exists");
        }
        
        if (updatedCategory.getSlug() == null || updatedCategory.getSlug().trim().isEmpty()) {
            updatedCategory.setSlug(generateSlug(updatedCategory.getName()));
        }
        
        existingCategory.setName(updatedCategory.getName());
        existingCategory.setSlug(updatedCategory.getSlug());
        
        return categoryRepository.save(existingCategory);
    }
    
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        
        // Note: This will cascade delete place-category relationships due to @ManyToMany(cascade = CascadeType.ALL)
        categoryRepository.deleteById(id);
    }
    
    public List<Category> searchCategories(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.findByNameContainingIgnoreCase(name.trim());
    }
    
    private String generateSlug(String name) {
        if (name == null) return "";
        
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "") 
            .replaceAll("\\s+", "-") 
            .replaceAll("-+", "-") 
            .replaceAll("^-|-$", "");
    }
}
