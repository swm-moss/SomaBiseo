package com.somabiseo.domain.notice.presentation;

import com.somabiseo.domain.notice.application.NoticeService;
import com.somabiseo.domain.notice.domain.NoticeResponse;
import com.somabiseo.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NoticeController {
    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping("/api/notices")
    ApiResponse<List<NoticeResponse>> getNotices(@RequestParam(required = false) Boolean important) {
        return ApiResponse.ok(noticeService.findAll(important));
    }

    @GetMapping("/api/notices/{noticeId}")
    ApiResponse<NoticeResponse> getNotice(@PathVariable String noticeId) {
        return ApiResponse.ok(noticeService.findById(noticeId));
    }

    @PostMapping("/api/notices/{noticeId}/read")
    ApiResponse<Void> markRead(@PathVariable String noticeId) {
        noticeService.findById(noticeId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/api/notices/{noticeId}/bookmark")
    ApiResponse<Void> bookmark(@PathVariable String noticeId) {
        noticeService.findById(noticeId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/api/notices/{noticeId}/bookmark")
    ApiResponse<Void> unbookmark(@PathVariable String noticeId) {
        noticeService.findById(noticeId);
        return ApiResponse.ok(null);
    }
}
