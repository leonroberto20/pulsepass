package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserResponse;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("TEST-CTRL-USR-001: Registrar usuario válido retorna 201 Created")
    void shouldRegisterUserSuccessfully() throws Exception {
        UserResponse response = new UserResponse(
                1L,
                "andrea",
                "andrea@email.com",
                true,
                "Andrea",
                "Gomez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 1, 15)
        );

        when(userService.register(any(RegisterUserRequest.class))).thenReturn(response);

        String jsonRequest = """
                {
                    "username": "andrea",
                    "email": "andrea@email.com",
                    "firstName": "Andrea",
                    "lastName": "Gomez",
                    "phone": "3001234567",
                    "city": "Santa Marta",
                    "birthDate": "2000-01-15"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.email").value("andrea@email.com"))
                .andExpect(jsonPath("$.active").value(true));

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-002: Email inválido retorna 400 Bad Request y no invoca Service")
    void shouldReturn400WhenEmailIsInvalid() throws Exception {
        String invalidJson = """
                {
                    "username": "andrea",
                    "email": "invalid-email-format",
                    "firstName": "Andrea",
                    "lastName": "Gomez",
                    "phone": "3001234567",
                    "city": "Santa Marta",
                    "birthDate": "2000-01-15"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.email").exists());

        verify(userService, never()).register(any());
    }

    @Test
    @DisplayName("TEST-CTRL-USR-003: Username duplicado retorna 409 Conflict")
    void shouldReturn409WhenUsernameAlreadyExists() throws Exception {
        when(userService.register(any(RegisterUserRequest.class)))
                .thenThrow(new DuplicateResourceException("Username already exists: andrea"));

        String jsonRequest = """
                {
                    "username": "andrea",
                    "email": "andrea@email.com",
                    "firstName": "Andrea",
                    "lastName": "Gomez",
                    "birthDate": "2000-01-15"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Username already exists: andrea"));

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    @DisplayName("TEST-CTRL-USR-004: Consultar usuario por email retorna 200 OK")
    void shouldFindUserByEmail() throws Exception {
        UserResponse response = new UserResponse(
                1L,
                "andrea",
                "andrea@email.com",
                true,
                "Andrea",
                "Gomez",
                null,
                null,
                LocalDate.of(2000, 1, 15)
        );

        when(userService.findByEmail("andrea@email.com")).thenReturn(response);

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "andrea@email.com")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value("andrea@email.com"))
                .andExpect(jsonPath("$.username").value("andrea"));

        verify(userService).findByEmail("andrea@email.com");
    }

    @Test
    @DisplayName("TEST-CTRL-USR-005: Consultar usuario por username retorna 200 OK")
    void shouldFindUserByUsername() throws Exception {
        UserResponse response = new UserResponse(
                1L,
                "andrea",
                "andrea@email.com",
                true,
                "Andrea",
                "Gomez",
                null,
                null,
                LocalDate.of(2000, 1, 15)
        );

        when(userService.findByUsername("andrea")).thenReturn(response);

        mockMvc.perform(get("/api/users/by-username")
                        .param("username", "andrea")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("andrea"));

        verify(userService).findByUsername("andrea");
    }
}
