package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import com.pulsepass.pulsepass.service.impl.AuthorizationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private AuthorizationServiceImpl authorizationService;

    private User ownerUser;
    private Ticket ticket;
    private Event publishedEvent;
    private Event draftEvent;

    @BeforeEach
    void setUp() {
        ownerUser = new User();
        ownerUser.setId(10L);
        ownerUser.setUsername("andrea");
        ownerUser.setEmail("andrea@email.com");

        ticket = new Ticket();
        ticket.setTicketCode("TCK-12345");
        ticket.setUser(ownerUser);

        publishedEvent = new Event();
        publishedEvent.setEventCode("EVT-PUB");
        publishedEvent.setStatus(EventStatus.PUBLISHED);

        draftEvent = new Event();
        draftEvent.setEventCode("EVT-DFT");
        draftEvent.setStatus(EventStatus.DRAFT);
    }

    private Authentication createAuth(Long userId, String username, String email, String role) {
        SecurityPrincipal principal = new SecurityPrincipal(
                userId, username, email, "secret", true, Set.of(new SimpleGrantedAuthority(role))
        );
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    // --- isTicketOwner ---

    @Test
    @DisplayName("isTicketOwner: retorna false si authentication es nula o anónima")
    void isTicketOwner_unauthenticated() {
        assertThat(authorizationService.isTicketOwner(null, "TCK-12345")).isFalse();

        Authentication anon = new AnonymousAuthenticationToken(
                "key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
        );
        assertThat(authorizationService.isTicketOwner(anon, "TCK-12345")).isFalse();
    }

    @Test
    @DisplayName("isTicketOwner: ADMIN y STAFF siempre tienen acceso")
    void isTicketOwner_adminAndStaff() {
        Authentication admin = createAuth(1L, "admin", "admin@email.com", "ROLE_ADMIN");
        Authentication staff = createAuth(2L, "staff", "staff@email.com", "ROLE_STAFF");

        assertThat(authorizationService.isTicketOwner(admin, "TCK-12345")).isTrue();
        assertThat(authorizationService.isTicketOwner(staff, "TCK-12345")).isTrue();
    }

    @Test
    @DisplayName("isTicketOwner: USER propietario retorna true")
    void isTicketOwner_owner() {
        Authentication userAuth = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");
        when(ticketRepository.findByTicketCode("TCK-12345")).thenReturn(Optional.of(ticket));

        assertThat(authorizationService.isTicketOwner(userAuth, "TCK-12345")).isTrue();
    }

    @Test
    @DisplayName("isTicketOwner: USER no propietario (intento IDOR) retorna false")
    void isTicketOwner_nonOwner() {
        Authentication hackerAuth = createAuth(99L, "carlos", "carlos@email.com", "ROLE_USER");
        when(ticketRepository.findByTicketCode("TCK-12345")).thenReturn(Optional.of(ticket));

        assertThat(authorizationService.isTicketOwner(hackerAuth, "TCK-12345")).isFalse();
    }

    // --- canCancelTicket ---

    @Test
    @DisplayName("canCancelTicket: ADMIN y propietario pueden cancelar; STAFF no")
    void canCancelTicket_roles() {
        Authentication admin = createAuth(1L, "admin", "admin@email.com", "ROLE_ADMIN");
        Authentication staff = createAuth(2L, "staff", "staff@email.com", "ROLE_STAFF");
        Authentication owner = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");
        Authentication other = createAuth(99L, "carlos", "carlos@email.com", "ROLE_USER");

        when(ticketRepository.findByTicketCode("TCK-12345")).thenReturn(Optional.of(ticket));

        assertThat(authorizationService.canCancelTicket(admin, "TCK-12345")).isTrue();
        assertThat(authorizationService.canCancelTicket(owner, "TCK-12345")).isTrue();
        assertThat(authorizationService.canCancelTicket(staff, "TCK-12345")).isFalse();
        assertThat(authorizationService.canCancelTicket(other, "TCK-12345")).isFalse();
    }

    // --- isUserOwner ---

    @Test
    @DisplayName("isUserOwner: valida coincidencia de email o rol ADMIN")
    void isUserOwner_validation() {
        Authentication admin = createAuth(1L, "admin", "admin@email.com", "ROLE_ADMIN");
        Authentication user = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");

        assertThat(authorizationService.isUserOwner(admin, "other@email.com")).isTrue();
        assertThat(authorizationService.isUserOwner(user, "andrea@email.com")).isTrue();
        assertThat(authorizationService.isUserOwner(user, "other@email.com")).isFalse();
        assertThat(authorizationService.isUserOwner(null, "andrea@email.com")).isFalse();
    }

    // --- canPurchaseTicket (Anti-IDOR) ---

    @Test
    @DisplayName("canPurchaseTicket: USER solo puede comprar para su propio email (T-SEC-010)")
    void canPurchaseTicket_antiIdor() {
        Authentication admin = createAuth(1L, "admin", "admin@email.com", "ROLE_ADMIN");
        Authentication user = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");

        assertThat(authorizationService.canPurchaseTicket(admin, "anyone@email.com")).isTrue();
        assertThat(authorizationService.canPurchaseTicket(user, "andrea@email.com")).isTrue();
        assertThat(authorizationService.canPurchaseTicket(user, "carlos@email.com")).isFalse();
    }

    // --- canAccessEvent (Protección de Borradores T-SEC-017) ---

    @Test
    @DisplayName("canAccessEvent: Evento PUBLISHED es accesible para cualquier usuario o anónimo")
    void canAccessEvent_published() {
        when(eventRepository.findByEventCode("EVT-PUB")).thenReturn(Optional.of(publishedEvent));

        assertThat(authorizationService.canAccessEvent(null, "EVT-PUB")).isTrue();

        Authentication user = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");
        assertThat(authorizationService.canAccessEvent(user, "EVT-PUB")).isTrue();
    }

    @Test
    @DisplayName("canAccessEvent: Evento DRAFT solo es accesible para ADMIN o STAFF (T-SEC-017)")
    void canAccessEvent_draft() {
        when(eventRepository.findByEventCode("EVT-DFT")).thenReturn(Optional.of(draftEvent));

        Authentication admin = createAuth(1L, "admin", "admin@email.com", "ROLE_ADMIN");
        Authentication staff = createAuth(2L, "staff", "staff@email.com", "ROLE_STAFF");
        Authentication user = createAuth(10L, "andrea", "andrea@email.com", "ROLE_USER");

        assertThat(authorizationService.canAccessEvent(null, "EVT-DFT")).isFalse();
        assertThat(authorizationService.canAccessEvent(user, "EVT-DFT")).isFalse();
        assertThat(authorizationService.canAccessEvent(staff, "EVT-DFT")).isTrue();
        assertThat(authorizationService.canAccessEvent(admin, "EVT-DFT")).isTrue();
    }
}
