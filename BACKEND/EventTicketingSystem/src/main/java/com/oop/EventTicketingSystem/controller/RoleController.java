package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oop.EventTicketingSystem.model.CustomRole;
import com.oop.EventTicketingSystem.service.CustomRoleService;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    private CustomRoleService customRoleService;

    @GetMapping
    public List<CustomRole> getAllRoles() {
        return customRoleService.getAllRoles();
    }

    @PostMapping
    public ResponseEntity<CustomRole> createRole(@RequestBody CustomRole role) {
        return ResponseEntity.ok(customRoleService.createRole(role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomRole> updateRole(@PathVariable Long id, @RequestBody CustomRole role) {
        return ResponseEntity.ok(customRoleService.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        customRoleService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }
}
