package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.response.EventResponse;
import com.pulsepass.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.service.EventService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @Test
    @DisplayName("TEST-CTRL-EVT-001: Crear evento válido retorna 201 Created")
    void shouldCreateEventSuccessfully() throws Exception {
        OffsetDateTime date = OffsetDateTime.parse("2026-12-01T20:00:00Z");

        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival de música",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                date,
                18,
                null,
                "VEN-SMR-01",
                "Marina Convention Center",
                Set.of()
        );

        when(eventService.create(any(CreateEventRequest.class))).thenReturn(response);

        String jsonRequest = """
                {
                    "eventCode": "CMF-2026",
                    "name": "Caribbean Music Fest 2026",
                    "description": "Festival de música",
                    "category": "MUSIC",
                    "eventDate": "2026-12-01T20:00:00Z",
                    "minimumAge": 18,
                    "venueCode": "VEN-SMR-01"
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.minimumAge").value(18));

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-002: Request inválido retorna 400 Bad Request y no invoca Service")
    void shouldReturn400WhenCreateEventRequestIsInvalid() throws Exception {
        String invalidJson = """
                {
                    "eventCode": "",
                    "name": "",
                    "description": null,
                    "category": null,
                    "eventDate": null,
                    "minimumAge": -1,
                    "venueCode": ""
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.name").exists())
                .andExpect(jsonPath("$.details.category").exists())
                .andExpect(jsonPath("$.details.venueCode").exists());

        verify(eventService, never()).create(any());
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-003: Consultar evento existente retorna 200 OK")
    void shouldReturnEventWhenFound() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                OffsetDateTime.now().plusMonths(1),
                18,
                null,
                "VEN-SMR-01",
                "Marina Convention Center",
                Set.of()
        );

        when(eventService.findByCode("CMF-2026")).thenReturn(response);

        mockMvc.perform(get("/api/events/CMF-2026")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.name").value("Caribbean Music Fest 2026"));

        verify(eventService).findByCode("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-004: Consultar evento inexistente retorna 404 Not Found")
    void shouldReturn404WhenEventNotFound() throws Exception {
        when(eventService.findByCode("UNKNOWN"))
                .thenThrow(new ResourceNotFoundException("Event not found with code: UNKNOWN"));

        mockMvc.perform(get("/api/events/UNKNOWN")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Event not found with code: UNKNOWN"));

        verify(eventService).findByCode("UNKNOWN");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-005: Listar eventos publicados retorna 200 OK")
    void shouldReturnPublishedEvents() throws Exception {
        EventSummaryResponse summary = new EventSummaryResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                OffsetDateTime.now().plusMonths(1),
                "Marina Convention Center"
        );

        when(eventService.findPublishedEvents()).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/events/published")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        verify(eventService).findPublishedEvents();
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-006: Publicar evento válido retorna 200 OK")
    void shouldPublishEventSuccessfully() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                OffsetDateTime.now().plusMonths(1),
                18,
                null,
                "VEN-SMR-01",
                "Marina Convention Center",
                Set.of()
        );

        when(eventService.publish("CMF-2026")).thenReturn(response);

        mockMvc.perform(patch("/api/events/CMF-2026/publish")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-007: Publicar inválido lanza BusinessRuleException y retorna 409 Conflict")
    void shouldReturn409WhenPublishViolatesBusinessRule() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException("Cannot publish event without artists"));

        mockMvc.perform(patch("/api/events/CMF-2026/publish")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Cannot publish event without artists"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-008: Asociar artista retorna 200 OK")
    void shouldAddArtistSuccessfully() throws Exception {
        EventResponse response = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                OffsetDateTime.now().plusMonths(1),
                18,
                null,
                "VEN-SMR-01",
                "Marina Convention Center",
                Set.of()
        );

        when(eventService.addArtist("CMF-2026", 1L)).thenReturn(response);

        mockMvc.perform(post("/api/events/CMF-2026/artists/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"));

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    @Test
    @DisplayName("TEST-CTRL-EVT-009: Buscar eventos por artista retorna 200 OK")
    void shouldFindEventsByArtist() throws Exception {
        EventSummaryResponse summary = new EventSummaryResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                OffsetDateTime.now().plusMonths(1),
                "Marina Convention Center"
        );

        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/events/by-artist")
                        .param("stageName", "Solar Beat")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));

        verify(eventService).findByArtist("Solar Beat");
    }
}
