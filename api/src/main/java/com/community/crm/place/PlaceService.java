package com.community.crm.place;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PlaceService {
    private final PlaceRepository repository;

    public PlaceService(PlaceRepository repository) {
        this.repository = repository;
    }

    public List<Place> list() { return repository.findAll(); }

    public Place get(UUID id) { return repository.findById(id).orElseThrow(); }

    public Place create(Place p) {
        if (p.getId() == null) {
            p.setId(UUID.randomUUID());
        }
        return repository.save(p);
    }

    public Place update(UUID id, Place p) {
        Place existing = get(id);
        p.setId(existing.getId());
        return repository.save(p);
    }

    public void delete(UUID id) { repository.deleteById(id); }

    public PlaceSearchResponse search(PlaceSearchRequest request) {
        Pageable pageable = createPageable(request);
        Page<Place> page;
        
        // Create LIKE patterns
        String cityPattern = request.getCity() != null ? "%" + request.getCity().toLowerCase() + "%" : null;
        String statePattern = request.getState() != null ? "%" + request.getState().toLowerCase() + "%" : null;
        String namePattern = request.getName() != null ? "%" + request.getName().toLowerCase() + "%" : null;
        
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            page = repository.findByFiltersWithCategories(
                request.getCity(),
                request.getState(), 
                request.getName(),
                request.getStatus(),
                request.getCategoryIds(),
                cityPattern,
                statePattern,
                namePattern,
                pageable
            );
        } else {
            page = repository.findByFilters(
                request.getCity(),
                request.getState(),
                request.getName(), 
                request.getStatus(),
                cityPattern,
                statePattern,
                namePattern,
                pageable
            );
        }
        
        return new PlaceSearchResponse(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }
    
    private Pageable createPageable(PlaceSearchRequest request) {
        Sort.Direction direction = "desc".equalsIgnoreCase(request.getSortDirection()) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, request.getSortBy());
        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }
}


