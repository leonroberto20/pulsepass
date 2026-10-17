package com.pulsepass.pulsepass.service;

import org.springframework.security.core.Authentication;

public interface AuthorizationService {

    boolean isTicketOwner(Authentication authentication, String ticketCode);

    boolean canCancelTicket(Authentication authentication, String ticketCode);

    boolean isUserOwner(Authentication authentication, String email);

    boolean isUserOwnerByUsername(Authentication authentication, String username);

    boolean canPurchaseTicket(Authentication authentication, String requestEmail);

    boolean canAccessEvent(Authentication authentication, String eventCode);
}
