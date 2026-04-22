package com.moeAlfarra.event_management_system.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrganizerDashboardResponse {

    private long totalEvents;

    private long publishedEvents;

    private long draftEvents;

    private long cancelledEvents;
    private long upcomingEvents;
    private long pastEvents;
    private long totalRegistrations;
    private long activeRegistrations;
    private long cancelledRegistrations;
}
