package com.aiinterview.repository;

import com.aiinterview.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderByQuestionNumberAsc(Long interviewId);
    Optional<InterviewQuestion> findByIdAndInterviewId(Long id, Long interviewId);
}
