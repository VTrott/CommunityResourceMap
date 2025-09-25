// Temporarily comment out entire EventController to fix circular dependency
/*
package com.community.crm.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Temporarily comment out location-based endpoint due to relationship issues
    // @GetMapping("/nearby")
    // public ResponseEntity<Page<Event>> getNearbyEvents(
    //         @RequestParam Double latitude,
    //         @RequestParam Double longitude,
    //         @RequestParam(defaultValue = "10") Double radiusMiles,
    //         @RequestParam(defaultValue = "0") int page,
    //         @RequestParam(defaultValue = "20") int size) {
    //     
    //     Pageable pageable = PageRequest.of(page, size);
    //     Page<Event> events = eventService.findEventsNearLocation(
    //         latitude, longitude, radiusMiles, pageable
    //     );
    //     
    //     return ResponseEntity.ok(events);
    // }

    // Temporarily comment out category-based endpoint due to relationship issues
    // @GetMapping("/category/{categoryId}")
    // public ResponseEntity<Page<Event>> getEventsByCategory(
    //         @PathVariable UUID categoryId,
    //         @RequestParam(defaultValue = "0") int page,
    //         @RequestParam(defaultValue = "20") int size) {
    //     
    //     Pageable pageable = PageRequest.of(page, size);
    //     Page<Event> events = eventService.findEventsByCategory(categoryId, pageable);
    //     
    //     return ResponseEntity.ok(events);
    // }

    @GetMapping("/source/{source}")
    public ResponseEntity<Page<Event>> getEventsBySource(
            @PathVariable String source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Event> events = eventService.findEventsBySource(source, pageable);
        
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents(
            @RequestParam(defaultValue = "7") int days) {
        
        List<Event> events = eventService.findUpcomingEvents(days);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable UUID id) {
        return eventService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event createdEvent = eventService.createEvent(event);
        return ResponseEntity.ok(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable UUID id, @RequestBody Event eventDetails) {
        try {
            Event updatedEvent = eventService.updateEvent(id, eventDetails);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Temporarily comment out place-based endpoint due to relationship issues
    // @GetMapping("/place/{placeId}")
    // public ResponseEntity<List<Event>> getEventsByPlace(@PathVariable UUID placeId) {
    //     List<Event> events = eventService.findEventsByPlace(placeId);
    //     return ResponseEntity.ok(events);
    // }

    @GetMapping("/stats/source/{source}")
    public ResponseEntity<Long> getEventCountBySource(@PathVariable String source) {
        Long count = eventService.getEventCountBySource(source);
        return ResponseEntity.ok(count);
    }
}
*/
