package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserResponse;

public interface UserService {

    UserResponse register(RegisterUserRequest request);

    UserResponse findByEmail(String email);

    UserResponse findByUsername(String username);
}
