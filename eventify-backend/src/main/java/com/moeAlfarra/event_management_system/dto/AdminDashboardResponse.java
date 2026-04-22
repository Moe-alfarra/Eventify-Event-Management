package com.moeAlfarra.event_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalEvents;
    private long totalRegistrations;
    private long totalAttendees;
    private long totalOrganizers;
    private long totalAdmins;




}
