package com.oop.EventTicketingSystem.security;

import com.oop.EventTicketingSystem.model.Provider;
import com.oop.EventTicketingSystem.model.Role;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        return processOAuth2User(oAuth2UserRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equals(Provider.GOOGLE)) {
                // If user registered locally but tries to login with Google
                // Update provider or throw error. Here we update/link account by simply allowing login.
                // Ideally, robust logic would be here.
                user.setProvider(Provider.GOOGLE);
                user = userRepository.save(user);
            }
            // Update name?
            user.setName(name);
            user = userRepository.save(user);
        } else {
            user = registerNewUser(oAuth2User, email, name);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2User oAuth2User, String email, String name) {
        User user = new User();
        user.setProvider(Provider.GOOGLE);
        user.setProviderId(oAuth2User.getAttribute("sub"));
        user.setName(name);
        user.setEmail(email);
        user.setRole(Role.CUSTOMER); // Default new users to CUSTOMER
        return userRepository.save(user);
    }
}
