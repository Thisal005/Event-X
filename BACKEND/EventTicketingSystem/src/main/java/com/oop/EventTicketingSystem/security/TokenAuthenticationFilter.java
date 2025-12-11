package com.oop.EventTicketingSystem.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TokenAuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        try {
            String jwt = parseJwt(request);
            
            if (jwt != null) {
                log.debug("JWT token found for {} {}", method, path);
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    String email = jwtUtils.getUserNameFromJwtToken(jwt);
                    log.debug("JWT valid, extracting user: {}", email);

                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                    log.info("Authenticated user: {} with roles: {} for {} {}", 
                            userDetails.getUsername(), 
                            userDetails.getAuthorities(),
                            method, 
                            path);
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Security context set for user: {}", email);
                } else {
                    log.warn("Invalid JWT token for request: {} {}", method, path);
                }
            } else {
                log.debug("No JWT token found for {} {} (Authorization header: {})", 
                        method, path, 
                        request.getHeader("Authorization") != null ? "present but malformed" : "missing");
            }
        } catch (UsernameNotFoundException e) {
            log.error("User not found during token authentication: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Cannot set user authentication for {} {}: {} - {}", method, path, e.getClass().getSimpleName(), e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only skip filter for endpoints where token is NEVER expected
        // For all other endpoints, we want to process the token if present
         return path.startsWith("/api/auth/login") || 
             path.startsWith("/api/auth/signup") ||
             path.startsWith("/oauth2/") ||
             path.startsWith("/login/oauth2/");
    }
}

