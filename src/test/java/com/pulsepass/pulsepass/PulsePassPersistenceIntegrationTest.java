package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserProfile;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.repository.ArtistRepository;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserProfileRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest
@Transactional
class PulsePassPersistenceIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("pulsepass_test")
                    .withUsername("pulsepass")
                    .withPassword("pulsepass");

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("QT-001 / QT-002: Flyway aplica V1, V2 y V3 y Hibernate valida el esquema exitosamente")
    void testFlywayMigrationsApplied() {
        Integer migrationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = true",
                Integer.class
        );
        assertThat(migrationCount).isNotNull().isGreaterThanOrEqualTo(3);

        List<String> scriptNames = jdbcTemplate.queryForList(
                "SELECT script FROM flyway_schema_history ORDER BY installed_rank",
                String.class
        );
        assertThat(scriptNames).contains(
                "V1__create_schema.sql",
                "V2__insert_initial_artists.sql",
                "V3__add_streaming_url_to_event.sql"
        );
    }

    @Test
    @DisplayName("QT-003 / AC-001 / AC-002: Relación Venue 1:N Event y búsqueda por código")
    void testVenueEventRelationship() {
        Venue venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 10 # 1-02", 5000, true);
        venueRepository.save(venue);

        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival internacional junto al mar",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                OffsetDateTime.of(2026, 7, 15, 18, 0, 0, 0, ZoneOffset.UTC),
                18,
                venue
        );
        event.setStreamingUrl("https://stream.pulsepass.com/cmf2026");
        eventRepository.save(event);

        Optional<Venue> retrievedVenue = venueRepository.findByCode("VEN-SMR-01");
        assertThat(retrievedVenue).isPresent();
        assertThat(retrievedVenue.get().getCapacity()).isGreaterThan(0);

        Optional<Event> retrievedEvent = eventRepository.findByEventCode("CMF-2026");
        assertThat(retrievedEvent).isPresent();
        assertThat(retrievedEvent.get().getVenue().getCode()).isEqualTo("VEN-SMR-01");
        assertThat(retrievedEvent.get().getStreamingUrl()).isEqualTo("https://stream.pulsepass.com/cmf2026");

        List<Event> venueEvents = eventRepository.findByVenueCode("VEN-SMR-01");
        assertThat(venueEvents).hasSize(1);
        assertThat(venueEvents.getFirst().getEventCode()).isEqualTo("CMF-2026");
    }

    @Test
    @DisplayName("QT-004 / AC-004: Relación User 1:1 UserProfile y unicidad de perfil")
    void testUser1to1UserProfile() {
        User user = new User("andrea_c", "andrea@example.com", true);
        UserProfile profile = new UserProfile(
                "Andrea",
                "Castro",
                "+573001112233",
                "Barranquilla",
                LocalDate.of(1995, 5, 20),
                user
        );
        user.assignProfile(profile);
        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByEmailIgnoreCase("ANDREA@EXAMPLE.COM");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getProfile()).isNotNull();
        assertThat(foundUser.get().getProfile().getFirstName()).isEqualTo("Andrea");

        Optional<UserProfile> foundProfile = userProfileRepository.findByUserEmailIgnoreCase("andrea@example.com");
        assertThat(foundProfile).isPresent();
        assertThat(foundProfile.get().getUser().getUsername()).isEqualTo("andrea_c");
    }

    @Test
    @DisplayName("QT-005 / AC-003 / AC-007: Relación Event N:M Artist y consulta JPQL por artista")
    void testEventArtistManyToMany() {
        Venue venue = venueRepository.save(new Venue("VEN-BOG-01", "Movistar Arena", "Bogotá", "Diag 61C", 14000, true));

        Artist solarBeat = artistRepository.findByStageName("Solar Beat")
                .orElseGet(() -> artistRepository.save(new Artist("Solar Beat", "Colombia", "ELECTRONIC", true)));
        Artist neonWaves = artistRepository.findByStageName("Neon Waves")
                .orElseGet(() -> artistRepository.save(new Artist("Neon Waves", "Mexico", "SYNTHWAVE", true)));

        Event event1 = new Event("ELEC-01", "Electro Night", "Desc", EventCategory.MUSIC, EventStatus.PUBLISHED,
                OffsetDateTime.now().plusDays(10), 18, venue);
        event1.addArtist(solarBeat);
        event1.addArtist(neonWaves);
        eventRepository.save(event1);

        Event event2 = new Event("ELEC-02", "Summer Beats", "Desc", EventCategory.MUSIC, EventStatus.PUBLISHED,
                OffsetDateTime.now().plusDays(20), 18, venue);
        event2.addArtist(solarBeat);
        eventRepository.save(event2);

        List<Event> solarBeatEvents = eventRepository.findByArtistStageName("Solar Beat");
        assertThat(solarBeatEvents).hasSize(2);

        List<Event> neonWavesEvents = eventRepository.findByArtistStageName("Neon Waves");
        assertThat(neonWavesEvents).hasSize(1);
        assertThat(neonWavesEvents.getFirst().getEventCode()).isEqualTo("ELEC-01");
    }

    @Test
    @DisplayName("QT-006 / QT-008 / AC-008: Gestión de tickets, navegación y conteo con JPQL")
    void testTicketOperationsAndCount() {
        Venue venue = venueRepository.save(new Venue("VEN-MDE-01", "Plaza Mayor", "Medellín", "Calle 41", 3000, true));
        Event event = eventRepository.save(new Event("MED-2026", "Tech Summit 2026", "Conferencia",
                EventCategory.TECHNOLOGY, EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(5), 0, venue));

        User user1 = userRepository.save(new User("carlos_m", "carlos@example.com", true));
        User user2 = userRepository.save(new User("laura_g", "laura@example.com", true));

        Ticket ticket1 = new Ticket("TCK-001", TicketType.VIP, new BigDecimal("250000.00"), TicketStatus.PAID,
                OffsetDateTime.now(), user1, event);
        Ticket ticket2 = new Ticket("TCK-002", TicketType.GENERAL, new BigDecimal("120000.00"), TicketStatus.PAID,
                OffsetDateTime.now(), user2, event);
        Ticket ticket3 = new Ticket("TCK-003", TicketType.GENERAL, new BigDecimal("120000.00"), TicketStatus.RESERVED,
                OffsetDateTime.now(), user1, event);
        Ticket ticket4 = new Ticket("TCK-004", TicketType.VIP, new BigDecimal("250000.00"), TicketStatus.CANCELLED,
                OffsetDateTime.now(), user2, event);

        ticketRepository.saveAll(List.of(ticket1, ticket2, ticket3, ticket4));

        List<Ticket> paidTickets = ticketRepository.findByEventEventCodeAndStatus("MED-2026", TicketStatus.PAID);
        assertThat(paidTickets).hasSize(2);

        long paidCount = ticketRepository.countByEventCodeAndStatus("MED-2026", TicketStatus.PAID);
        assertThat(paidCount).isEqualTo(2);

        List<Ticket> user1Tickets = ticketRepository.findByUserEmailIgnoreCaseAndStatus("carlos@example.com", TicketStatus.PAID);
        assertThat(user1Tickets).hasSize(1);
        assertThat(user1Tickets.getFirst().getTicketCode()).isEqualTo("TCK-001");
    }

    @Test
    @DisplayName("QT-007 / AC-006: Filtrar eventos PUBLISHED ordenados por fecha")
    void testPublishedEventsSorted() {
        Venue venue = venueRepository.save(new Venue("VEN-CTG-01", "Centro de Convenciones", "Cartagena", "Getsemaní", 2000, true));
        OffsetDateTime now = OffsetDateTime.now();

        Event draftEvent = new Event("EVT-DRAFT", "Draft Event", "Desc", EventCategory.CULTURE,
                EventStatus.DRAFT, now.plusDays(1), 0, venue);
        Event published1 = new Event("EVT-PUB-2", "Future Pub 2", "Desc", EventCategory.CULTURE,
                EventStatus.PUBLISHED, now.plusDays(10), 0, venue);
        Event published2 = new Event("EVT-PUB-1", "Future Pub 1", "Desc", EventCategory.CULTURE,
                EventStatus.PUBLISHED, now.plusDays(2), 0, venue);
        Event cancelledEvent = new Event("EVT-CANCEL", "Cancelled Event", "Desc", EventCategory.CULTURE,
                EventStatus.CANCELLED, now.plusDays(5), 0, venue);

        eventRepository.saveAll(List.of(draftEvent, published1, published2, cancelledEvent));

        List<Event> publishedEvents = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);
        assertThat(publishedEvents).extracting(Event::getEventCode)
                .containsExactly("EVT-PUB-1", "EVT-PUB-2");
    }

    @Test
    @DisplayName("FR-SRC-003: Consulta compleja JPQL de eventos recomendados")
    void testRecommendedEventsJPQL() {
        Venue venue = venueRepository.save(new Venue("VEN-BAQ-01", "Puerta de Oro", "Barranquilla", "Via 40", 4000, true));
        Artist artist = artistRepository.findByStageName("Caribbean Sound")
                .orElseGet(() -> artistRepository.save(new Artist("Caribbean Sound", "Colombia", "REGGAE", true)));

        Event event = new Event("BAQ-FEST", "Carnival Sounds", "Festival", EventCategory.MUSIC,
                EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(15), 18, venue);
        event.addArtist(artist);
        eventRepository.save(event);

        List<Event> recommended = eventRepository.findRecommendedEvents(
                EventStatus.PUBLISHED,
                OffsetDateTime.now(),
                "barranquilla",
                "caribbean"
        );

        assertThat(recommended).hasSize(1);
        assertThat(recommended.getFirst().getEventCode()).isEqualTo("BAQ-FEST");
    }

    @Test
    @DisplayName("QT-009 / AC-005: Restricción UNIQUE en ticketCode lanza DataIntegrityViolationException")
    void testUniqueTicketCodeConstraint() {
        Venue venue = venueRepository.save(new Venue("VEN-PER-01", "Expofuturo", "Pereira", "Cra 19", 3500, true));
        Event event = eventRepository.save(new Event("PER-2026", "Coffee Fest", "Desc", EventCategory.CULTURE,
                EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(3), 0, venue));
        User user = userRepository.save(new User("miguel_p", "miguel@example.com", true));

        Ticket ticket1 = new Ticket("TCK-DUPLICATE", TicketType.GENERAL, new BigDecimal("50000.00"),
                TicketStatus.PAID, OffsetDateTime.now(), user, event);
        ticketRepository.saveAndFlush(ticket1);

        Ticket ticket2 = new Ticket("TCK-DUPLICATE", TicketType.VIP, new BigDecimal("100000.00"),
                TicketStatus.PAID, OffsetDateTime.now(), user, event);

        assertThatThrownBy(() -> ticketRepository.saveAndFlush(ticket2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
