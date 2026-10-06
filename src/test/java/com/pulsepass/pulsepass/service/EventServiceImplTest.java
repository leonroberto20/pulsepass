package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.response.EventResponse;
import com.pulsepass.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.EventMapper;
import com.pulsepass.pulsepass.repository.ArtistRepository;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.VenueRepository;
import com.pulsepass.pulsepass.service.impl.EventServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    @DisplayName("TEST-EVENT-001: Evento existente retorna DTO EventResponse")
    void shouldReturnEventResponseWhenEventExists() {
        // Arrange
        String eventCode = "CMF-2026";
        Event event = new Event();
        event.setEventCode(eventCode);
        EventResponse expectedResponse = new EventResponse(
                1L, eventCode, "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(30), 18,
                null, "VEN-01", "Marina Center", Collections.emptySet()
        );

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));
        when(eventMapper.toResponse(event)).thenReturn(expectedResponse);

        // Act
        EventResponse response = eventService.findByCode(eventCode);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.eventCode()).isEqualTo(eventCode);
        verify(eventRepository).findByEventCode(eventCode);
    }

    @Test
    @DisplayName("TEST-EVENT-002: Evento inexistente lanza ResourceNotFoundException")
    void shouldThrowResourceNotFoundExceptionWhenEventNotFound() {
        // Arrange
        String eventCode = "NON-EXISTENT";
        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> eventService.findByCode(eventCode))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found with code: " + eventCode);

        verify(eventRepository).findByEventCode(eventCode);
    }

    @Test
    @DisplayName("TEST-EVENT-003: Crear evento válido ejecuta save() e inicia en DRAFT")
    void shouldCreateEventSuccessfullyWhenValid() {
        // Arrange
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                OffsetDateTime.now().plusDays(30), 18, "VEN-SMR-01"
        );
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setActive(true);

        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);
        when(venueRepository.findByCode(request.venueCode())).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse expectedResponse = new EventResponse(
                1L, request.eventCode(), request.name(), request.description(), request.category(),
                EventStatus.DRAFT, request.eventDate(), request.minimumAge(),
                null, venue.getCode(), venue.getName(), Collections.emptySet()
        );
        when(eventMapper.toResponse(any(Event.class))).thenReturn(expectedResponse);

        // Act
        EventResponse result = eventService.create(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(EventStatus.DRAFT);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    @DisplayName("TEST-EVENT-003b: Crear evento con código duplicado lanza DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenEventCodeAlreadyExists() {
        // Arrange
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                OffsetDateTime.now().plusDays(30), 18, "VEN-SMR-01"
        );
        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    @DisplayName("TEST-EVENT-004: Venue inexistente lanza ResourceNotFoundException y save() nunca se ejecuta")
    void shouldThrowResourceNotFoundExceptionWhenVenueNotFoundOnCreate() {
        // Arrange
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                OffsetDateTime.now().plusDays(30), 18, "NON-VENUE"
        );
        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);
        when(venueRepository.findByCode(request.venueCode())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue not found with code");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    @DisplayName("TEST-EVENT-005: Venue inactivo lanza BusinessRuleException y no persiste")
    void shouldThrowBusinessRuleExceptionWhenVenueIsInactiveOnCreate() {
        // Arrange
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                OffsetDateTime.now().plusDays(30), 18, "VEN-SMR-01"
        );
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setActive(false);

        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);
        when(venueRepository.findByCode(request.venueCode())).thenReturn(Optional.of(venue));

        // Act & Assert
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("inactive venue");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    @DisplayName("TEST-EVENT-006: Fecha pasada lanza BusinessRuleException y no persiste")
    void shouldThrowBusinessRuleExceptionWhenEventDateIsInThePast() {
        // Arrange
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest", "Desc", EventCategory.MUSIC,
                OffsetDateTime.now().minusDays(1), 18, "VEN-SMR-01"
        );
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setActive(true);

        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);
        when(venueRepository.findByCode(request.venueCode())).thenReturn(Optional.of(venue));

        // Act & Assert
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("must be in the future");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    @DisplayName("TEST-EVENT-007: Publicar DRAFT válido transiciona a PUBLISHED")
    void shouldPublishDraftEventSuccessfully() {
        // Arrange
        String eventCode = "CMF-2026";
        Venue venue = new Venue();
        venue.setActive(true);

        Event event = new Event();
        event.setEventCode(eventCode);
        event.setStatus(EventStatus.DRAFT);
        event.setEventDate(OffsetDateTime.now().plusDays(10));
        event.setVenue(venue);

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);

        EventResponse expectedResponse = new EventResponse(
                1L, eventCode, "Fest", "Desc", EventCategory.MUSIC,
                EventStatus.PUBLISHED, event.getEventDate(), 18,
                null, "VEN", "Venue", Collections.emptySet()
        );
        when(eventMapper.toResponse(event)).thenReturn(expectedResponse);

        // Act
        EventResponse result = eventService.publish(eventCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(EventStatus.PUBLISHED);
        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(event);
    }

    @Test
    @DisplayName("TEST-EVENT-008: Publicar evento CANCELLED lanza BusinessRuleException y no persiste")
    void shouldThrowBusinessRuleExceptionWhenPublishingNonDraftEvent() {
        // Arrange
        String eventCode = "CMF-2026";
        Event event = new Event();
        event.setEventCode(eventCode);
        event.setStatus(EventStatus.CANCELLED);

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));

        // Act & Assert
        assertThatThrownBy(() -> eventService.publish(eventCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Only DRAFT events can be published");

        verify(eventRepository, never()).save(event);
    }

    @Test
    @DisplayName("TEST-EVENT-009: Asociar artista a evento exitosamente")
    void shouldAddArtistToEventSuccessfully() {
        // Arrange
        String eventCode = "CMF-2026";
        Long artistId = 10L;

        Event event = new Event();
        event.setEventCode(eventCode);
        event.setStatus(EventStatus.PUBLISHED);

        Artist artist = new Artist();
        artist.setId(artistId);
        artist.setStageName("Solar Beat");

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));
        when(artistRepository.findById(artistId)).thenReturn(Optional.of(artist));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(org.mockito.Mockito.mock(EventResponse.class));

        // Act
        EventResponse response = eventService.addArtist(eventCode, artistId);

        // Assert
        assertThat(response).isNotNull();
        assertThat(event.getArtists()).contains(artist);
        verify(eventRepository).save(event);
    }

    @Test
    @DisplayName("TEST-EVENT-010: Asociar artista ya vinculado lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenArtistAlreadyAssigned() {
        // Arrange
        String eventCode = "CMF-2026";
        Long artistId = 10L;

        Artist artist = new Artist();
        artist.setId(artistId);
        artist.setStageName("Solar Beat");

        Event event = new Event();
        event.setEventCode(eventCode);
        event.setStatus(EventStatus.PUBLISHED);
        event.getArtists().add(artist);

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));
        when(artistRepository.findById(artistId)).thenReturn(Optional.of(artist));

        // Act & Assert
        assertThatThrownBy(() -> eventService.addArtist(eventCode, artistId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already associated");

        verify(eventRepository, never()).save(event);
    }
}
