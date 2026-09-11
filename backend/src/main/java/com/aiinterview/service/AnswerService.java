package com.aiinterview.service;

import com.aiinterview.dto.EvaluationResponse;
import com.aiinterview.dto.SubmitAnswerRequest;
import com.aiinterview.entity.Answer;
import com.aiinterview.entity.Evaluation;
import com.aiinterview.entity.Interview;
import com.aiinterview.entity.InterviewQuestion;
import com.aiinterview.exception.ResourceNotFoundException;
import com.aiinterview.repository.AnswerRepository;
import com.aiinterview.repository.EvaluationRepository;
import com.aiinterview.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnswerService {

    private final InterviewQuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final EvaluationRepository evaluationRepository;
    private final AiService aiService;
    private final InterviewService interviewService;

    @Transactional
    public EvaluationResponse submitAnswer(Interview interview, SubmitAnswerRequest request) {
        interviewService.checkNotExpired(interview);

        InterviewQuestion question = questionRepository
                .findByIdAndInterviewId(request.getQuestionId(), interview.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found for this interview"));

        if (question.getAnswer() != null) {
            throw new IllegalArgumentException("This question has already been answered");
        }

        String trimmedAnswer = request.getAnswer().trim();
        if (trimmedAnswer.isEmpty()) {
            throw new IllegalArgumentException("Answer cannot be empty");
        }

        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setAnswerText(trimmedAnswer);
        answerRepository.save(answer);
        question.setAnswer(answer);

        AiService.EvaluationResult result = aiService.evaluateAnswer(interview, question, trimmedAnswer);

        Evaluation evaluation = new Evaluation();
        evaluation.setAnswer(answer);
        evaluation.setScore(result.score());
        evaluation.setMaxScore(result.maxScore());
        evaluation.setFeedback(result.feedback());
        evaluation.setStrengths(String.join("|", result.strengths()));
        evaluation.setImprovements(String.join("|", result.improvements()));
        evaluation.setModelAnswer(result.modelAnswer());
        evaluation.setRelevance(result.relevance());
        evaluation.setClarity(result.clarity());
        evaluation.setTechnicalAccuracy(result.technicalAccuracy());
        evaluationRepository.save(evaluation);
        answer.setEvaluation(evaluation);

        return new EvaluationResponse(evaluation);
    }
}
