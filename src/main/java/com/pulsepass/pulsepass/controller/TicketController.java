package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.TicketResponse;
import com.pulsepass.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/api/tickets")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN') and @authorizationService.canPurchaseTicket(authentication, #request.userEmail())")
    public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        TicketResponse purchased = ticketService.purchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchased);
    }

    @GetMapping("/api/tickets/{ticketCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or @authorizationService.isTicketOwner(authentication, #ticketCode)")
    public ResponseEntity<TicketResponse> findByCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.findByCode(ticketCode));
    }

    @GetMapping("/api/tickets/by-user")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isUserOwner(authentication, #email)")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@RequestParam String email) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    @GetMapping("/api/events/{eventCode}/tickets/paid")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }

    @PatchMapping("/api/tickets/{ticketCode}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.canCancelTicket(authentication, #ticketCode)")
    public ResponseEntity<TicketResponse> cancel(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    @PatchMapping("/api/tickets/{ticketCode}/use")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }
}
