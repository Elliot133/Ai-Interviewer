package com.aiinterview.service;

import com.aiinterview.entity.Answer;
import com.aiinterview.entity.Interview;
import com.aiinterview.entity.InterviewQuestion;
import com.aiinterview.exception.AiServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Central service responsible for ALL communication with the OpenAI API.
 * The API key never leaves the backend - the React frontend only ever talks
 * to Spring Boot, which in turn talks to OpenAI.
 */
@Service
@Slf4j
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.model}")
    private String model;

    @Value("${app.ai.mock-mode}")
    private boolean mockMode;

    public record GeneratedQuestion(String questionText, String category) {}

    public record EvaluationResult(
            int score,
            int maxScore,
            String feedback,
            List<String> strengths,
            List<String> improvements,
            String modelAnswer,
            int relevance,
            int clarity,
            int technicalAccuracy
    ) {}

    private boolean useMock() {
        return mockMode || apiKey == null || apiKey.isBlank();
    }

    // ---------------------------------------------------------------
    // Question generation
    // ---------------------------------------------------------------

    public List<GeneratedQuestion> generateQuestions(Interview interview) {
        if (useMock()) {
            return mockQuestions(interview);
        }

        String prompt = buildQuestionGenerationPrompt(interview);

        try {
            JsonNode root = callOpenAi(prompt,
                    "You are an experienced technical and behavioral interviewer. " +
                            "You MUST respond with ONLY valid JSON, no markdown, no commentary.");

            JsonNode questionsNode = root.get("questions");
            List<GeneratedQuestion> results = new ArrayList<>();
            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode q : questionsNode) {
                    String text = q.has("question") ? q.get("question").asText() : q.asText();
                    String category = q.has("category") ? q.get("category").asText() : interview.getInterviewType();
                    results.add(new GeneratedQuestion(text, category));
                }
            }
            if (results.isEmpty()) {
                throw new AiServiceException("The AI did not return any questions. Please try again.");
            }
            return results;
        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to generate questions via OpenAI", ex);
            throw new AiServiceException("AI question generation is temporarily unavailable. Please try again.");
        }
    }

    /** Generates a single adaptive follow-up question based on prior performance. */
    public GeneratedQuestion generateNextQuestion(Interview interview, int questionNumber,
                                                   List<InterviewQuestion> previousQuestions) {
        if (useMock()) {
            List<GeneratedQuestion> pool = mockQuestions(interview);
            return pool.get((questionNumber - 1) % pool.size());
        }

        String prompt = buildAdaptiveQuestionPrompt(interview, questionNumber, previousQuestions);

        try {
            JsonNode root = callOpenAi(prompt,
                    "You are an experienced interviewer generating ONE adaptive follow-up question. " +
                            "You MUST respond with ONLY valid JSON, no markdown, no commentary.");
            String text = root.has("question") ? root.get("question").asText() : null;
            String category = root.has("category") ? root.get("category").asText() : interview.getInterviewType();
            if (text == null || text.isBlank()) {
                throw new AiServiceException("The AI did not return a valid question.");
            }
            return new GeneratedQuestion(text, category);
        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to generate adaptive question via OpenAI", ex);
            throw new AiServiceException("AI question generation is temporarily unavailable. Please try again.");
        }
    }

    // ---------------------------------------------------------------
    // Answer evaluation
    // ---------------------------------------------------------------

    public EvaluationResult evaluateAnswer(Interview interview, InterviewQuestion question, String answerText) {
        if (useMock()) {
            return mockEvaluation(answerText);
        }

        String prompt = buildEvaluationPrompt(interview, question, answerText);

        try {
            JsonNode root = callOpenAi(prompt,
                    "You are a strict but fair interview evaluator. " +
                            "You MUST respond with ONLY valid JSON, no markdown, no commentary.");

            int score = root.path("score").asInt(0);
            int maxScore = root.path("maxScore").asInt(10);
            String feedback = root.path("feedback").asText("No feedback provided.");
            String modelAnswer = root.path("modelAnswer").asText("");
            int relevance = root.path("relevance").asInt(score);
            int clarity = root.path("clarity").asInt(score);
            int technicalAccuracy = root.path("technicalAccuracy").asInt(score);

            List<String> strengths = jsonArrayToList(root.get("strengths"));
            List<String> improvements = jsonArrayToList(root.get("improvements"));

            return new EvaluationResult(score, maxScore, feedback, strengths, improvements,
                    modelAnswer, relevance, clarity, technicalAccuracy);
        } catch (Exception ex) {
            log.error("Failed to evaluate answer via OpenAI", ex);
            throw new AiServiceException("AI evaluation is temporarily unavailable. Please try again.");
        }
    }

    // ---------------------------------------------------------------
    // OpenAI HTTP call
    // ---------------------------------------------------------------

    private JsonNode callOpenAi(String userPrompt, String systemPrompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.7,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(apiUrl, request, String.class);
        } catch (RestClientException ex) {
            throw new AiServiceException("Could not reach the AI service. Please try again.");
        }

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        String content = responseJson
                .path("choices").get(0)
                .path("message").path("content").asText();

        return objectMapper.readTree(content);
    }

    private List<String> jsonArrayToList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : (ArrayNode) node) {
                result.add(item.asText());
            }
        }
        return result;
    }

    // ---------------------------------------------------------------
    // Prompt construction
    // ---------------------------------------------------------------

    private String buildQuestionGenerationPrompt(Interview interview) {
        return """
                Generate %d interview questions for a %s candidate applying for a "%s" role.
                Interview type: %s
                Difficulty: %s
                Job description context: %s
                Skills to focus on: %s

                Return ONLY a JSON object of the shape:
                { "questions": [ { "question": "...", "category": "Technical|Behavioral|HR" }, ... ] }

                The questions must be realistic, specific to the role and experience level,
                and appropriate for the requested difficulty and interview type.
                Do not repeat the same concept across questions.
                """.formatted(
                interview.getTotalQuestions(),
                interview.getExperienceLevel(),
                interview.getJobRole(),
                interview.getInterviewType(),
                interview.getDifficulty(),
                blankToNone(interview.getJobDescription()),
                blankToNone(interview.getFocusSkills())
        );
    }

    private String buildAdaptiveQuestionPrompt(Interview interview, int questionNumber,
                                                List<InterviewQuestion> previousQuestions) {
        StringBuilder history = new StringBuilder();
        for (InterviewQuestion q : previousQuestions) {
            history.append("Q: ").append(q.getQuestionText());
            if (q.getAnswer() != null) {
                history.append(" | Candidate answer: ").append(truncate(q.getAnswer().getAnswerText(), 300));
                if (q.getAnswer().getEvaluation() != null) {
                    history.append(" | Score: ").append(q.getAnswer().getEvaluation().getScore())
                            .append("/").append(q.getAnswer().getEvaluation().getMaxScore());
                }
            }
            history.append("\n");
        }

        return """
                This is an ongoing interview for a %s (%s level) candidate.
                Interview type: %s, Difficulty: %s.
                This will be question number %d of %d.

                Previous questions and performance:
                %s

                Generate the NEXT question. If the candidate performed poorly on a topic,
                you may probe a related but distinct concept at a slightly easier angle.
                If they performed well, you may increase depth slightly.
                Keep it simple - do not over-engineer the adaptation.

                Return ONLY a JSON object of the shape:
                { "question": "...", "category": "Technical|Behavioral|HR" }
                """.formatted(
                interview.getJobRole(),
                interview.getExperienceLevel(),
                interview.getInterviewType(),
                interview.getDifficulty(),
                questionNumber,
                interview.getTotalQuestions(),
                history.isEmpty() ? "None yet." : history.toString()
        );
    }

    private String buildEvaluationPrompt(Interview interview, InterviewQuestion question, String answerText) {
        return """
                Evaluate this interview answer.

                Job role: %s
                Experience level: %s
                Interview type: %s
                Difficulty: %s
                Question category: %s

                Question: %s

                Candidate's answer: %s

                Evaluate correctness, relevance, completeness and clarity.
                For behavioral/HR questions, weigh communication, structure and professionalism instead of technical depth.
                Do not evaluate using simple keyword matching - use genuine understanding of the answer's quality.

                Return ONLY a JSON object of the shape:
                {
                  "score": <0-10 integer>,
                  "maxScore": 10,
                  "feedback": "...",
                  "strengths": ["...", "..."],
                  "improvements": ["...", "..."],
                  "modelAnswer": "...",
                  "relevance": <0-10 integer>,
                  "clarity": <0-10 integer>,
                  "technicalAccuracy": <0-10 integer>
                }
                """.formatted(
                interview.getJobRole(),
                interview.getExperienceLevel(),
                interview.getInterviewType(),
                interview.getDifficulty(),
                question.getQuestionCategory(),
                question.getQuestionText(),
                answerText
        );
    }

    private String blankToNone(String value) {
        return (value == null || value.isBlank()) ? "None provided" : value;
    }

    private String truncate(String value, int max) {
        if (value == null) return "";
        return value.length() <= max ? value : value.substring(0, max) + "...";
    }

    // ---------------------------------------------------------------
    // Mock mode (used when no OPENAI_API_KEY is configured)
    // ---------------------------------------------------------------

    private List<GeneratedQuestion> mockQuestions(Interview interview) {
        List<GeneratedQuestion> base = List.of(
                new GeneratedQuestion(
                        "Walk me through how you would approach a challenging problem in " + interview.getJobRole() + ".",
                        "Behavioral"),
                new GeneratedQuestion(
                        "What core skills do you think are most important for a " + interview.getExperienceLevel()
                                + " " + interview.getJobRole() + ", and why?",
                        "Technical"),
                new GeneratedQuestion(
                        "Describe a time you had to work under a tight deadline. What did you do?",
                        "Behavioral"),
                new GeneratedQuestion(
                        "What tools or technologies do you rely on most in this kind of role, and how do you keep your skills current?",
                        "Technical"),
                new GeneratedQuestion(
                        "How do you handle disagreements with a teammate or manager?",
                        "HR"),
                new GeneratedQuestion(
                        "Explain a technical concept from your field to someone without a technical background.",
                        "Technical"),
                new GeneratedQuestion(
                        "Tell me about a mistake you made at work and what you learned from it.",
                        "Behavioral"),
                new GeneratedQuestion(
                        "Why are you interested in this role, and where do you see yourself growing?",
                        "HR"),
                new GeneratedQuestion(
                        "How would you prioritize multiple competing tasks in a single day?",
                        "Behavioral"),
                new GeneratedQuestion(
                        "What is one recent development in this field that you find interesting, and why?",
                        "Technical")
        );

        List<GeneratedQuestion> result = new ArrayList<>();
        for (int i = 0; i < interview.getTotalQuestions(); i++) {
            result.add(base.get(i % base.size()));
        }
        return result;
    }

    private EvaluationResult mockEvaluation(String answerText) {
        int length = answerText == null ? 0 : answerText.trim().length();
        int score;
        String feedback;

        if (length == 0) {
            score = 0;
            feedback = "No answer was provided.";
        } else if (length < 40) {
            score = 4;
            feedback = "Your answer is quite brief. Consider expanding with more specific examples and detail.";
        } else if (length < 150) {
            score = 7;
            feedback = "A solid answer with reasonable detail. Adding a concrete example would strengthen it further.";
        } else {
            score = 9;
            feedback = "A thorough, well-structured answer that demonstrates strong understanding.";
        }

        return new EvaluationResult(
                score,
                10,
                feedback + " (Note: this is a development-mode mock evaluation; connect a real OPENAI_API_KEY for genuine AI scoring.)",
                List.of("Clear communication", "Relevant to the question"),
                List.of("Add more specific examples", "Elaborate on the reasoning behind your approach"),
                "A strong model answer would connect the concept directly to real-world experience, "
                        + "explain the reasoning step by step, and close with the outcome or lesson learned.",
                score,
                score,
                score
        );
    }
}
