package com.moeAlfarra.event_management_system.repository;

import com.moeAlfarra.event_management_system.entity.Event;
import com.moeAlfarra.event_management_system.entity.Registration;
import com.moeAlfarra.event_management_system.entity.RegistrationStatus;
import com.moeAlfarra.event_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Integer> {

    List<Registration> findByAttendee(User attendee);

    List<Registration> findByEvent(Event event);

    Optional<Registration> findByEventAndAttendee(Event event, User attendee);

    long countByEventAndStatus(Event event, RegistrationStatus status);

    List<Registration> findByEventAndStatus(Event event, RegistrationStatus status);


}
