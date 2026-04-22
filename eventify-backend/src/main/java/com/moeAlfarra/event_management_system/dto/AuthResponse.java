package com.moeAlfarra.event_management_system.dto;

import com.moeAlfarra.event_management_system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private Integer userId;
    private String name;
    private String email;
    private Role role;
    private String token;
}
