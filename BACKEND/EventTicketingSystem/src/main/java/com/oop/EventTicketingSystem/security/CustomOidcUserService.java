package com.oop.EventTicketingSystem.security;

import com.oop.EventTicketingSystem.model.Provider;
import com.oop.EventTicketingSystem.model.Role;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomOidcUserService extends OidcUserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            return processOidcUser(userRequest, oidcUser);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        String email = oidcUser.getAttribute("email");
        String name = oidcUser.getAttribute("name");
        
        // Google usually provides sub as the unique ID
        String providerId = oidcUser.getAttribute("sub"); 

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equals(Provider.GOOGLE)) {
                // Determine what to do if provider doesn't match
                // For now, we update it or just proceed
                user.setProvider(Provider.GOOGLE);
                user = userRepository.save(user);
            }
            user.setName(name);
            user.setProviderId(providerId);
            user = userRepository.save(user);
        } else {
            user = registerNewUser(userRequest, oidcUser);
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user, oidcUser.getAttributes());
        userPrincipal.setIdToken(oidcUser.getIdToken());
        userPrincipal.setUserInfo(oidcUser.getUserInfo());
        return userPrincipal;
    }

    private User registerNewUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        User user = new User();
        user.setProvider(Provider.GOOGLE);
        user.setProviderId(oidcUser.getAttribute("sub"));
        user.setName(oidcUser.getAttribute("name"));
        user.setEmail(oidcUser.getAttribute("email"));
        user.setRole(Role.CUSTOMER);
        return userRepository.save(user);
    }
}
