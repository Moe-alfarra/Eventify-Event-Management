package com.moeAlfarra.event_management_system.controller;

import com.moeAlfarra.event_management_system.dto.*;
import com.moeAlfarra.event_management_system.entity.EventCategory;
import com.moeAlfarra.event_management_system.service.AttendeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ATTENDEE Endpoints
@RestController
@RequestMapping("/api/attendee")
@RequiredArgsConstructor
public class AttendeeController {

    @Autowired
    private final AttendeeService attendeeService;

    // User Profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<UserResponse> getUser(Authentication authentication) {
        return ResponseEntity.ok(attendeeService.getUser(authentication.getName()));
    }

    // Update profile
    @PatchMapping("/profile")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(attendeeService.updateProfile(authentication.getName(), request));

    }

    // Update password
    @PatchMapping("/profile/password")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        attendeeService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    // Get events
    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getEvents() {
        return ResponseEntity.ok(attendeeService.getEvents());
    }

    // Get event by ID
    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Integer eventId) {
        return ResponseEntity.ok(attendeeService.getEvent(eventId));
    }

    @GetMapping("/events/category/{category}")
    public ResponseEntity<List<EventResponse>> getEventsByCategory(@PathVariable EventCategory category) {
        return ResponseEntity.ok(attendeeService.getEventsByCategory(category));
    }

    // Get registrations
    @GetMapping("/registrations")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<List<RegistrationResponse>> myEvents(Authentication authentication) {
        return ResponseEntity.ok(attendeeService.myEvents(authentication.getName()));
    }

    // Register
    @PostMapping("/events/{eventId}/register")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<RegistrationResponse> register(Authentication authentication, @PathVariable Integer eventId) {
        return ResponseEntity.ok(attendeeService.register(authentication.getName(), eventId));
    }

    // Cancel Registration
    @PatchMapping("/registrations/{registrationId}/cancel")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<String> cancelRegistration(Authentication authentication, @PathVariable Integer registrationId) {
        attendeeService.cancelRegistration(authentication.getName(), registrationId);
        return ResponseEntity.ok("Registration cancelled successfully");
    }

    // Attendee Dashboard
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<AttendeeDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(attendeeService.getDashboard(authentication.getName()));
    }
}
