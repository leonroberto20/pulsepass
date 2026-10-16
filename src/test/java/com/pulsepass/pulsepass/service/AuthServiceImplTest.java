package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.RoleName;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserCredential;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.AuthResponse;
import com.pulsepass.pulsepass.dto.response.UserResponse;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.UserRoleRepository;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    @DisplayName("Debe registrar usuario de forma atómica con credencial BCrypt y rol ROLE_USER (FR-SEC-AUTH-001)")
    void shouldRegisterUserWithCredentialsAndRoleSuccessfully() {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@test.com", "Password123456!",
                "Andrea", "Gomez", "3001234567", "Santa Marta", LocalDate.of(1998, 1, 15)
        );

        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(passwordEncoder.encode("Password123456!")).thenReturn("$2a$10$hashedPassword");

        UserResponse mockResponse = new UserResponse(
                10L, "andrea", "andrea@test.com", true,
                "Andrea", "Gomez", "3001234567", "Santa Marta", LocalDate.of(1998, 1, 15)
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        verify(userRepository).save(any(User.class));
        verify(userCredentialRepository).save(any(UserCredential.class));
        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    @DisplayName("Debe autenticar con éxito y retornar AuthResponse con JWT y roles (FR-SEC-AUTH-002)")
    void shouldLoginSuccessfullyAndReturnJwt() {
        LoginRequest request = new LoginRequest("andrea", "Password123456!");
        User user = new User("andrea", "andrea@test.com", true);
        user.setId(10L);

        UserCredential credential = new UserCredential(user, "$2a$10$hashedPassword", OffsetDateTime.now());
        UserRole userRole = new UserRole(user, RoleName.ROLE_USER);

        when(userRepository.findByIdentifier("andrea")).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(10L)).thenReturn(Optional.of(credential));
        when(passwordEncoder.matches("Password123456!", "$2a$10$hashedPassword")).thenReturn(true);
        when(userRoleRepository.findByUser_Id(10L)).thenReturn(List.of(userRole));
        when(jwtService.generateToken(10L)).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationSeconds()).thenReturn(900L);

        AuthResponse authResponse = authService.login(request);

        assertThat(authResponse).isNotNull();
        assertThat(authResponse.accessToken()).isEqualTo("mock.jwt.token");
        assertThat(authResponse.tokenType()).isEqualTo("Bearer");
        assertThat(authResponse.expiresInSeconds()).isEqualTo(900L);
        assertThat(authResponse.user().roles()).contains("ROLE_USER");
    }

    @Test
    @DisplayName("Debe lanzar BadCredentialsException si la contraseña es incorrecta (FR-SEC-AUTH-003)")
    void shouldThrowBadCredentialsExceptionWhenPasswordIsIncorrect() {
        LoginRequest request = new LoginRequest("andrea", "WrongPassword!");
        User user = new User("andrea", "andrea@test.com", true);
        user.setId(10L);

        UserCredential credential = new UserCredential(user, "$2a$10$hashedPassword", OffsetDateTime.now());

        when(userRepository.findByIdentifier("andrea")).thenReturn(Optional.of(user));
        when(userCredentialRepository.findByUserId(10L)).thenReturn(Optional.of(credential));
        when(passwordEncoder.matches("WrongPassword!", "$2a$10$hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid username, email or password");
    }

    @Test
    @DisplayName("Debe lanzar BadCredentialsException si el usuario no existe (FR-SEC-AUTH-003)")
    void shouldThrowBadCredentialsExceptionWhenUserNotFound() {
        LoginRequest request = new LoginRequest("unknown", "Password123456!");
        when(userRepository.findByIdentifier("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid username, email or password");
    }

    @Test
    @DisplayName("Debe lanzar DisabledException si el usuario está inactivo (FR-SEC-AUTH-004)")
    void shouldThrowDisabledExceptionWhenUserIsDisabled() {
        LoginRequest request = new LoginRequest("inactive_user", "Password123456!");
        User user = new User("inactive_user", "inactive@test.com", false);
        user.setId(20L);

        when(userRepository.findByIdentifier("inactive_user")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("User account is inactive");
    }
}
