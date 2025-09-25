package com.community.crm.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// Temporarily comment out @Repository to fix circular dependency
// @Repository
// public interface EventRepository extends JpaRepository<Event, UUID> {

    // Temporarily comment out all methods due to circular dependency
    // @Query("SELECT e FROM Event e " +
    //        "WHERE e.source = :source " +
    //        "AND e.status = 'active' " +
    //        "AND e.startDate >= :startDate " +
    //        "ORDER BY e.startDate ASC")
    // Page<Event> findEventsBySource(
    //     @Param("source") String source,
    //     @Param("startDate") OffsetDateTime startDate,
    //     Pageable pageable
    // );

    // @Query("SELECT e FROM Event e " +
    //        "WHERE e.status = 'active' " +
    //        "AND e.startDate >= :startDate " +
    //        "AND e.startDate <= :endDate " +
    //        "ORDER BY e.startDate ASC")
    // List<Event> findUpcomingEvents(
    //     @Param("startDate") OffsetDateTime startDate,
    //     @Param("endDate") OffsetDateTime endDate
    // );

    // Event findByExternalIdAndSource(String externalId, String source);

    // @Query("SELECT COUNT(e) FROM Event e " +
    //        "WHERE e.source = :source " +
    //        "AND e.status = 'active'")
    // Long countBySource(@Param("source") String source);
// }
