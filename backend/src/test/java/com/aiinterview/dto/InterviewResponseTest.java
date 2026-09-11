package com.aiinterview.dto;

import com.aiinterview.entity.Interview;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class InterviewResponseTest {

    @Test
    void exposesStartTimeWithTheServerOffset() throws Exception {
        LocalDateTime startedAt = LocalDateTime.of(2026, 9, 11, 12, 0);
        Interview interview = new Interview();
        interview.setId(1L);
        interview.setStatus("IN_PROGRESS");
        interview.setStartedAt(startedAt);
        interview.setDurationSeconds(900);

        InterviewResponse response = new InterviewResponse(interview);

        assertNotNull(response.getStartedAt().getOffset());
        assertEquals(startedAt.atZone(ZoneId.systemDefault()).toInstant(), response.getStartedAt().toInstant());
        String json = new ObjectMapper().findAndRegisterModules().writeValueAsString(response);
        String serializedStartTime = new ObjectMapper().readTree(json).get("startedAt").asText();
        assertEquals(response.getStartedAt().toInstant(), java.time.OffsetDateTime.parse(serializedStartTime).toInstant());
    }
}
