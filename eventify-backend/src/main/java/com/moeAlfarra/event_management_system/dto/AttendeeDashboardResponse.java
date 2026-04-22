package com.moeAlfarra.event_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AttendeeDashboardResponse {

    private long totalRegistrations;
    private long activeRegistrations;
    private long cancelledRegistrations;
    private long upcomingEvents;
    private long pastEvents;
}
