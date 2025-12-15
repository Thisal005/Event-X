package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.CustomRole;
import com.oop.EventTicketingSystem.repository.CustomRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomRoleService {

    @Autowired
    private CustomRoleRepository customRoleRepository;

    public List<CustomRole> getAllRoles() {
        return customRoleRepository.findAll();
    }

    public Optional<CustomRole> getRoleById(Long id) {
        return customRoleRepository.findById(id);
    }

    public CustomRole createRole(CustomRole role) {
        if (customRoleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Role with name " + role.getName() + " already exists");
        }
        return customRoleRepository.save(role);
    }

    public CustomRole updateRole(Long id, CustomRole roleDetails) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        role.setName(roleDetails.getName());
        role.setDescription(roleDetails.getDescription());
        role.setPermissions(roleDetails.getPermissions());
        
        return customRoleRepository.save(role);
    }

    public void deleteRole(Long id) {
        customRoleRepository.deleteById(id);
    }
}
