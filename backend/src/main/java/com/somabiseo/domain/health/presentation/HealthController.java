package com.somabiseo.domain.health.presentation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    HealthResponse health() {
        return new HealthResponse("ok");
    }

    record HealthResponse(String status) {
    }
}
