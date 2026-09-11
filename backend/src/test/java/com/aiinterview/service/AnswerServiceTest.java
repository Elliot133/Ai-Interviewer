package com.aiinterview.service;

import com.aiinterview.dto.EvaluationResponse;
import com.aiinterview.dto.SubmitAnswerRequest;
import com.aiinterview.entity.Interview;
import com.aiinterview.entity.InterviewQuestion;
import com.aiinterview.exception.ResourceNotFoundException;
import com.aiinterview.exception.InterviewExpiredException;
import com.aiinterview.repository.AnswerRepository;
import com.aiinterview.repository.EvaluationRepository;
import com.aiinterview.repository.InterviewQuestionRepository;
import com.aiinterview.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnswerServiceTest {

    @Mock private InterviewQuestionRepository questionRepository;
    @Mock private AnswerRepository answerRepository;
    @Mock private EvaluationRepository evaluationRepository;
    @Mock private AiService aiService;
    @Mock private InterviewRepository interviewRepository;
    @Mock private InterviewService interviewService;

    private AnswerService answerService;

    @BeforeEach
    void setUp() {
        answerService = new AnswerService(questionRepository, answerRepository, evaluationRepository, aiService, interviewService);
    }

    private Interview sampleInterview() {
        Interview interview = new Interview();
        interview.setId(1L);
        interview.setJobRole("Java Developer");
        interview.setExperienceLevel("Intermediate");
        interview.setDifficulty("Medium");
        interview.setInterviewType("Technical");
        interview.setTotalQuestions(5);
        interview.setDurationSeconds(900);
        interview.setStartedAt(LocalDateTime.now());
        return interview;
    }

    @Test
    void checkNotExpired_expiresAtConfiguredDurationBoundary() {
        InterviewService realInterviewService = new InterviewService(interviewRepository, questionRepository, aiService);
        Interview interview = sampleInterview();
        interview.setStatus("IN_PROGRESS");
        interview.setStartedAt(LocalDateTime.now().minusSeconds(interview.getDurationSeconds() + 10L));

        assertThrows(InterviewExpiredException.class, () -> realInterviewService.checkNotExpired(interview));
    }

    @Test
    void submitAnswer_rejectsEmptyAnswer() {
        Interview interview = sampleInterview();
        InterviewQuestion question = new InterviewQuestion();
        question.setId(10L);
        question.setInterview(interview);
        question.setQuestionText("What is dependency injection?");

        when(questionRepository.findByIdAndInterviewId(10L, 1L)).thenReturn(Optional.of(question));

        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(10L);
        request.setAnswer("   ");

        assertThrows(IllegalArgumentException.class, () -> answerService.submitAnswer(interview, request));
    }

    @Test
    void submitAnswer_throwsResourceNotFound_whenQuestionDoesNotBelongToInterview() {
        Interview interview = sampleInterview();
        when(questionRepository.findByIdAndInterviewId(999L, 1L)).thenReturn(Optional.empty());

        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(999L);
        request.setAnswer("Some answer");

        assertThrows(ResourceNotFoundException.class, () -> answerService.submitAnswer(interview, request));
    }

    @Test
    void submitAnswer_rejectsAlreadyAnsweredQuestion() {
        Interview interview = sampleInterview();
        InterviewQuestion question = new InterviewQuestion();
        question.setId(10L);
        question.setInterview(interview);
        question.setAnswer(new com.aiinterview.entity.Answer());

        when(questionRepository.findByIdAndInterviewId(10L, 1L)).thenReturn(Optional.of(question));

        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(10L);
        request.setAnswer("A new answer");

        assertThrows(IllegalArgumentException.class, () -> answerService.submitAnswer(interview, request));
    }

    @Test
    void submitAnswer_evaluatesAndSavesAnswer_whenValid() {
        Interview interview = sampleInterview();
        InterviewQuestion question = new InterviewQuestion();
        question.setId(10L);
        question.setInterview(interview);
        question.setQuestionText("What is dependency injection?");
        question.setQuestionCategory("Technical");

        when(questionRepository.findByIdAndInterviewId(10L, 1L)).thenReturn(Optional.of(question));
        when(aiService.evaluateAnswer(any(), any(), any())).thenReturn(
                new AiService.EvaluationResult(8, 10, "Good answer", java.util.List.of("Clear"), java.util.List.of("More detail"), "Model answer", 8, 8, 8)
        );

        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(10L);
        request.setAnswer("Dependency injection is a design pattern...");

        EvaluationResponse response = answerService.submitAnswer(interview, request);

        assertEquals(8, response.getScore());
        assertEquals(10, response.getMaxScore());
        assertNotNull(question.getAnswer());
    }
}
