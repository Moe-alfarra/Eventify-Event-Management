package com.moeAlfarra.event_management_system.repository;

import com.moeAlfarra.event_management_system.entity.Role;
import com.moeAlfarra.event_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);
}
