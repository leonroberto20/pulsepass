package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByCode(String code);

    boolean existsByCode(String code);

    List<Venue> findByActiveTrueOrderByNameAsc();
}
