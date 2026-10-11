package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.TicketResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @Test
    @DisplayName("TEST-CTRL-TKT-001: Compra válida retorna 201 Created")
    void shouldPurchaseTicketSuccessfully() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.purchase(any(PurchaseTicketRequest.class))).thenReturn(response);

        String jsonRequest = """
                {
                    "userEmail": "andrea@email.com",
                    "eventCode": "CMF-2026",
                    "type": "VIP"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-CMF-001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.type").value("VIP"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-002: Request de compra inválido retorna 400 Bad Request y no invoca Service")
    void shouldReturn400WhenPurchaseTicketRequestIsInvalid() throws Exception {
        String invalidJson = """
                {
                    "userEmail": "",
                    "eventCode": "",
                    "type": null
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.userEmail").exists())
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.type").exists());

        verify(ticketService, never()).purchase(any());
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-003: Compra con usuario inexistente retorna 404 Not Found")
    void shouldReturn404WhenUserNotFoundOnPurchase() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException("User not found with email: ghost@email.com"));

        String jsonRequest = """
                {
                    "userEmail": "ghost@email.com",
                    "eventCode": "CMF-2026",
                    "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("User not found with email: ghost@email.com"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-004: Compra que viola regla de negocio retorna 409 Conflict")
    void shouldReturn409WhenBusinessRuleFailsOnPurchase() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException("User does not meet minimum age requirement"));

        String jsonRequest = """
                {
                    "userEmail": "laura@email.com",
                    "eventCode": "CMF-2026",
                    "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("User does not meet minimum age requirement"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-005: Consultar ticket por código retorna 200 OK")
    void shouldFindTicketByCode() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.findByCode("TKT-CMF-001")).thenReturn(response);

        mockMvc.perform(get("/api/tickets/TKT-CMF-001")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-CMF-001"))
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(ticketService).findByCode("TKT-CMF-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-006: Consultar tickets por usuario retorna 200 OK")
    void shouldFindTicketsByUser() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.findByUserEmail("andrea@email.com")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/tickets/by-user")
                        .param("email", "andrea@email.com")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].ticketCode").value("TKT-CMF-001"));

        verify(ticketService).findByUserEmail("andrea@email.com");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-007: Consultar tickets PAID por evento retorna 200 OK")
    void shouldFindPaidTicketsByEvent() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.PAID,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.findPaidTicketsByEvent("CMF-2026")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("PAID"));

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-008: Cancelar ticket válido retorna 200 OK")
    void shouldCancelTicketSuccessfully() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.CANCELLED,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.cancel("TKT-CMF-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TKT-CMF-001/cancel")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-CMF-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-009: Cancelar ticket inválido retorna 409 Conflict")
    void shouldReturn409WhenCancelFails() throws Exception {
        when(ticketService.cancel("TKT-CMF-001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be cancelled"));

        mockMvc.perform(patch("/api/tickets/TKT-CMF-001/cancel")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Only PAID tickets can be cancelled"));

        verify(ticketService).cancel("TKT-CMF-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-010: Marcar ticket como usado retorna 200 OK")
    void shouldMarkTicketAsUsedSuccessfully() throws Exception {
        TicketResponse response = new TicketResponse(
                1L,
                "TKT-CMF-001",
                TicketType.VIP,
                new BigDecimal("150.00"),
                TicketStatus.USED,
                OffsetDateTime.now(),
                "andrea@email.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        when(ticketService.markAsUsed("TKT-CMF-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TKT-CMF-001/use")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-CMF-001");
    }

    @Test
    @DisplayName("TEST-CTRL-TKT-011: Marcar ticket inválido como usado retorna 409 Conflict")
    void shouldReturn409WhenMarkAsUsedFails() throws Exception {
        when(ticketService.markAsUsed("TKT-CMF-001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be marked as used"));

        mockMvc.perform(patch("/api/tickets/TKT-CMF-001/use")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Only PAID tickets can be marked as used"));

        verify(ticketService).markAsUsed("TKT-CMF-001");
    }
}
