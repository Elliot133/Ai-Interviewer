package com.aiinterview.dto;

import com.aiinterview.entity.InterviewQuestion;
import lombok.Getter;

@Getter
public class QuestionResponse {
    private final Long id;
    private final Integer questionNumber;
    private final String questionText;
    private final String questionCategory;
    private final boolean answered;

    public QuestionResponse(InterviewQuestion question) {
        this.id = question.getId();
        this.questionNumber = question.getQuestionNumber();
        this.questionText = question.getQuestionText();
        this.questionCategory = question.getQuestionCategory();
        this.answered = question.getAnswer() != null;
    }
}
