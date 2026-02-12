package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.dto.ApiResponse;
import com.oop.EventTicketingSystem.dto.request.LoginRequest;
import com.oop.EventTicketingSystem.dto.request.SignupRequest;
import com.oop.EventTicketingSystem.dto.response.AuthResponse;
import com.oop.EventTicketingSystem.dto.response.UserResponse;
import com.oop.EventTicketingSystem.exception.UnauthorizedException;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication operations.
 * Handles login, signup, and user profile retrieval.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthControllerV1 {

    private static final Logger log = LoggerFactory.getLogger(AuthControllerV1.class);

    private final AuthService authService;

    public AuthControllerV1(AuthService authService) {
        this.authService = authService;
    }

    /**
     * User login endpoint.
     *
     * @param request Login credentials
     * @return JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.debug("Login request received for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * User registration endpoint.
     *
     * @param request Signup details
     * @return Success message
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        log.debug("Signup request received for email: {}", request.getEmail());
        authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully"));
    }

    /**
     * Get current authenticated user's profile.
     *
     * @param userPrincipal Authenticated user principal
     * @return User profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication required");
        }
        log.debug("Fetching profile for user ID: {}", userPrincipal.getId());
        UserResponse response = authService.getCurrentUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
