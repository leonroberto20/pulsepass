package com.pulsepass.pulsepass.security;

import com.pulsepass.pulsepass.domain.RoleName;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserCredential;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.UserRoleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("Debe cargar UserDetails correctamente para usuario activo con credenciales y roles")
    void shouldLoadUserDetailsSuccessfully() {
        User user = new User("andrea", "andrea@test.com", true);
        user.setId(1L);

        UserCredential credential = new UserCredential(user, "$2a$10$encodedPasswordHash", OffsetDateTime.now());
        UserRole userRole = new UserRole(user, RoleName.ROLE_USER);

        when(userRepository.findByIdentifier("andrea")).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(1L)).thenReturn(Optional.of(credential));
        when(userRoleRepository.findByUser_Id(1L)).thenReturn(List.of(userRole));

        UserDetails userDetails = userDetailsService.loadUserByUsername("andrea");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("andrea");
        assertThat(userDetails.getPassword()).isEqualTo("$2a$10$encodedPasswordHash");
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Debe lanzar DisabledException si el usuario está inactivo (FR-SEC-AUTH-004)")
    void shouldThrowDisabledExceptionWhenUserIsInactive() {
        User user = new User("inactive_user", "inactive@test.com", false);
        user.setId(2L);

        when(userRepository.findByIdentifier("inactive_user")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("inactive_user"))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("User account is disabled");
    }

    @Test
    @DisplayName("Debe lanzar UsernameNotFoundException si el usuario no existe")
    void shouldThrowUsernameNotFoundWhenUserDoesNotExist() {
        when(userRepository.findByIdentifier("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("unknown"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Debe lanzar UsernameNotFoundException si el usuario no tiene credenciales configuradas")
    void shouldThrowWhenUserHasNoCredentials() {
        User user = new User("nocreds", "nocreds@test.com", true);
        user.setId(3L);

        when(userRepository.findByIdentifier("nocreds")).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nocreds"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("no credentials");
    }
}
