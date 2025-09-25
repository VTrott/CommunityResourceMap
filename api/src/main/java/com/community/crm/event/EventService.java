// Temporarily comment out entire EventService to fix circular dependency
/*
package com.community.crm.event;

import com.community.crm.category.CategoryRepository;
import com.community.crm.place.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Temporarily comment out @Service to fix circular dependency
// @Service
// @Transactional
// public class EventService {

    // Temporarily comment out all fields and methods due to circular dependency
    // private final EventRepository eventRepository;
    // private final PlaceRepository placeRepository;
    // private final CategoryRepository categoryRepository;

    @Autowired
    public EventService(EventRepository eventRepository, 
                       PlaceRepository placeRepository, 
                       CategoryRepository categoryRepository) {
        this.eventRepository = eventRepository;
        this.placeRepository = placeRepository;
        this.categoryRepository = categoryRepository;
    }

    // Temporarily comment out location-based methods due to relationship issues
    // public Page<Event> findEventsNearLocation(Double latitude, Double longitude, 
    //                                         Double radiusMiles, Pageable pageable) {
    //     Double radiusKm = radiusMiles * 1.60934; // Convert miles to kilometers
    //     OffsetDateTime startDate = OffsetDateTime.now();
    //     
    //     return eventRepository.findEventsNearLocation(
    //         latitude, longitude, radiusKm, startDate, pageable
    //     );
    // }

    // Temporarily comment out category-based methods due to relationship issues
    // public Page<Event> findEventsByCategory(UUID categoryId, Pageable pageable) {
    //     OffsetDateTime startDate = OffsetDateTime.now();
    //     return eventRepository.findEventsByCategory(categoryId, startDate, pageable);
    // }

    // Find events by source
    public Page<Event> findEventsBySource(String source, Pageable pageable) {
        OffsetDateTime startDate = OffsetDateTime.now();
        return eventRepository.findEventsBySource(source, startDate, pageable);
    }

    // Find upcoming events
    public List<Event> findUpcomingEvents(int days) {
        OffsetDateTime startDate = OffsetDateTime.now();
        OffsetDateTime endDate = startDate.plusDays(days);
        return eventRepository.findUpcomingEvents(startDate, endDate);
    }

    public Optional<Event> findById(UUID id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(UUID id, Event eventDetails) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setStartDate(eventDetails.getStartDate());
        event.setEndDate(eventDetails.getEndDate());
        // Temporarily comment out relationship setters
        // event.setPlace(eventDetails.getPlace());
        // event.setCategory(eventDetails.getCategory());
        event.setSource(eventDetails.getSource());
        event.setExternalId(eventDetails.getExternalId());
        event.setExternalUrl(eventDetails.getExternalUrl());
        event.setIsRecurring(eventDetails.getIsRecurring());
        event.setRecurrencePattern(eventDetails.getRecurrencePattern());
        event.setStatus(eventDetails.getStatus());
        
        return eventRepository.save(event);
    }

    public void deleteEvent(UUID id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setStatus("deleted");
        eventRepository.save(event);
    }

    public Event findOrCreateEventByExternalId(String externalId, String source, Event eventData) {
        Event existingEvent = eventRepository.findByExternalIdAndSource(externalId, source);
        
        if (existingEvent != null) {
            existingEvent.setName(eventData.getName());
            existingEvent.setDescription(eventData.getDescription());
            existingEvent.setStartDate(eventData.getStartDate());
            existingEvent.setEndDate(eventData.getEndDate());
            // Temporarily comment out relationship setters
            // existingEvent.setPlace(eventData.getPlace());
            // existingEvent.setCategory(eventData.getCategory());
            existingEvent.setExternalUrl(eventData.getExternalUrl());
            existingEvent.setIsRecurring(eventData.getIsRecurring());
            existingEvent.setRecurrencePattern(eventData.getRecurrencePattern());
            existingEvent.setStatus("active");
            
            return eventRepository.save(existingEvent);
        } else {
            // Create new event
            eventData.setExternalId(externalId);
            eventData.setSource(source);
            return eventRepository.save(eventData);
        }
    }

    // Temporarily comment out place-based method due to relationship issues
    // public List<Event> findEventsByPlace(UUID placeId) {
    //     OffsetDateTime startDate = OffsetDateTime.now();
    //     return eventRepository.findEventsByPlace(placeId, startDate);
    // }

    public Long getEventCountBySource(String source) {
        return eventRepository.countBySource(source);
    }

    public Page<Event> searchEvents(String searchTerm, Pageable pageable) {
        return eventRepository.findAll(pageable);
    }

    public PlaceRepository getPlaceRepository() {
        return placeRepository;
    }

    public CategoryRepository getCategoryRepository() {
        return categoryRepository;
    }
}
*/
