package com.pulsepass.pulsepass.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.response.AuthResponse;
import com.pulsepass.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.pulsepass.security.JwtAuthenticationFilter;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.security.RestAccessDeniedHandler;
import com.pulsepass.pulsepass.security.RestAuthenticationEntryPoint;
import com.pulsepass.pulsepass.security.SecurityBeansConfig;
import com.pulsepass.pulsepass.security.SecurityConfig;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import com.pulsepass.pulsepass.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, SecurityBeansConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("T-SEC-005: POST /api/auth/login con credenciales válidas retorna 200 OK y AuthResponse")
    void shouldLoginSuccessfully() throws Exception {
        AuthenticatedUserResponse userResponse = new AuthenticatedUserResponse(
                1L, "andrea", "andrea@test.com", List.of("ROLE_USER")
        );
        AuthResponse authResponse = new AuthResponse("mock.jwt.token", "Bearer", 900L, userResponse);

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        LoginRequest request = new LoginRequest("andrea", "Password123456!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("mock.jwt.token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(900))
                .andExpect(jsonPath("$.user.username").value("andrea"))
                .andExpect(jsonPath("$.user.roles[0]").value("ROLE_USER"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    @DisplayName("T-SEC-006: POST /api/auth/login con credenciales erróneas retorna 401 Unauthorized")
    void shouldReturn401WhenBadCredentials() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid username, email or password"));

        LoginRequest request = new LoginRequest("andrea", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid username, email or password"));
    }

    @Test
    @DisplayName("POST /api/auth/login con datos en blanco retorna 400 Bad Request")
    void shouldReturn400WhenBlankFields() throws Exception {
        LoginRequest request = new LoginRequest("", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    @DisplayName("GET /api/auth/me sin autenticación retorna 401 Unauthorized")
    void shouldReturn401WhenMeWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("GET /api/auth/me autenticado retorna 200 OK y AuthenticatedUserResponse")
    void shouldReturn200WhenMeAuthenticated() throws Exception {
        SecurityPrincipal principal = new SecurityPrincipal(
                1L, "andrea", "andrea@test.com", "hash", true,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );

        AuthenticatedUserResponse userResponse = new AuthenticatedUserResponse(
                1L, "andrea", "andrea@test.com", List.of("ROLE_USER")
        );
        when(authService.getCurrentUser(1L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/me")
                        .with(authentication(auth))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.email").value("andrea@test.com"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));
    }
}
