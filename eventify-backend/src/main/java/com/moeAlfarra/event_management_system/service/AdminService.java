package com.moeAlfarra.event_management_system.service;

import com.moeAlfarra.event_management_system.dto.*;
import com.moeAlfarra.event_management_system.entity.*;
import com.moeAlfarra.event_management_system.repository.EventRepository;
import com.moeAlfarra.event_management_system.repository.RegistrationRepository;
import com.moeAlfarra.event_management_system.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    // Profile
    public UserResponse getUser(String email) {
        User current = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToUserResponse(current);
    }

    // Update profile
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User admin = verifyUser(email);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getEmail().equalsIgnoreCase(admin.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is the same as current email");
        }

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent() && !existingUser.get().getUserId().equals(admin.getUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        admin.setName(request.getName());
        admin.setEmail(request.getEmail());

        User updated = userRepository.save(admin);
        return mapToUserResponse(updated);
    }

    // Update Password
    public void changePassword(String email, ChangePasswordRequest request) {
        User admin = verifyUser(email);

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(admin);
    }

    // Create user
    public UserResponse createUser(String email, RegisterRequest request) {
        User admin = verifyUser(email);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (request.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    // Get Users
    public List<UserResponse> getUsers(String email) {
        User admin = verifyUser(email);

        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = new ArrayList<>();

        for(User user: users) {
            userResponses.add(mapToUserResponse(user));
        }

        return userResponses;
    }

    // View Events
    public List<EventResponse> viewEvents(String email) {
        User admin = verifyUser(email);

        List<Event> events = eventRepository.findAll();

        List<EventResponse> eventResponses = new ArrayList<>();

        for (Event event: events) {
            eventResponses.add(mapToEventResponse(event));
        }

        return eventResponses;
    }

    // View reservations per event
    public List<RegistrationResponse> viewReservations(String email, Integer eventId) {
        User admin = verifyUser(email);

        Event event = eventRepository.findById(eventId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        List<Registration> registrations = registrationRepository.findByEvent(event);
        List<RegistrationResponse> registrationResponses = new ArrayList<>();

        for (Registration registration: registrations) {
            registrationResponses.add(mapToRegistrationResponse(registration));
        }

        return registrationResponses;
    }

    // Delete user
    @Transactional
    public void deleteUser(String email, Integer userId) {
        User admin = verifyUser(email);

        User user = userRepository.findById(userId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getUserId().equals(admin.getUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your account");
        }

        if (user.getRole() == Role.ATTENDEE) {
            List<Registration> registrations = registrationRepository.findByAttendee(user);

            for (Registration registration : registrations) {
                if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                    Event event = registration.getEvent();

                    if (event.getAvailableSeats() < event.getCapacity()) {
                        event.setAvailableSeats(event.getAvailableSeats() + 1);
                        eventRepository.save(event);
                    }
                }
            }
        }
        userRepository.delete(user);
    }

    // Delete event
    @Transactional
    public void deleteEvent(String email, Integer eventId) {
        User admin = verifyUser(email);

        Event event = eventRepository.findById(eventId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        eventRepository.delete(event);
    }


    // Delete Registration
    @Transactional
    public void deleteRegistration(String email, Integer registrationId) {
        User admin = verifyUser(email);

        Registration registration = registrationRepository.findById(registrationId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (registration.getStatus() == RegistrationStatus.REGISTERED) {
            Event event = registration.getEvent();
            if (event.getAvailableSeats() < event.getCapacity()) {
                event.setAvailableSeats(event.getAvailableSeats() + 1);
            }
            eventRepository.save(event);
        }

        registrationRepository.delete(registration);

    }

    // Admin Dashboard Stats
    public AdminDashboardResponse getDashboard(String email) {
        User admin = verifyUser(email);

        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();

        long totalAttendees = userRepository.countByRole(Role.ATTENDEE);
        long totalOrganizers = userRepository.countByRole(Role.ORGANIZER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);


        return new AdminDashboardResponse(
          totalUsers, totalEvents, totalRegistrations,
                totalAttendees, totalOrganizers, totalAdmins
        );
    }

    // HELPER METHOD: Verify User
    private User verifyUser(String email) {
        User admin = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return admin;
    }

    // HELPER METHOD: Registration Response Builder
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // HELPER METHOD: Event Response Builder
    private EventResponse mapToEventResponse(Event event) {
        return new EventResponse(
                event.getEventId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getImageUrl(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCapacity(),
                event.getAvailableSeats(),
                event.getCategory(),
                event.getStatus(),
                event.getCreatedAt(),
                event.getOrganizer().getUserId(),
                event.getOrganizer().getName()
        );
    }

    // HELPER METHOD: Registration Response Builder
    private RegistrationResponse mapToRegistrationResponse(Registration registration) {
        return new RegistrationResponse(
                registration.getRegistrationId(),
                registration.getEvent().getEventId(),
                registration.getAttendee().getUserId(),
                registration.getAttendee().getName(),
                registration.getAttendee().getEmail(),
                registration.getEvent().getTitle(),
                registration.getEvent().getLocation(),
                registration.getEvent().getStartTime(),
                registration.getEvent().getEndTime(),
                registration.getStatus()
        );
    }
}