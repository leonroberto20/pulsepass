package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import com.pulsepass.pulsepass.service.AuthorizationService;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service("authorizationService")
@Transactional(readOnly = true)
public class AuthorizationServiceImpl implements AuthorizationService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public AuthorizationServiceImpl(TicketRepository ticketRepository, EventRepository eventRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public boolean isTicketOwner(Authentication authentication, String ticketCode) {
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth)) {
            return false;
        }

        if (hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_STAFF")) {
            return true;
        }

        Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(ticketCode);
        if (ticketOpt.isEmpty()) {
            return true; // Let the service throw ResourceNotFoundException
        }

        Ticket ticket = ticketOpt.get();
        return matchesTicketOwner(auth, ticket);
    }

    @Override
    public boolean canCancelTicket(Authentication authentication, String ticketCode) {
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth)) {
            return false;
        }

        if (hasRole(auth, "ROLE_ADMIN")) {
            return true;
        }

        // STAFF cannot cancel tickets - only owner or admin can
        Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(ticketCode);
        if (ticketOpt.isEmpty()) {
            return true; // Let the service throw ResourceNotFoundException
        }

        Ticket ticket = ticketOpt.get();
        return matchesTicketOwner(auth, ticket);
    }

    @Override
    public boolean isUserOwner(Authentication authentication, String email) {
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth) || email == null) {
            return false;
        }

        if (hasRole(auth, "ROLE_ADMIN")) {
            return true;
        }

        if (auth.getPrincipal() instanceof SecurityPrincipal principal) {
            return email.equalsIgnoreCase(principal.getEmail());
        }

        return email.equalsIgnoreCase(auth.getName());
    }

    @Override
    public boolean isUserOwnerByUsername(Authentication authentication, String username) {
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth) || username == null) {
            return false;
        }

        if (hasRole(auth, "ROLE_ADMIN")) {
            return true;
        }

        if (auth.getPrincipal() instanceof SecurityPrincipal principal) {
            return username.equalsIgnoreCase(principal.getUsername());
        }

        return username.equalsIgnoreCase(auth.getName());
    }

    @Override
    public boolean canPurchaseTicket(Authentication authentication, String requestEmail) {
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth) || requestEmail == null) {
            return false;
        }

        if (hasRole(auth, "ROLE_ADMIN")) {
            return true;
        }

        // Regular users (ROLE_USER) can only purchase tickets for their own email
        if (auth.getPrincipal() instanceof SecurityPrincipal principal) {
            return requestEmail.equalsIgnoreCase(principal.getEmail());
        }

        return requestEmail.equalsIgnoreCase(auth.getName());
    }

    @Override
    public boolean canAccessEvent(Authentication authentication, String eventCode) {
        if (eventCode == null) {
            return true;
        }

        Optional<Event> eventOpt = eventRepository.findByEventCode(eventCode);
        if (eventOpt.isEmpty()) {
            return true; // Let the service throw ResourceNotFoundException
        }

        Event event = eventOpt.get();
        if (event.getStatus() == EventStatus.PUBLISHED) {
            return true; // Public access for published events
        }

        // For non-published events (DRAFT, etc.), only STAFF or ADMIN may access
        Authentication auth = resolveAuthentication(authentication);
        if (!isAuthenticated(auth)) {
            return false;
        }

        return hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_STAFF");
    }

    private Authentication resolveAuthentication(Authentication authentication) {
        if (authentication != null) {
            return authentication;
        }
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private boolean isAuthenticated(Authentication auth) {
        return auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken);
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesTicketOwner(Authentication auth, Ticket ticket) {
        if (ticket.getUser() == null) {
            return false;
        }

        if (auth.getPrincipal() instanceof SecurityPrincipal principal) {
            if (principal.getUserId() != null && principal.getUserId().equals(ticket.getUser().getId())) {
                return true;
            }
            if (principal.getEmail() != null && principal.getEmail().equalsIgnoreCase(ticket.getUser().getEmail())) {
                return true;
            }
        }

        return auth.getName() != null && (
                auth.getName().equalsIgnoreCase(ticket.getUser().getEmail()) ||
                auth.getName().equalsIgnoreCase(ticket.getUser().getUsername())
        );
    }
}
