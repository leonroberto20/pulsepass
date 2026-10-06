package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserProfile;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.TicketResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.TicketMapper;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private User validUser;
    private Event validEvent;
    private Venue venue;

    @BeforeEach
    void setUp() {
        venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setCapacity(3);
        venue.setActive(true);

        validEvent = new Event();
        validEvent.setEventCode("CMF-2026");
        validEvent.setName("Caribbean Music Fest 2026");
        validEvent.setStatus(EventStatus.PUBLISHED);
        validEvent.setEventDate(OffsetDateTime.now().plusMonths(6));
        validEvent.setMinimumAge(18);
        validEvent.setVenue(venue);

        validUser = new User("andrea99", "andrea@email.com", true);
        UserProfile profile = new UserProfile(
                "Andrea", "Gomez", "3001234567", "Santa Marta",
                LocalDate.now().minusYears(25), validUser
        );
        validUser.assignProfile(profile);
    }

    @Test
    @DisplayName("TEST-TICKET-001: Compra válida genera ticket en estado PAID")
    void shouldPurchaseTicketSuccessfully() {
        // Arrange
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.VIP);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));
        when(ticketRepository.countByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(0L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponse expectedResponse = new TicketResponse(
                1L, "TCK-12345", TicketType.VIP, new BigDecimal("100.00"),
                TicketStatus.PAID, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", validEvent.getName()
        );
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(expectedResponse);

        // Act
        TicketResponse response = ticketService.purchase(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(TicketStatus.PAID);
        assertThat(response.price()).isEqualTo(new BigDecimal("100.00"));
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-002: Usuario inexistente lanza ResourceNotFoundException")
    void shouldThrowResourceNotFoundExceptionWhenUserNotFoundOnPurchase() {
        // Arrange
        PurchaseTicketRequest request = new PurchaseTicketRequest("ghost@email.com", "CMF-2026", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with email");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-003: Usuario inactivo lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenUserIsInactive() {
        // Arrange
        validUser.setActive(false);
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Inactive user cannot purchase tickets");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-004: Evento en DRAFT lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenEventIsDraft() {
        // Arrange
        validEvent.setStatus(EventStatus.DRAFT);
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot purchase tickets for event with status: DRAFT");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-005: Evento CANCELLED lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenEventIsCancelled() {
        // Arrange
        validEvent.setStatus(EventStatus.CANCELLED);
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot purchase tickets for event with status: CANCELLED");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-006: Usuario menor de edad lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenUserIsUnderage() {
        // Arrange
        validUser.getProfile().setBirthDate(validEvent.getEventDate().toLocalDate().minusYears(17)); // 17 años al día del evento
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("User does not meet minimum age: 18");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-007: Evento sin capacidad lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenCapacityExceeded() {
        // Arrange
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));
        when(ticketRepository.countByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(3L); // capacidad es 3

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Event capacity reached");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-008: Último ticket disponible guarda ticket y cambia evento a SOLD_OUT")
    void shouldUpdateEventToSoldOutWhenLastTicketPurchased() {
        // Arrange
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(validUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(validEvent));
        when(ticketRepository.countByEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(2L); // 2 de 3
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponse expectedResponse = new TicketResponse(
                3L, "TCK-LAST", TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.PAID, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", validEvent.getName()
        );
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(expectedResponse);

        // Act
        TicketResponse response = ticketService.purchase(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(validEvent.getStatus()).isEqualTo(EventStatus.SOLD_OUT);
        verify(eventRepository).save(validEvent);
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    @DisplayName("TEST-TICKET-009: Cancelar ticket PAID transiciona a CANCELLED")
    void shouldCancelPaidTicketSuccessfully() {
        // Arrange
        String ticketCode = "TCK-12345";
        Ticket ticket = new Ticket(
                ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.PAID, OffsetDateTime.now(), validUser, validEvent
        );

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);

        TicketResponse expectedResponse = new TicketResponse(
                1L, ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.CANCELLED, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", validEvent.getName()
        );
        when(ticketMapper.toResponse(ticket)).thenReturn(expectedResponse);

        // Act
        TicketResponse response = ticketService.cancel(ticketCode);

        // Assert
        assertThat(response).isNotNull();
        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.CANCELLED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    @DisplayName("TEST-TICKET-010: Cancelar ticket USED lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenCancellingUsedTicket() {
        // Arrange
        String ticketCode = "TCK-12345";
        Ticket ticket = new Ticket(
                ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.USED, OffsetDateTime.now(), validUser, validEvent
        );

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(ticket));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.cancel(ticketCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot cancel ticket with status: USED");

        verify(ticketRepository, never()).save(ticket);
    }

    @Test
    @DisplayName("TEST-TICKET-011: Marcar PAID como usado transiciona a USED")
    void shouldMarkPaidTicketAsUsedSuccessfully() {
        // Arrange
        String ticketCode = "TCK-12345";
        Ticket ticket = new Ticket(
                ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.PAID, OffsetDateTime.now(), validUser, validEvent
        );

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);

        TicketResponse expectedResponse = new TicketResponse(
                1L, ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.USED, OffsetDateTime.now(), "andrea@email.com", "CMF-2026", validEvent.getName()
        );
        when(ticketMapper.toResponse(ticket)).thenReturn(expectedResponse);

        // Act
        TicketResponse response = ticketService.markAsUsed(ticketCode);

        // Assert
        assertThat(response).isNotNull();
        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.USED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    @DisplayName("TEST-TICKET-012: Usar ticket CANCELLED lanza BusinessRuleException")
    void shouldThrowBusinessRuleExceptionWhenMarkingCancelledTicketAsUsed() {
        // Arrange
        String ticketCode = "TCK-12345";
        Ticket ticket = new Ticket(
                ticketCode, TicketType.GENERAL, new BigDecimal("50.00"),
                TicketStatus.CANCELLED, OffsetDateTime.now(), validUser, validEvent
        );

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(ticket));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.markAsUsed(ticketCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot mark as used a ticket with status: CANCELLED");

        verify(ticketRepository, never()).save(ticket);
    }
}
