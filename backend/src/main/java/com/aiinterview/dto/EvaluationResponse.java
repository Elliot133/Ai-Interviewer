package com.aiinterview.dto;

import com.aiinterview.entity.Evaluation;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
public class EvaluationResponse {
    private final Integer score;
    private final Integer maxScore;
    private final String feedback;
    private final List<String> strengths;
    private final List<String> improvements;
    private final String modelAnswer;
    private final Integer relevance;
    private final Integer clarity;
    private final Integer technicalAccuracy;

    public EvaluationResponse(Evaluation evaluation) {
        this.score = evaluation.getScore();
        this.maxScore = evaluation.getMaxScore();
        this.feedback = evaluation.getFeedback();
        this.strengths = splitOrEmpty(evaluation.getStrengths());
        this.improvements = splitOrEmpty(evaluation.getImprovements());
        this.modelAnswer = evaluation.getModelAnswer();
        this.relevance = evaluation.getRelevance();
        this.clarity = evaluation.getClarity();
        this.technicalAccuracy = evaluation.getTechnicalAccuracy();
    }

    private static List<String> splitOrEmpty(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.asList(value.split("\\|"));
    }
}
