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
public class OrganizerService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
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
        User organizer = verifyUser(email);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getEmail().equalsIgnoreCase(organizer.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is the same as current email");
        }

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent() && !existingUser.get().getUserId().equals(organizer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        organizer.setName(request.getName());
        organizer.setEmail(request.getEmail());

        User updated = userRepository.save(organizer);
        return mapToUserResponse(updated);
    }

    // Update Password
    public void changePassword(String email, ChangePasswordRequest request) {
        User organizer = verifyUser(email);

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), organizer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), organizer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        organizer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(organizer);
    }

    // Create event
    public EventResponse createEvent(String email, EventRequest request) {
        User organizer = verifyUser(email);

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required");
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (!request.getStartTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be in the future");
        }

        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity must be greater than zero");
        }

        if (request.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }

        if (eventRepository.existsByOrganizerAndTitleIgnoreCaseAndStartTime(
                organizer,
                request.getTitle().trim(),
                request.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have an event with the same title and start time"
            );
        }

        Event event = new Event();
        event.setOrganizer(organizer);
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setLocation(request.getLocation().trim());
        event.setImageUrl(request.getImageUrl());
        event.setCapacity(request.getCapacity());
        event.setAvailableSeats(event.getCapacity());
        event.setCategory(request.getCategory());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setStatus(EventStatus.DRAFT);

        Event saved = eventRepository.save(event);
        return mapToEventResponse(saved);
    }

    // Get events
    public List<EventResponse> getMyEvents(String email) {
        User owner = verifyUser(email);

        List<Event> myEvents= eventRepository.findByOrganizer(owner);
        List<EventResponse> myEventResponses = new ArrayList<>();

        for(Event myEvent: myEvents) {
            myEventResponses.add(mapToEventResponse(myEvent));
        }

        return myEventResponses;
    }

    // View reservations per event
    public List<RegistrationResponse> getRegistrations(String email, Integer eventId) {
        User organizer = verifyUser(email);

        Event event = eventRepository.findById(eventId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        // Verify ownership
        if (!event.getOrganizer().getUserId().equals(organizer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only event organizer can view registrations");
        }

        List<Registration> registrations = registrationRepository.findByEvent(event);
        List<RegistrationResponse> registrationResponses = new ArrayList<>();

        for (Registration registration: registrations) {
            registrationResponses.add(mapToRegistrationResponse(registration));
        }

        return registrationResponses;
    }

    // update event
    public EventResponse updateEvent(String email, Integer eventId, EventRequest request) {
        Event event = getOwnedEvent(email, eventId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelled events cannot be updated");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required");
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (!request.getStartTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be in the future");
        }

        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity must be greater than zero");
        }

        if (request.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }

        int bookedSeats = event.getCapacity() - event.getAvailableSeats();

        if (request.getCapacity() < bookedSeats) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Capacity cannot be less than current registered attendees"
            );
        }

        boolean duplicateExists = eventRepository.existsByOrganizerAndTitleIgnoreCaseAndStartTime(
                event.getOrganizer(),
                request.getTitle().trim(),
                request.getStartTime()
        );

        boolean sameIdentity =
                event.getTitle().equalsIgnoreCase(request.getTitle().trim()) &&
                        event.getStartTime().equals(request.getStartTime());

        if (duplicateExists && !sameIdentity) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have another event with the same title and start time"
            );
        }

        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setLocation(request.getLocation().trim());
        event.setImageUrl(request.getImageUrl());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());
        event.setAvailableSeats(request.getCapacity() - bookedSeats);
        event.setCategory(request.getCategory());

        Event updated = eventRepository.save(event);
        return mapToEventResponse(updated);
    }

    // Publish / Republish event
    public void publishEvent(String email, Integer eventId) {
        Event event = getOwnedEvent(email, eventId);

        if (event.getStatus() == EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is already published");
        }

        if (event.getStartTime() == null || event.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required");
        }

        if (!event.getEndTime().isAfter(event.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (!event.getStartTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only future events can be published");
        }

        if (event.getCapacity() == null || event.getCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity must be greater than zero");
        }

        if (event.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }

        event.setStatus(EventStatus.PUBLISHED);
        eventRepository.save(event);
    }

    // Cancel event
    public void cancelEvent(String email, Integer eventId) {
        Event event = getOwnedEvent(email, eventId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is already cancelled");
        }

        List<Registration> registrations = registrationRepository.findByEventAndStatus(event, RegistrationStatus.REGISTERED);

        for (Registration registration : registrations) {
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                registration.setStatus(RegistrationStatus.CANCELLED);
            }
        }

        registrationRepository.saveAll(registrations);

        event.setStatus(EventStatus.CANCELLED);
        event.setAvailableSeats(event.getCapacity());

        eventRepository.save(event);
    }

    public OrganizerDashboardResponse getDashboard(String email) {
        User organizer = verifyUser(email);

        List<Event> events = eventRepository.findByOrganizer(organizer);

        long totalEvents = events.size();
        long publishedEvents = 0;
        long draftEvents = 0;
        long cancelledEvents = 0;
        long upcomingEvents = 0;
        long pastEvents = 0;
        long totalRegistrations = 0;
        long activeRegistrations = 0;
        long cancelledRegistrations = 0;

        LocalDateTime now = LocalDateTime.now();

        for(Event event: events) {
            if (event.getStatus() == EventStatus.PUBLISHED) {
                publishedEvents++;
            }
            if (event.getStatus() == EventStatus.DRAFT) {
                draftEvents++;
            }
            if (event.getStatus() == EventStatus.CANCELLED) {
                cancelledEvents++;
            }
            if (event.getStartTime().isAfter(now)) {
                upcomingEvents++;
            }
            if (event.getStartTime().isBefore(now)) {
                pastEvents++;
            }

            List<Registration> registrations = registrationRepository.findByEvent(event);
            totalRegistrations+= registrations.size();

            for(Registration registration: registrations) {
                if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                    activeRegistrations++;
                }
                if (registration.getStatus() == RegistrationStatus.CANCELLED) {
                    cancelledEvents++;
                }
            }
        }
        return new OrganizerDashboardResponse(
                totalEvents, publishedEvents, draftEvents,
                cancelledEvents, upcomingEvents, pastEvents,
                totalRegistrations, activeRegistrations, cancelledRegistrations
        );
    }

    // HELPER METHOD: Get owned events
    private Event getOwnedEvent(String email, Integer eventId) {
        User organizer = verifyUser(email);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizer().getUserId().equals(organizer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own events");
        }

        return event;
    }

    // HELPER METHOD: Verify user
    private User verifyUser(String email) {
        User organizer = userRepository.findByEmail(email).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (organizer.getRole() != Role.ORGANIZER) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Access denied");
        }
        return organizer;
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
