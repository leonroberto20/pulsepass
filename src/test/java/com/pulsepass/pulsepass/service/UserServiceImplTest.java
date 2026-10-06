package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.impl.UserServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("TEST-USER-001: Registrar usuario válido crea User y UserProfile con active = true")
    void shouldRegisterUserSuccessfully() {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea99", "andrea@email.com", "Andrea", "Gomez",
                "3001234567", "Santa Marta", LocalDate.of(1999, 5, 20)
        );

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse expectedResponse = new UserResponse(
                1L, request.username(), request.email(), true,
                request.firstName(), request.lastName(), request.phone(), request.city(), request.birthDate()
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        // Act
        UserResponse response = userService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo(request.username());
        assertThat(response.active()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("TEST-USER-002: Username duplicado lanza DuplicateResourceException y no persiste")
    void shouldThrowDuplicateResourceExceptionWhenUsernameExists() {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea99", "andrea@email.com", "Andrea", "Gomez",
                "3001234567", "Santa Marta", LocalDate.of(1999, 5, 20)
        );
        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username already exists: " + request.username());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST-USER-003: Email duplicado lanza DuplicateResourceException y no persiste")
    void shouldThrowDuplicateResourceExceptionWhenEmailExists() {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea99", "andrea@email.com", "Andrea", "Gomez",
                "3001234567", "Santa Marta", LocalDate.of(1999, 5, 20)
        );
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists: " + request.email());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST-USER-004: Fecha de nacimiento futura lanza BusinessRuleException y no persiste")
    void shouldThrowBusinessRuleExceptionWhenBirthDateIsInFuture() {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea99", "andrea@email.com", "Andrea", "Gomez",
                "3001234567", "Santa Marta", LocalDate.now().plusDays(1)
        );
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Birth date cannot be in the future");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST-USER-005: Buscar usuario por email existente vs inexistente")
    void shouldFindUserByEmailOrThrowNotFound() {
        // Arrange
        String email = "andrea@email.com";
        User user = new User("andrea99", email, true);
        UserResponse response = new UserResponse(1L, "andrea99", email, true, null, null, null, null, null);

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(response);

        // Act
        UserResponse result = userService.findByEmail(email);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(email);

        // Inexistente
        when(userRepository.findByEmailIgnoreCase("other@email.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findByEmail("other@email.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with email");
    }
}
