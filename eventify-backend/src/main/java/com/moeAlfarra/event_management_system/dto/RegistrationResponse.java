package com.moeAlfarra.event_management_system.dto;

import com.moeAlfarra.event_management_system.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegistrationResponse {

    private Integer registrationId;
    private Integer eventId;
    private Integer attendeeId;

    private String attendeeName;
    private String attendeeEmail;
    private String eventTitle;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private RegistrationStatus status;
}
