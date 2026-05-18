package com.somabiseo.domain.somaevent.presentation;

import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SomaEventController {
    private final SomaEventService somaEventService;

    public SomaEventController(SomaEventService somaEventService) {
        this.somaEventService = somaEventService;
    }

    @GetMapping("/api/events")
    ApiResponse<List<SomaEventResponse>> getEvents(@RequestParam(required = false) EventType type) {
        return ApiResponse.ok(somaEventService.findAll(type));
    }

    @GetMapping("/api/events/{eventId}")
    ApiResponse<SomaEventResponse> getEvent(@PathVariable String eventId) {
        return ApiResponse.ok(somaEventService.findById(eventId));
    }

    @PostMapping("/api/events/{eventId}/favorite")
    ApiResponse<Void> favorite(@PathVariable String eventId) {
        somaEventService.findById(eventId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/api/events/{eventId}/favorite")
    ApiResponse<Void> unfavorite(@PathVariable String eventId) {
        somaEventService.findById(eventId);
        return ApiResponse.ok(null);
    }
}
