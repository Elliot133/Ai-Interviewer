package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.entity.Interview;
import com.aiinterview.entity.User;
import com.aiinterview.security.UserPrincipal;
import com.aiinterview.service.InterviewService;
import com.aiinterview.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<InterviewDetailResponse> createInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInterviewRequest request) {
        User user = userService.getUserOrThrow(principal.getId());
        InterviewDetailResponse response = interviewService.createInterview(principal.getId(), user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<InterviewResponse> listInterviews(@AuthenticationPrincipal UserPrincipal principal) {
        return interviewService.getUserInterviews(principal.getId());
    }

    @GetMapping("/{id}")
    public InterviewDetailResponse getInterview(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long id) {
        return interviewService.getInterviewDetail(id, principal.getId());
    }

    @GetMapping("/{id}/next-question")
    public ResponseEntity<QuestionResponse> nextQuestion(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id) {
        Interview interview = interviewService.getOwnedInterviewOrThrow(id, principal.getId());
        QuestionResponse question = interviewService.getOrGenerateNextQuestion(interview);
        if (question == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(question);
    }

    @PostMapping("/{id}/complete")
    public InterviewResultResponse completeInterview(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long id) {
        Interview interview = interviewService.getOwnedInterviewOrThrow(id, principal.getId());
        return interviewService.finalizeInterview(interview);
    }

    @GetMapping("/{id}/results")
    public InterviewResultResponse getResults(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long id) {
        Interview interview = interviewService.getOwnedInterviewOrThrow(id, principal.getId());
        return interviewService.getResults(interview);
    }
}
