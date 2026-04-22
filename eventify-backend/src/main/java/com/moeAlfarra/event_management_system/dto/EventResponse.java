package com.moeAlfarra.event_management_system.dto;

import com.moeAlfarra.event_management_system.entity.EventCategory;
import com.moeAlfarra.event_management_system.entity.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventResponse {
    private Integer eventId;
    private String title;
    private String description;
    private String location;
    private String imageUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer availableSeats;
    private EventCategory category;
    private EventStatus status;
    private LocalDateTime createdAt;
    private Integer organizerId;
    private String organizerName;
}