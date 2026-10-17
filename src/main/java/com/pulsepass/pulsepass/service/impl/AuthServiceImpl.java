package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.RoleName;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserCredential;
import com.pulsepass.pulsepass.domain.UserProfile;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.AuthResponse;
import com.pulsepass.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.pulsepass.dto.response.UserResponse;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.repository.UserRoleRepository;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.service.AuthService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_PASSWORD_FALLBACK = "DefaultSecurePassword123!";

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthServiceImpl(UserRepository userRepository,
                           UserCredentialRepository userCredentialRepository,
                           UserRoleRepository userRoleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already exists: " + request.username());
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }

        if (request.birthDate() != null && request.birthDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("Birth date cannot be in the future: " + request.birthDate());
        }

        User user = new User(request.username(), request.email(), true);
        UserProfile profile = new UserProfile(
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.city(),
                request.birthDate(),
                user
        );
        user.assignProfile(profile);
        User savedUser = userRepository.save(user);

        String rawPassword = (request.password() != null && !request.password().isBlank())
                ? request.password()
                : DEFAULT_PASSWORD_FALLBACK;

        UserCredential credential = new UserCredential(
                savedUser,
                passwordEncoder.encode(rawPassword),
                OffsetDateTime.now()
        );
        userCredentialRepository.save(credential);

        UserRole role = new UserRole(savedUser, RoleName.ROLE_USER);
        userRoleRepository.save(role);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier() != null ? request.identifier().trim() : "";
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid username, email or password"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("User account is inactive: " + identifier);
        }

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadCredentialsException("Invalid username, email or password"));

        if (!passwordEncoder.matches(request.password(), credential.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username, email or password");
        }

        List<String> roles = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        String token = jwtService.generateToken(user.getId());
        AuthenticatedUserResponse userResponse = new AuthenticatedUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );

        return new AuthResponse(token, jwtService.getExpirationSeconds(), userResponse);
    }

    @Override
    public AuthenticatedUserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("User account is inactive: " + userId);
        }

        List<String> roles = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        return new AuthenticatedUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }
}
