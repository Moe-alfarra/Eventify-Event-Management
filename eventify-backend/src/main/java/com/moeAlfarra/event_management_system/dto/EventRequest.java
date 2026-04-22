package com.moeAlfarra.event_management_system.dto;

import com.moeAlfarra.event_management_system.entity.EventCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventRequest {

    private String title;
    private String description;
    private String location;
    private String imageUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private EventCategory category;

}
