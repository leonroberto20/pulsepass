package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.AuthResponse;
import com.pulsepass.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.pulsepass.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterUserRequest request);

    AuthResponse login(LoginRequest request);

    AuthenticatedUserResponse getCurrentUser(Long userId);
}
