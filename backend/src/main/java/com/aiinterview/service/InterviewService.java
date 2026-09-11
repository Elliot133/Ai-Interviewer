package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.entity.*;
import com.aiinterview.exception.InterviewExpiredException;
import com.aiinterview.exception.ResourceNotFoundException;
import com.aiinterview.repository.InterviewQuestionRepository;
import com.aiinterview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final AiService aiService;

    @Value("${app.interview.seconds-per-question}")
    private int secondsPerQuestion;

    @Transactional
    public InterviewDetailResponse createInterview(Long userId, User user, CreateInterviewRequest request) {
        Interview interview = new Interview();
        interview.setUser(user);
        interview.setJobRole(request.getJobRole().trim());
        interview.setExperienceLevel(request.getExperienceLevel());
        interview.setDifficulty(request.getDifficulty());
        interview.setInterviewType(request.getInterviewType());
        interview.setTotalQuestions(request.getNumberOfQuestions());
        interview.setJobDescription(request.getJobDescription());
        interview.setFocusSkills(request.getFocusSkills());
        interview.setDurationSeconds(request.getNumberOfQuestions() * secondsPerQuestion);
        interview.setStartedAt(LocalDateTime.now());
        interview.setStatus("IN_PROGRESS");

        Interview saved = interviewRepository.save(interview);

        // Generate the FIRST question up front so the interview can start immediately.
        // Remaining questions are generated adaptively as the candidate progresses.
        List<AiService.GeneratedQuestion> generated = aiService.generateQuestions(saved);
        AiService.GeneratedQuestion first = generated.get(0);

        InterviewQuestion question = new InterviewQuestion();
        question.setInterview(saved);
        question.setQuestionNumber(1);
        question.setQuestionText(first.questionText());
        question.setQuestionCategory(first.category());
        questionRepository.save(question);

        saved.getQuestions().add(question);

        List<QuestionResponse> questionResponses = List.of(new QuestionResponse(question));
        return new InterviewDetailResponse(saved, questionResponses);
    }

    public Interview getOwnedInterviewOrThrow(Long interviewId, Long userId) {
        return interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
    }

    public InterviewDetailResponse getInterviewDetail(Long interviewId, Long userId) {
        Interview interview = getOwnedInterviewOrThrow(interviewId, userId);
        expireIfNeeded(interview);
        List<QuestionResponse> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumberAsc(interviewId).stream()
                .map(QuestionResponse::new)
                .collect(Collectors.toList());
        return new InterviewDetailResponse(interview, questions);
    }

    public List<InterviewResponse> getUserInterviews(Long userId) {
        return interviewRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .peek(this::expireIfNeeded)
                .map(InterviewResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Called after an answer to a question is stored, to fetch or generate the
     * next question. Returns null when the interview is already complete.
     */
    @Transactional
    public QuestionResponse getOrGenerateNextQuestion(Interview interview) {
        List<InterviewQuestion> existing = questionRepository
                .findByInterviewIdOrderByQuestionNumberAsc(interview.getId());

        int nextNumber = existing.size() + 1;
        if (nextNumber > interview.getTotalQuestions()) {
            return null;
        }

        // If it already exists (e.g. re-fetch), just return it.
        for (InterviewQuestion q : existing) {
            if (q.getQuestionNumber() == nextNumber) {
                return new QuestionResponse(q);
            }
        }

        checkNotExpired(interview);

        AiService.GeneratedQuestion generated = aiService.generateNextQuestion(interview, nextNumber, existing);

        InterviewQuestion question = new InterviewQuestion();
        question.setInterview(interview);
        question.setQuestionNumber(nextNumber);
        question.setQuestionText(generated.questionText());
        question.setQuestionCategory(generated.category());
        questionRepository.save(question);

        return new QuestionResponse(question);
    }

    public void checkNotExpired(Interview interview) {
        if ("COMPLETED".equals(interview.getStatus()) || "EXPIRED".equals(interview.getStatus())) {
            throw new InterviewExpiredException("This interview has already ended.");
        }
        if (expireIfNeeded(interview)) {
            throw new InterviewExpiredException("The time for this interview has expired.");
        }
    }

    /**
     * Expires an in-progress interview once its configured server-side duration
     * has elapsed. Returns whether this invocation performed the transition.
     */
    private boolean expireIfNeeded(Interview interview) {
        if (!"IN_PROGRESS".equals(interview.getStatus())) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = interview.getStartedAt().plusSeconds(interview.getDurationSeconds());
        long remainingSeconds = ChronoUnit.SECONDS.between(now, deadline);
        log.debug("Interview expiration check - Interview ID: {}, Interview status: {}, Start time: {}, "
                        + "Current server time: {}, Duration: {} seconds, Expiration time: {}, "
                        + "Remaining time: {} seconds, Expired: {}",
                interview.getId(), interview.getStatus(), interview.getStartedAt(), now,
                interview.getDurationSeconds(), deadline, remainingSeconds, remainingSeconds <= 0);
        if (!now.isBefore(deadline)) {
            interview.setStatus("EXPIRED");
            interview.setEndedAt(now);
            interviewRepository.save(interview);
            return true;
        }
        return false;
    }

    @Transactional
    public InterviewResultResponse finalizeInterview(Interview interview) {
        checkNotExpired(interview);
        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumberAsc(interview.getId());

        List<InterviewResultResponse.QuestionResultItem> items = new ArrayList<>();
        List<String> allStrengths = new ArrayList<>();
        List<String> allImprovements = new ArrayList<>();
        int totalScore = 0;
        int totalMax = 0;
        int answered = 0;

        for (InterviewQuestion q : questions) {
            Answer answer = q.getAnswer();
            Integer score = null;
            Integer maxScore = null;
            String feedback = null;
            String answerText = null;

            if (answer != null) {
                answered++;
                answerText = answer.getAnswerText();
                Evaluation eval = answer.getEvaluation();
                if (eval != null) {
                    score = eval.getScore();
                    maxScore = eval.getMaxScore();
                    feedback = eval.getFeedback();
                    totalScore += eval.getScore();
                    totalMax += eval.getMaxScore();
                    if (eval.getStrengths() != null && !eval.getStrengths().isBlank()) {
                        allStrengths.addAll(List.of(eval.getStrengths().split("\\|")));
                    }
                    if (eval.getImprovements() != null && !eval.getImprovements().isBlank()) {
                        allImprovements.addAll(List.of(eval.getImprovements().split("\\|")));
                    }
                }
            }

            items.add(new InterviewResultResponse.QuestionResultItem(
                    q.getId(), q.getQuestionNumber(), q.getQuestionText(), answerText, score, maxScore, feedback));
        }

        double overallScore = totalMax > 0 ? (double) totalScore / questions.size() : 0.0;
        double overallPercentage = totalMax > 0 ? (100.0 * totalScore / totalMax) : 0.0;

        interview.setStatus("COMPLETED");
        interview.setEndedAt(LocalDateTime.now());
        interview.setOverallScore(Math.round(overallScore * 10.0) / 10.0);
        interview.setOverallPercentage(Math.round(overallPercentage * 10.0) / 10.0);

        String recommendation = buildRecommendation(interview, allImprovements);
        interview.setAiRecommendation(recommendation);
        interviewRepository.save(interview);

        List<String> topStrengths = distinctTop(allStrengths, 4);
        List<String> topImprovements = distinctTop(allImprovements, 4);

        return new InterviewResultResponse(
                interview.getId(),
                interview.getJobRole(),
                interview.getDifficulty(),
                interview.getInterviewType(),
                interview.getTotalQuestions(),
                answered,
                interview.getOverallScore(),
                interview.getOverallPercentage(),
                (int) ChronoUnit.SECONDS.between(interview.getStartedAt(), interview.getEndedAt()),
                topStrengths,
                topImprovements,
                recommendation,
                items
        );
    }

    private String buildRecommendation(Interview interview, List<String> improvements) {
        if (improvements.isEmpty()) {
            return "Strong overall performance for a " + interview.getExperienceLevel() + " " + interview.getJobRole()
                    + ". Keep practicing under realistic time constraints to stay sharp.";
        }
        List<String> top = distinctTop(improvements, 2);
        return "Continue practicing " + String.join(" and ", top).toLowerCase()
                + " to strengthen your candidacy for " + interview.getJobRole() + " roles.";
    }

    private List<String> distinctTop(List<String> values, int limit) {
        return values.stream()
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .distinct()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public InterviewResultResponse getResults(Interview interview) {
        // Rebuild the same shape as finalize, without mutating status again.
        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumberAsc(interview.getId());

        List<InterviewResultResponse.QuestionResultItem> items = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            Answer answer = q.getAnswer();
            Integer score = null, maxScore = null;
            String feedback = null, answerText = null;
            if (answer != null) {
                answerText = answer.getAnswerText();
                if (answer.getEvaluation() != null) {
                    score = answer.getEvaluation().getScore();
                    maxScore = answer.getEvaluation().getMaxScore();
                    feedback = answer.getEvaluation().getFeedback();
                }
            }
            items.add(new InterviewResultResponse.QuestionResultItem(
                    q.getId(), q.getQuestionNumber(), q.getQuestionText(), answerText, score, maxScore, feedback));
        }

        int answered = (int) questions.stream().filter(q -> q.getAnswer() != null).count();

        return new InterviewResultResponse(
                interview.getId(),
                interview.getJobRole(),
                interview.getDifficulty(),
                interview.getInterviewType(),
                interview.getTotalQuestions(),
                answered,
                interview.getOverallScore() == null ? 0 : interview.getOverallScore(),
                interview.getOverallPercentage() == null ? 0 : interview.getOverallPercentage(),
                interview.getEndedAt() == null ? 0
                        : (int) ChronoUnit.SECONDS.between(interview.getStartedAt(), interview.getEndedAt()),
                List.of(),
                List.of(),
                interview.getAiRecommendation(),
                items
        );
    }

    public AnalyticsResponse getAnalytics(Long userId) {
        List<Interview> completed = interviewRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()) && i.getOverallPercentage() != null)
                .collect(Collectors.toList());

        if (completed.isEmpty()) {
            return new AnalyticsResponse(0, 0, 0, 0, List.of(), Map.of());
        }

        double avg = completed.stream().mapToDouble(Interview::getOverallPercentage).average().orElse(0);
        double max = completed.stream().mapToDouble(Interview::getOverallPercentage).max().orElse(0);
        double min = completed.stream().mapToDouble(Interview::getOverallPercentage).min().orElse(0);

        List<AnalyticsResponse.ScoreOverTimeItem> overTime = completed.stream()
                .sorted(Comparator.comparing(Interview::getStartedAt))
                .map(i -> new AnalyticsResponse.ScoreOverTimeItem(
                        i.getId(), i.getStartedAt().toLocalDate().toString(), i.getOverallPercentage()))
                .collect(Collectors.toList());

        Map<String, Double> byRole = completed.stream()
                .collect(Collectors.groupingBy(Interview::getJobRole,
                        Collectors.averagingDouble(Interview::getOverallPercentage)));

        return new AnalyticsResponse(
                completed.size(),
                Math.round(avg * 10.0) / 10.0,
                Math.round(max * 10.0) / 10.0,
                Math.round(min * 10.0) / 10.0,
                overTime,
                byRole
        );
    }
}
