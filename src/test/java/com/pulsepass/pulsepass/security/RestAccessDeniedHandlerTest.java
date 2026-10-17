package com.pulsepass.pulsepass.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;

class RestAccessDeniedHandlerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestAccessDeniedHandler accessDeniedHandler = new RestAccessDeniedHandler(objectMapper);

    @Test
    @DisplayName("Debe responder 403 Forbidden con formato ErrorResponse estándar (SEC-009)")
    void shouldReturn403ErrorResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        accessDeniedHandler.handle(request, response, new AccessDeniedException("Access is denied"));

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentType()).contains("application/json");
        String content = response.getContentAsString();
        assertThat(content).contains("\"status\":403");
        assertThat(content).contains("\"error\":\"Forbidden\"");
        assertThat(content).contains("Access is denied");
    }
}
