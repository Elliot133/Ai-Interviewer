package com.aiinterview;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class AiInterviewSimulatorApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context starts successfully with the dev (H2) profile.
    }
}
