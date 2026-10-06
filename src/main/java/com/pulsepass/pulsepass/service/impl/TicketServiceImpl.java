package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.TicketResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.TicketMapper;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            TicketMapper ticketMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.userEmail()));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BusinessRuleException("Inactive user cannot purchase tickets");
        }

        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with code: " + request.eventCode()));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Cannot purchase tickets for event with status: " + event.getStatus());
        }

        if (!event.getEventDate().isAfter(OffsetDateTime.now())) {
            throw new BusinessRuleException("Cannot purchase tickets for a past event");
        }

        if (event.getMinimumAge() != null && event.getMinimumAge() > 0) {
            if (user.getProfile() == null || user.getProfile().getBirthDate() == null) {
                throw new BusinessRuleException("User birth date is required to verify minimum age");
            }
            LocalDate eventDate = event.getEventDate().toLocalDate();
            int age = Period.between(user.getProfile().getBirthDate(), eventDate).getYears();
            if (age < event.getMinimumAge()) {
                throw new BusinessRuleException("User does not meet minimum age: " + event.getMinimumAge());
            }
        }

        Venue venue = event.getVenue();
        long paidTickets = ticketRepository.countByEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        if (paidTickets >= venue.getCapacity()) {
            throw new BusinessRuleException("Event capacity reached. No tickets available");
        }

        BigDecimal price = calculatePrice(request.type());
        String ticketCode = "TCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        Ticket ticket = new Ticket(
                ticketCode,
                request.type(),
                price,
                TicketStatus.PAID,
                OffsetDateTime.now(),
                user,
                event
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        if (paidTickets + 1 >= venue.getCapacity()) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    public TicketResponse findByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with code: " + ticketCode));
    }

    @Override
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        return ticketRepository.findByEventEventCodeAndStatus(eventCode, TicketStatus.PAID)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with code: " + ticketCode));

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Cannot cancel ticket with status: " + ticket.getStatus());
        }

        if (!ticket.getEvent().getEventDate().isAfter(OffsetDateTime.now())) {
            throw new BusinessRuleException("Cannot cancel ticket after event date");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(updatedTicket);
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with code: " + ticketCode));

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Cannot mark as used a ticket with status: " + ticket.getStatus());
        }

        ticket.setStatus(TicketStatus.USED);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(updatedTicket);
    }

    private BigDecimal calculatePrice(TicketType type) {
        if (type == null) {
            throw new BusinessRuleException("Ticket type cannot be null");
        }
        BigDecimal price = switch (type) {
            case GENERAL -> new BigDecimal("50.00");
            case STUDENT -> new BigDecimal("30.00");
            case VIP -> new BigDecimal("100.00");
            case BACKSTAGE -> new BigDecimal("150.00");
        };

        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Ticket price cannot be negative");
        }

        return price;
    }
}
