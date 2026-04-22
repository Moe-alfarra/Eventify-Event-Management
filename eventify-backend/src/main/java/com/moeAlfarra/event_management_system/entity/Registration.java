package com.moeAlfarra.event_management_system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "registrations",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"event_id", "attendee_id"})
        },
        indexes = {
                @Index(name = "idx_registrations_event_id", columnList = "event_id"),
                @Index(name = "idx_registrations_attendee_id", columnList = "attendee_id"),
                @Index(name = "idx_registrations_status", columnList = "status")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id")
    private Integer registrationId;

    @ManyToOne()
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne()
    @JoinColumn(name = "attendee_id", nullable = false)
    private User attendee;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
