package com.pulsepass.pulsepass.security;

import com.pulsepass.pulsepass.controller.EventController;
import com.pulsepass.pulsepass.controller.TicketController;
import com.pulsepass.pulsepass.controller.UserController;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.EventResponse;
import com.pulsepass.pulsepass.dto.response.TicketResponse;
import com.pulsepass.pulsepass.service.AuthorizationService;
import com.pulsepass.pulsepass.service.EventService;
import com.pulsepass.pulsepass.service.TicketService;
import com.pulsepass.pulsepass.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {TicketController.class, EventController.class, UserController.class})
@Import({SecurityConfig.class, SecurityBeansConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class AntiIdorSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private UserService userService;

    @MockitoBean(name = "authorizationService")
    private AuthorizationService authorizationService;

    private UsernamePasswordAuthenticationToken auth(Long userId, String username, String email, String role) {
        SecurityPrincipal principal = new SecurityPrincipal(
                userId, username, email, "hash", true,
                List.of(new SimpleGrantedAuthority(role))
        );
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    // --- T-SEC-002, T-SEC-003, T-SEC-004: POST /api/events RBAC ---

    @Test
    @DisplayName("T-SEC-002: POST /api/events anónimo retorna 401 Unauthorized")
    void createEvent_anonymous_returns401() throws Exception {
        String json = """
                {
                    "eventCode": "CMF-2026",
                    "name": "Fest",
                    "category": "MUSIC",
                    "eventDate": "2026-12-01T20:00:00Z",
                    "minimumAge": 18,
                    "venueCode": "VEN-01"
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("T-SEC-003: POST /api/events con ROLE_USER retorna 403 Forbidden")
    void createEvent_asUser_returns403() throws Exception {
        String json = """
                {
                    "eventCode": "CMF-2026",
                    "name": "Fest",
                    "category": "MUSIC",
                    "eventDate": "2026-12-01T20:00:00Z",
                    "minimumAge": 18,
                    "venueCode": "VEN-01"
                }
                """;

        mockMvc.perform(post("/api/events")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("T-SEC-004: POST /api/events con ROLE_ADMIN retorna 201 Created")
    void createEvent_asAdmin_returns201() throws Exception {
        EventResponse response = new EventResponse(
                1L, "CMF-2026", "Fest", "Desc", EventCategory.MUSIC,
                EventStatus.DRAFT, OffsetDateTime.now().plusDays(10), 18,
                null, "VEN-01", "Venue", Set.of()
        );
        when(eventService.create(any(CreateEventRequest.class))).thenReturn(response);

        String json = """
                {
                    "eventCode": "CMF-2026",
                    "name": "Fest",
                    "category": "MUSIC",
                    "eventDate": "2026-12-01T20:00:00Z",
                    "minimumAge": 18,
                    "venueCode": "VEN-01"
                }
                """;

        mockMvc.perform(post("/api/events")
                        .with(authentication(auth(1L, "admin", "admin@email.com", "ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"));
    }

    // --- T-SEC-009: Anti-IDOR en GET /api/tickets/{ticketCode} ---

    @Test
    @DisplayName("T-SEC-009: GET /api/tickets/{code} ajeno con ROLE_USER retorna 403 Forbidden (Anti-IDOR)")
    void getTicket_nonOwner_returns403() throws Exception {
        when(authorizationService.isTicketOwner(any(), eq("TCK-ANDREA-001"))).thenReturn(false);

        mockMvc.perform(get("/api/tickets/TCK-ANDREA-001")
                        .with(authentication(auth(99L, "carlos", "carlos@email.com", "ROLE_USER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("T-SEC-009b: GET /api/tickets/{code} propio con ROLE_USER retorna 200 OK")
    void getTicket_owner_returns200() throws Exception {
        when(authorizationService.isTicketOwner(any(), eq("TCK-ANDREA-001"))).thenReturn(true);
        TicketResponse response = new TicketResponse(
                1L, "TCK-ANDREA-001", TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.PAID, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", "Fest"
        );
        when(ticketService.findByCode("TCK-ANDREA-001")).thenReturn(response);

        mockMvc.perform(get("/api/tickets/TCK-ANDREA-001")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TCK-ANDREA-001"));
    }

    // --- T-SEC-010: Anti-IDOR en POST /api/tickets ---

    @Test
    @DisplayName("T-SEC-010: POST /api/tickets con email ajeno en body retorna 403 Forbidden (Anti-IDOR)")
    void purchaseTicket_otherUserEmail_returns403() throws Exception {
        when(authorizationService.canPurchaseTicket(any(), eq("carlos@email.com"))).thenReturn(false);

        String json = """
                {
                    "userEmail": "carlos@email.com",
                    "eventCode": "CMF-2026",
                    "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("T-SEC-010b: POST /api/tickets con email propio retorna 201 Created")
    void purchaseTicket_ownEmail_returns201() throws Exception {
        when(authorizationService.canPurchaseTicket(any(), eq("andrea@email.com"))).thenReturn(true);

        TicketResponse response = new TicketResponse(
                1L, "TCK-ANDREA-001", TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.PAID, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", "Fest"
        );
        when(ticketService.purchase(any(PurchaseTicketRequest.class))).thenReturn(response);

        String json = """
                {
                    "userEmail": "andrea@email.com",
                    "eventCode": "CMF-2026",
                    "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketCode").value("TCK-ANDREA-001"));
    }

    // --- T-SEC-011: Cancelación de Ticket ---

    @Test
    @DisplayName("T-SEC-011: PATCH /api/tickets/{code}/cancel de ticket propio retorna 200 OK")
    void cancelTicket_owner_returns200() throws Exception {
        when(authorizationService.canCancelTicket(any(), eq("TCK-ANDREA-001"))).thenReturn(true);

        TicketResponse response = new TicketResponse(
                1L, "TCK-ANDREA-001", TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.CANCELLED, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", "Fest"
        );
        when(ticketService.cancel("TCK-ANDREA-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TCK-ANDREA-001/cancel")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // --- T-SEC-012 & T-SEC-013: PATCH /api/tickets/{code}/use ---

    @Test
    @DisplayName("T-SEC-012: PATCH /api/tickets/{code}/use con ROLE_USER retorna 403 Forbidden")
    void useTicket_asUser_returns403() throws Exception {
        mockMvc.perform(patch("/api/tickets/TCK-001/use")
                        .with(authentication(auth(10L, "andrea", "andrea@email.com", "ROLE_USER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("T-SEC-013: PATCH /api/tickets/{code}/use con ROLE_STAFF retorna 200 OK")
    void useTicket_asStaff_returns200() throws Exception {
        TicketResponse response = new TicketResponse(
                1L, "TCK-001", TicketType.VIP, new BigDecimal("100.00"),
                TicketStatus.USED, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", "Fest"
        );
        when(ticketService.markAsUsed("TCK-001")).thenReturn(response);

        mockMvc.perform(patch("/api/tickets/TCK-001/use")
                        .with(authentication(auth(2L, "staff", "staff@email.com", "ROLE_STAFF"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));
    }

    // --- T-SEC-017: Protección de Eventos en DRAFT ---

    @Test
    @DisplayName("T-SEC-017: GET /api/events/{code} de evento DRAFT sin permisos retorna 403 Forbidden")
    void getDraftEvent_denied() throws Exception {
        when(authorizationService.canAccessEvent(any(), eq("CMF-DRAFT"))).thenReturn(false);

        mockMvc.perform(get("/api/events/CMF-DRAFT"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("T-SEC-017b: GET /api/events/{code} de evento DRAFT con ROLE_ADMIN retorna 200 OK")
    void getDraftEvent_asAdmin_allowed() throws Exception {
        when(authorizationService.canAccessEvent(any(), eq("CMF-DRAFT"))).thenReturn(true);
        EventResponse response = new EventResponse(
                1L, "CMF-DRAFT", "Draft Fest", "Desc", EventCategory.MUSIC,
                EventStatus.DRAFT, OffsetDateTime.now().plusDays(10), 18,
                null, "VEN-01", "Venue", Set.of()
        );
        when(eventService.findByCode("CMF-DRAFT")).thenReturn(response);

        mockMvc.perform(get("/api/events/CMF-DRAFT")
                        .with(authentication(auth(1L, "admin", "admin@email.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("CMF-DRAFT"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }
}
