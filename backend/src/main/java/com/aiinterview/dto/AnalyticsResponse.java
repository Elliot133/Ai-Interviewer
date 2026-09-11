package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AnalyticsResponse {
    private int totalInterviews;
    private double averageScore;
    private double highestScore;
    private double lowestScore;
    private List<ScoreOverTimeItem> scoreOverTime;
    private Map<String, Double> averageScoreByJobRole;

    @Getter
    @AllArgsConstructor
    public static class ScoreOverTimeItem {
        private Long interviewId;
        private String date;
        private double score;
    }
}
