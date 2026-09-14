package com.aiinterview.service;

import com.aiinterview.exception.AiServiceException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

class AiServiceTest {

    @Test
    void useMockShouldFallBackWhenApiKeyIsMissing() {
        AiService aiService = new AiService();
        ReflectionTestUtils.setField(aiService, "mockMode", false);
        ReflectionTestUtils.setField(aiService, "apiKey", "");

        boolean shouldUseMock = (boolean) ReflectionTestUtils.invokeMethod(aiService, "useMock");

        assertThat(shouldUseMock).isTrue();
    }

    @Test
    void callOpenAiShouldClassifyHttpRejectedRequestsAsServiceRejection() throws Exception {
        AiService aiService = new AiService();
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(aiService, "restTemplate");
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        ReflectionTestUtils.setField(aiService, "apiKey", "sk-test");
        ReflectionTestUtils.setField(aiService, "apiUrl", "https://api.openai.com/v1/chat/completions");
        ReflectionTestUtils.setField(aiService, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(aiService, "mockMode", false);

        server.expect(requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .body("{\"error\":{\"message\":\"The model 'gpt-4o-mini' does not exist\"}}"));

        AiServiceException ex = assertThrows(AiServiceException.class,
                () -> ReflectionTestUtils.invokeMethod(aiService, "callOpenAi",
                        "Tell me about yourself.",
                        "You are an interviewer."));

        assertThat(ex.getMessage()).isEqualTo("AI service rejected the request. Please try again.");
    }
}
