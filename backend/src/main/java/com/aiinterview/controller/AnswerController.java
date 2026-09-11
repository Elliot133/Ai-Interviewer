package com.aiinterview.controller;

import com.aiinterview.dto.EvaluationResponse;
import com.aiinterview.dto.SubmitAnswerRequest;
import com.aiinterview.entity.Interview;
import com.aiinterview.security.UserPrincipal;
import com.aiinterview.service.AnswerService;
import com.aiinterview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews/{interviewId}/answers")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;
    private final InterviewService interviewService;

    @PostMapping
    public EvaluationResponse submitAnswer(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long interviewId,
                                            @Valid @RequestBody SubmitAnswerRequest request) {
        Interview interview = interviewService.getOwnedInterviewOrThrow(interviewId, principal.getId());
        return answerService.submitAnswer(interview, request);
    }
}
