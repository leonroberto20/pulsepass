package com.pulsepass.pulsepass.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.RoleName;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.UserRoleRepository;
import com.pulsepass.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("pulsepass_security_test")
                    .withUsername("pulsepass")
                    .withPassword("pulsepass");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCredentialRepository credentialRepository;

    @Autowired
    private UserRoleRepository roleRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Venue testVenue;

    @BeforeEach
    void setUp() {
        ticketRepository.deleteAll();
        eventRepository.deleteAll();
        venueRepository.deleteAll();
        roleRepository.deleteAll();
        credentialRepository.deleteAll();
        userRepository.deleteAll();

        testVenue = venueRepository.save(new Venue(
                "VEN-INT-01", "Arena Central", "Bogotá", "Carrera 7", 10000, true
        ));
    }

    private String registerAndLogin(String username, String email, String password, RoleName... roles) throws Exception {
        RegisterUserRequest reg = new RegisterUserRequest(
                username, email, password, "Test", "User", "+573001234567",
                "Bogota", LocalDate.of(1995, 5, 20)
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        if (roles != null && roles.length > 0) {
            User user = userRepository.findByUsername(username).orElseThrow();
            for (RoleName role : roles) {
                if (role != RoleName.ROLE_USER) {
                    roleRepository.save(new UserRole(user, role));
                }
            }
        }

        LoginRequest login = new LoginRequest(username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("accessToken").asText();
    }

    // --- T-SEC-001, T-SEC-005, T-SEC-006: Registro, Login, Hash y Auth Me ---

    @Test
    @DisplayName("T-SEC-005 & T-SEC-006: Registro seguro con BCrypt, login exitoso y manejo de credenciales erróneas")
    void testRegistrationAndLoginFlow() throws Exception {
        RegisterUserRequest registerReq = new RegisterUserRequest(
                "andrea_sec", "andrea.sec@pulsepass.com", "SecurePass123!",
                "Andrea", "Castro", "+573001112233", "Barranquilla", LocalDate.of(1998, 3, 15)
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("andrea_sec"))
                .andExpect(jsonPath("$.email").value("andrea.sec@pulsepass.com"));

        // Verificar que la contraseña no se almacena en texto plano sino con hash BCrypt
        User user = userRepository.findByUsername("andrea_sec").orElseThrow();
        var credential = credentialRepository.findById(user.getId()).orElseThrow();
        assertThat(credential.getPasswordHash()).isNotEqualTo("SecurePass123!");
        assertThat(passwordEncoder.matches("SecurePass123!", credential.getPasswordHash())).isTrue();

        // T-SEC-006: Intento con contraseña errónea -> 401
        LoginRequest badLogin = new LoginRequest("andrea_sec", "WrongPassword!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        // T-SEC-005: Login con credenciales válidas -> 200 con JWT
        LoginRequest goodLogin = new LoginRequest("andrea_sec", "SecurePass123!");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goodLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value("andrea_sec"))
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // T-SEC-001: /api/auth/me sin token -> 401
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        // T-SEC-001: /api/auth/me con token Bearer -> 200
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("andrea_sec"))
                .andExpect(jsonPath("$.email").value("andrea.sec@pulsepass.com"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));
    }

    // --- T-SEC-002, T-SEC-003, T-SEC-004: RBAC en Creación de Eventos ---

    @Test
    @DisplayName("T-SEC-002, 003, 004: POST /api/events validación jerárquica de roles (Anónimo 401, USER 403, ADMIN 201)")
    void testEventCreationRbac() throws Exception {
        CreateEventRequest req = new CreateEventRequest(
                "EVT-RBAC-01", "Fest RBAC", "Descripcion", EventCategory.MUSIC,
                OffsetDateTime.now().plusDays(30), 18, testVenue.getCode()
        );
        String json = objectMapper.writeValueAsString(req);

        // T-SEC-002: Anónimo -> 401
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());

        // T-SEC-003: ROLE_USER -> 403
        String userToken = registerAndLogin("standard_user", "std@email.com", "Password123!");
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // T-SEC-004: ROLE_ADMIN -> 201
        String adminToken = registerAndLogin("admin_user", "admin@email.com", "Password123!", RoleName.ROLE_ADMIN);
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventCode").value("EVT-RBAC-01"));
    }

    // --- T-SEC-009, T-SEC-010: Anti-IDOR en Compra y Consulta de Tickets ---

    @Test
    @DisplayName("T-SEC-009 & T-SEC-010: Anti-IDOR en compra y consulta de tickets")
    void testAntiIdorTicketFlow() throws Exception {
        // Crear evento publicado
        Event event = eventRepository.save(new Event(
                "EVT-IDOR-01", "Evento IDOR", "Desc", EventCategory.MUSIC,
                EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(10), 18, testVenue
        ));

        String aliceToken = registerAndLogin("alice", "alice@email.com", "AlicePass123!");
        String bobToken = registerAndLogin("bob", "bob@email.com", "BobPassword123!");

        // T-SEC-010: Alice intenta comprar asignando el correo de Bob -> 403 Forbidden (Anti-IDOR)
        PurchaseTicketRequest idorPurchase = new PurchaseTicketRequest("bob@email.com", event.getEventCode(), TicketType.GENERAL);
        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(idorPurchase)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // Alice compra con su propio correo legítimo -> 201 Created
        PurchaseTicketRequest validPurchase = new PurchaseTicketRequest("alice@email.com", event.getEventCode(), TicketType.GENERAL);
        MvcResult purchaseResult = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPurchase)))
                .andExpect(status().isCreated())
                .andReturn();

        String ticketCode = objectMapper.readTree(purchaseResult.getResponse().getContentAsString()).get("ticketCode").asText();

        // T-SEC-009: Bob intenta consultar el ticket de Alice -> 403 Forbidden (Anti-IDOR)
        mockMvc.perform(get("/api/tickets/" + ticketCode)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // Alice consulta su propio ticket -> 200 OK
        mockMvc.perform(get("/api/tickets/" + ticketCode)
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value(ticketCode));
    }

    // --- T-SEC-012, T-SEC-013: Control Operativo STAFF en Validación de Tickets ---

    @Test
    @DisplayName("T-SEC-012 & T-SEC-013: Operación de ingreso (/use) restringida a STAFF o ADMIN")
    void testStaffTicketValidation() throws Exception {
        Event event = eventRepository.save(new Event(
                "EVT-STAFF-01", "Festival Staff", "Desc", EventCategory.MUSIC,
                EventStatus.PUBLISHED, OffsetDateTime.now().plusDays(10), 18, testVenue
        ));

        String userToken = registerAndLogin("attendee", "attendee@email.com", "Password123!");
        String staffToken = registerAndLogin("staff_worker", "staff@email.com", "Password123!", RoleName.ROLE_STAFF);

        // Asistente compra ticket
        PurchaseTicketRequest purchase = new PurchaseTicketRequest("attendee@email.com", event.getEventCode(), TicketType.VIP);
        MvcResult purchaseResult = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchase)))
                .andExpect(status().isCreated())
                .andReturn();

        String ticketCode = objectMapper.readTree(purchaseResult.getResponse().getContentAsString()).get("ticketCode").asText();

        // T-SEC-012: Asistente intenta marcar su propio ticket como usado -> 403 Forbidden
        mockMvc.perform(patch("/api/tickets/" + ticketCode + "/use")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // T-SEC-013: Personal STAFF valida el ticket en la entrada -> 200 OK
        mockMvc.perform(patch("/api/tickets/" + ticketCode + "/use")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));
    }

    // --- T-SEC-017: Protección de Eventos en Borrador (DRAFT) ---

    @Test
    @DisplayName("T-SEC-017: Evento en DRAFT inaccesible para anónimos y USER; accesible para ADMIN y STAFF")
    void testDraftEventProtection() throws Exception {
        Event draftEvent = eventRepository.save(new Event(
                "EVT-SECRET-01", "Secret Event", "Desc", EventCategory.MUSIC,
                EventStatus.DRAFT, OffsetDateTime.now().plusDays(15), 18, testVenue
        ));

        String userToken = registerAndLogin("normal_fan", "fan@email.com", "Password123!");
        String staffToken = registerAndLogin("staff_viewer", "staff.view@email.com", "Password123!", RoleName.ROLE_STAFF);

        // Anónimo intenta ver evento en borrador -> 403 Forbidden
        mockMvc.perform(get("/api/events/" + draftEvent.getEventCode()))
                .andExpect(status().isForbidden());

        // Usuario USER intenta ver evento en borrador -> 403 Forbidden
        mockMvc.perform(get("/api/events/" + draftEvent.getEventCode())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // STAFF consulta evento en borrador -> 200 OK
        mockMvc.perform(get("/api/events/" + draftEvent.getEventCode())
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("EVT-SECRET-01"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }
}
