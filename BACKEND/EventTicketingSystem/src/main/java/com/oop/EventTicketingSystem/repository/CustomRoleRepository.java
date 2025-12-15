package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.CustomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomRoleRepository extends JpaRepository<CustomRole, Long> {
    Optional<CustomRole> findByName(String name);
    boolean existsByName(String name);
}
