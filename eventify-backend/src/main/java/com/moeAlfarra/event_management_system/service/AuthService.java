package com.moeAlfarra.event_management_system.service;

import com.moeAlfarra.event_management_system.dto.AuthResponse;
import com.moeAlfarra.event_management_system.dto.LoginRequest;
import com.moeAlfarra.event_management_system.dto.RegisterRequest;
import com.moeAlfarra.event_management_system.entity.Role;
import com.moeAlfarra.event_management_system.entity.User;
import com.moeAlfarra.event_management_system.repository.UserRepository;
import com.moeAlfarra.event_management_system.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot register as an admin");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.ATTENDEE);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}
