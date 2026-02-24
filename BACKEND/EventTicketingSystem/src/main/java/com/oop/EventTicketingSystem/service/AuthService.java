package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.dto.request.LoginRequest;
import com.oop.EventTicketingSystem.dto.request.SignupRequest;
import com.oop.EventTicketingSystem.dto.response.AuthResponse;
import com.oop.EventTicketingSystem.dto.response.UserResponse;
import com.oop.EventTicketingSystem.exception.BadRequestException;
import com.oop.EventTicketingSystem.exception.ResourceNotFoundException;
import com.oop.EventTicketingSystem.model.Provider;
import com.oop.EventTicketingSystem.model.Role;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.repository.UserRepository;
import com.oop.EventTicketingSystem.security.JwtUtils;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for authentication operations.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Authenticate user and generate JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));

        log.info("Login successful for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName() != null ? user.getName() : "")
                .role(user.getRole())
                .build();
    }

    /**
     * Register a new user.
     */
    @Transactional
    public void signup(SignupRequest request) {
        log.info("Signup attempt for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User(
                request.getEmail(),
                request.getName(),
                Role.CUSTOMER,
                Provider.LOCAL
        );
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());
    }

    /**
     * Get current authenticated user's profile.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
