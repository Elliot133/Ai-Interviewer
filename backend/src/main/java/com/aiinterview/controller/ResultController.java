package com.aiinterview.controller;

import com.aiinterview.dto.AnalyticsResponse;
import com.aiinterview.dto.InterviewResponse;
import com.aiinterview.security.UserPrincipal;
import com.aiinterview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ResultController {

    private final InterviewService interviewService;

    @GetMapping("/api/results")
    public List<InterviewResponse> getResults(@AuthenticationPrincipal UserPrincipal principal) {
        return interviewService.getUserInterviews(principal.getId());
    }

    @GetMapping("/api/analytics")
    public AnalyticsResponse getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return interviewService.getAnalytics(principal.getId());
    }
}
