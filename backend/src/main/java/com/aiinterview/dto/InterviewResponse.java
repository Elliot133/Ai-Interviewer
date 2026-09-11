package com.aiinterview.dto;

import com.aiinterview.entity.Interview;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Getter
public class InterviewResponse {
    private final Long id;
    private final String jobRole;
    private final String experienceLevel;
    private final String difficulty;
    private final String interviewType;
    private final Integer totalQuestions;
    private final String status;
    /*
     * These timestamps are persisted as server-local LocalDateTime values. Expose
     * their server offset so API clients can parse the actual instant rather than
     * interpreting it in their own time zone.
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private final OffsetDateTime startedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private final OffsetDateTime endedAt;
    private final Integer durationSeconds;
    private final Integer remainingSeconds;
    private final Double overallScore;
    private final Double overallPercentage;

    public InterviewResponse(Interview interview) {
        this.id = interview.getId();
        this.jobRole = interview.getJobRole();
        this.experienceLevel = interview.getExperienceLevel();
        this.difficulty = interview.getDifficulty();
        this.interviewType = interview.getInterviewType();
        this.totalQuestions = interview.getTotalQuestions();
        this.status = interview.getStatus();
        this.startedAt = interview.getStartedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime();
        this.endedAt = interview.getEndedAt() == null
                ? null
                : interview.getEndedAt().atZone(ZoneId.systemDefault()).toOffsetDateTime();
        this.durationSeconds = interview.getDurationSeconds();
        this.remainingSeconds = remainingSeconds(interview);
        this.overallScore = interview.getOverallScore();
        this.overallPercentage = interview.getOverallPercentage();
    }
    private Integer remainingSeconds(Interview interview) {
        if (!"IN_PROGRESS".equals(interview.getStatus())) {
            return 0;
        }
        long elapsed = ChronoUnit.SECONDS.between(interview.getStartedAt(), LocalDateTime.now());
        return (int) Math.max(0, interview.getDurationSeconds() - elapsed);
    }
}
