package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    List<Event> findByVenueCode(String venueCode);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a WHERE LOWER(e.venue.city) = LOWER(:city) AND LOWER(a.stageName) = LOWER(:stageName)")
    List<Event> findByCityAndArtist(@Param("city") String city, @Param("stageName") String stageName);

    @Query("""
        SELECT DISTINCT e FROM Event e JOIN e.artists a
        WHERE e.status = :status
          AND e.eventDate > :afterDate
          AND LOWER(e.venue.city) = LOWER(:city)
          AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistText, '%'))
        ORDER BY e.eventDate ASC
    """)
    List<Event> findRecommendedEvents(
        @Param("status") EventStatus status,
        @Param("afterDate") OffsetDateTime afterDate,
        @Param("city") String city,
        @Param("artistText") String artistText
    );
}
