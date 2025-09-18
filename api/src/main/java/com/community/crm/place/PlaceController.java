package com.community.crm.place;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/places")
public class PlaceController {
    private final PlaceService service;

    public PlaceController(PlaceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Place> list() { return service.list(); }

    @GetMapping("/{id}")
    public Place get(@PathVariable UUID id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Place> create(@RequestBody Place p) {
        Place created = service.create(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public Place update(@PathVariable UUID id, @RequestBody Place p) { return service.update(id, p); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    public PlaceSearchResponse search(@RequestBody PlaceSearchRequest request) {
        return service.search(request);
    }
    
    @PostMapping("/search/location")
    public PlaceSearchResponse searchByLocation(@RequestBody PlaceSearchRequest request) {
        return service.search(request);
    }
}


