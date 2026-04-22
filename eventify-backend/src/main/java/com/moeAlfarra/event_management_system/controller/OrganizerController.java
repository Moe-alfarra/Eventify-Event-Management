package com.moeAlfarra.event_management_system.controller;

import com.moeAlfarra.event_management_system.dto.*;
import com.moeAlfarra.event_management_system.service.OrganizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ORGANIZER Endpoints
@RestController
@RequestMapping("/api/organizer")
@RequiredArgsConstructor
public class OrganizerController {

    private final OrganizerService organizerService;

    // User profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<UserResponse> getUser(Authentication authentication) {
        return ResponseEntity.ok(organizerService.getUser(authentication.getName()));
    }

    // Update profile
    @PatchMapping("/profile")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(organizerService.updateProfile(authentication.getName(), request));

    }

    // Update password
    @PatchMapping("/profile/password")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        organizerService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    // Create Event
    @PostMapping("/events")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventResponse> createEvent(Authentication authentication, @RequestBody EventRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(organizerService.createEvent(email, request));
    }

    // Gets organizer events
    @GetMapping("/events")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> myEvents(Authentication authentication) {
        return ResponseEntity.ok(organizerService.getMyEvents(authentication.getName()));
    }

    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<RegistrationResponse>> getRegistrations
            (Authentication authentication,
             @PathVariable Integer eventId){
        return ResponseEntity.ok(organizerService.getRegistrations(authentication.getName(), eventId));
    }

    // Update event
    @PatchMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventResponse> updateEvent(Authentication authentication,
                                                     @PathVariable  Integer eventId, @RequestBody EventRequest request) {
        return ResponseEntity.ok(organizerService.updateEvent(authentication.getName(), eventId, request));
    }

    // Publish event
    @PatchMapping("/events/{eventId}/publish")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> publishEvent(Authentication authentication, @PathVariable Integer eventId) {
        organizerService.publishEvent(authentication.getName(), eventId);
        return ResponseEntity.ok("Event published successfully");
    }

    // Cancel event
    @PatchMapping("/events/{eventId}/cancel")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> cancelEvent(Authentication authentication, @PathVariable Integer eventId) {
        organizerService.cancelEvent(authentication.getName(), eventId);
        return ResponseEntity.ok("Event cancelled successfully");
    }

    // Organizer Dashboard
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<OrganizerDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(organizerService.getDashboard(authentication.getName()));
    }


}
