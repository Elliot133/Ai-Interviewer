package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class InterviewResultResponse {
    private Long interviewId;
    private String jobRole;
    private String difficulty;
    private String interviewType;
    private int totalQuestions;
    private int answeredQuestions;
    private double overallScore;
    private double overallPercentage;
    private int durationSeconds;
    private List<String> strengths;
    private List<String> improvements;
    private String aiRecommendation;
    private List<QuestionResultItem> questionResults;

    @Getter
    @AllArgsConstructor
    public static class QuestionResultItem {
        private Long questionId;
        private int questionNumber;
        private String questionText;
        private String answerText;
        private Integer score;
        private Integer maxScore;
        private String feedback;
    }
}
