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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendeeService {

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

    // Update Profile
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is the same as current email");
        }

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    // Update Password

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Get All Published events
    public List<EventResponse> getEvents() {
        List<Event> events = eventRepository.findByStatus(EventStatus.PUBLISHED);
        List<EventResponse> eventResponses = new ArrayList<>();

        for (Event event: events) {
            eventResponses.add(mapToEventResponse(event));
        }

        return eventResponses;
    }

    // Get Published event by ID
    public EventResponse getEvent(Integer eventId) {
        Event event = eventRepository.findByEventIdAndStatus(eventId, EventStatus.PUBLISHED);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        return mapToEventResponse(event);
    }

    // Get Published events by category
    public List<EventResponse> getEventsByCategory(EventCategory category) {
        List<Event> events = eventRepository.findByCategoryAndStatus(category, EventStatus.PUBLISHED);

        List<EventResponse> responses = new ArrayList<>();

        for (Event event : events) {
            responses.add(mapToEventResponse(event));
        }

        return responses;
    }

    // Get All registered events
    public List<RegistrationResponse> myEvents(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.ATTENDEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only attendees can view their registrations");
        }

        List<Registration> registrations = registrationRepository.findByAttendee(user);
        List<RegistrationResponse> registrationResponses = new ArrayList<>();

        for (Registration registration: registrations) {
            registrationResponses.add(mapToRegistrationResponse(registration));
        }

        return registrationResponses;
    }

    // Register for an event
    @Transactional
    public RegistrationResponse register(String email, Integer eventId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.ATTENDEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only attendees can register");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is inactive");
        }

        if (event.getAvailableSeats() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is full");
        }

        if (LocalDateTime.now().isAfter(event.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event already ended");
        }

        Optional<Registration> existingRegistration = registrationRepository.findByEventAndAttendee(event, user);

        if (existingRegistration.isPresent()) {
            Registration existing = existingRegistration.get();

            if (existing.getStatus() == RegistrationStatus.REGISTERED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are already registered for this event");
            }

            existing.setStatus(RegistrationStatus.REGISTERED);
            event.setAvailableSeats(event.getAvailableSeats() - 1);

            eventRepository.save(event);
            Registration saved = registrationRepository.save(existing);
            return mapToRegistrationResponse(saved);
        }

        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setAttendee(user);
        registration.setStatus(RegistrationStatus.REGISTERED);

        event.setAvailableSeats(event.getAvailableSeats() - 1);

        Registration saved = registrationRepository.save(registration);
        eventRepository.save(event);

        return mapToRegistrationResponse(saved);
    }


    // Cancel Registration
    @Transactional
    public void cancelRegistration(String email, Integer registrationId) {
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.ATTENDEE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only attendees can cancel their registration");
        }

        Registration registration = registrationRepository.findById(registrationId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (!registration.getAttendee().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot cancel registration of other users");
        }

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration is already cancelled");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        Event event  = registration.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + 1);

        eventRepository.save(event);
        registrationRepository.save(registration);
    }

    // Attendee Dashboard
    public AttendeeDashboardResponse getDashboard(String email) {
        User attendee = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Registration> registrations = registrationRepository.findByAttendee(attendee);

        long totalRegistrations = registrations.size();
        long activeRegistrations = 0;
        long cancelledRegistrations = 0;
        long upcomingEvents = 0;
        long pastEvents = 0;

        LocalDateTime now = LocalDateTime.now();

        for (Registration registration: registrations) {
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                activeRegistrations++;

                Event event = registration.getEvent();

                if (event.getStartTime().isBefore(now)) {
                    pastEvents++;
                }
                if (event.getStartTime().isAfter(now)) {
                    upcomingEvents++;
                }
            }

            if (registration.getStatus() == RegistrationStatus.CANCELLED) {
                cancelledRegistrations++;
            }
        }

        return new AttendeeDashboardResponse(
                totalRegistrations, activeRegistrations, cancelledRegistrations, upcomingEvents, pastEvents
        );
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
