package com.moeAlfarra.event_management_system.repository;

import com.moeAlfarra.event_management_system.entity.Event;
import com.moeAlfarra.event_management_system.entity.EventCategory;
import com.moeAlfarra.event_management_system.entity.EventStatus;
import com.moeAlfarra.event_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {

    List<Event> findByStatus(EventStatus status);
    List<Event> findByOrganizer(User organizer);

    Event findByEventIdAndStatus(Integer eventId, EventStatus status);

    List<Event> findByCategoryAndStatus(EventCategory category, EventStatus status);

    boolean existsByOrganizerAndTitleIgnoreCaseAndStartTime(User organizer, String title, LocalDateTime startTime);



}
