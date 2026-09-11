package com.aiinterview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateInterviewRequest {

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotBlank(message = "Interview type is required")
    private String interviewType;

    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 20, message = "A maximum of 20 questions is allowed")
    private Integer numberOfQuestions;

    private String jobDescription;

    private String focusSkills;
}
