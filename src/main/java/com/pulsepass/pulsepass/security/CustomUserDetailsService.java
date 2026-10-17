package com.pulsepass.pulsepass.security;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserCredential;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.UserRoleRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final UserRoleRepository userRoleRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    UserCredentialRepository userCredentialRepository,
                                    UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.isBlank()) {
            throw new UsernameNotFoundException("Identifier must not be empty");
        }

        User user = userRepository.findByIdentifier(identifier.trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("User account is disabled: " + identifier);
        }

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User has no credentials configured: " + identifier));

        List<SimpleGrantedAuthority> authorities = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(UserRole::getRole)
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();

        return new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                credential.getPasswordHash(),
                user.getActive(),
                authorities
        );
    }

    public SecurityPrincipal loadUserById(Long userId) throws UsernameNotFoundException {
        if (userId == null) {
            throw new UsernameNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("User account is disabled: " + userId);
        }

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User has no credentials configured: " + userId));

        List<SimpleGrantedAuthority> authorities = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(UserRole::getRole)
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();

        return new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                credential.getPasswordHash(),
                user.getActive(),
                authorities
        );
    }
}
