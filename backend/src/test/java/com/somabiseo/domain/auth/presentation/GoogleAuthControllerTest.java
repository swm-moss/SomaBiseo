package com.somabiseo.domain.auth.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GoogleAuthControllerTest {
    private final GoogleAuthService googleAuthService = mock(GoogleAuthService.class);
    private final GoogleAuthController controller = new GoogleAuthController(googleAuthService);

    @Test
    void loginUrlUsesGoogleAuthService() {
        when(googleAuthService.buildLoginUrl("https://somabiseo.vercel.app/dashboard"))
                .thenReturn("https://accounts.google.com/o/oauth2/v2/auth");

        var response = controller.getLoginUrl("https://somabiseo.vercel.app/dashboard");

        assertThat(response.success()).isTrue();
        assertThat(response.data().url()).isEqualTo("https://accounts.google.com/o/oauth2/v2/auth");
        verify(googleAuthService).buildLoginUrl("https://somabiseo.vercel.app/dashboard");
    }

    @Test
    void loginUrlKeepsLegacyEndpointAlias() throws NoSuchMethodException {
        GetMapping mapping = GoogleAuthController.class
                .getDeclaredMethod("getLoginUrl", String.class)
                .getAnnotation(GetMapping.class);

        assertThat(mapping.value())
                .containsExactlyInAnyOrder("/api/auth/google/connect-url", "/api/auth/google/login-url");
    }
}
