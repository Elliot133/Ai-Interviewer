package com.aiinterview.dto;

import com.aiinterview.entity.Interview;
import lombok.Getter;

import java.util.List;

@Getter
public class InterviewDetailResponse extends InterviewResponse {
    private final List<QuestionResponse> questions;

    public InterviewDetailResponse(Interview interview, List<QuestionResponse> questions) {
        super(interview);
        this.questions = questions;
    }
}
