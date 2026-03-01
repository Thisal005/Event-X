package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Autowired
    private com.oop.EventTicketingSystem.repository.CustomRoleRepository customRoleRepository;

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_USER')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (payload.containsKey("role")) {
            user.setRole(com.oop.EventTicketingSystem.model.Role.valueOf((String) payload.get("role")));
        }

        if (payload.containsKey("customRoleId")) {
            Object roleIdObj = payload.get("customRoleId");
            if (roleIdObj != null && !roleIdObj.toString().isEmpty()) {
                Long roleId = Long.valueOf(roleIdObj.toString());
                com.oop.EventTicketingSystem.model.CustomRole customRole = customRoleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Custom Role not found"));
                user.setCustomRole(customRole);
            } else {
                user.setCustomRole(null);
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
