package com.moeAlfarra.event_management_system.controller;

import com.moeAlfarra.event_management_system.dto.*;
import com.moeAlfarra.event_management_system.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ADMIN Endpoints
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    // User Profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUser(Authentication authentication) {
        return ResponseEntity.ok(adminService.getUser(authentication.getName()));
    }

    // Update profile
    @PatchMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(adminService.updateProfile(authentication.getName(), request));

    }

    // Update password
    @PatchMapping("/profile/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        adminService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    // Create  users
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(
            Authentication authentication,
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(adminService.createUser(authentication.getName(), request));
    }

    // Get users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsers(Authentication authentication) {
        return ResponseEntity.ok(adminService.getUsers(authentication.getName()));
    }

    // Get events
    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> viewEvents(Authentication authentication) {
        return ResponseEntity.ok(adminService.viewEvents(authentication.getName()));
    }

    // Get event registrations
    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> viewReservations
            (Authentication authentication,
             @PathVariable Integer eventId){
        return ResponseEntity.ok(adminService.viewReservations(authentication.getName(), eventId));
    }

    // Delete users
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(Authentication authentication, @PathVariable Integer userId) {
        adminService.deleteUser(authentication.getName(), userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Delete events
    @DeleteMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteEvent(Authentication authentication, @PathVariable Integer eventId) {
        adminService.deleteEvent(authentication.getName(), eventId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // Delete registrations
    @DeleteMapping("/registrations/{registrationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteRegistration(Authentication authentication, @PathVariable Integer registrationId) {
        adminService.deleteRegistration(authentication.getName(), registrationId);
        return ResponseEntity.ok("Registration deleted successfully");
    }

    // Admin Dashboard
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(adminService.getDashboard(authentication.getName()));
    }
}
