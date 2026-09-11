package com.aiinterview.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private Answer answer;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer maxScore = 10;

    @Column(nullable = false, length = 2000)
    private String feedback;

    @Column(length = 1500)
    private String strengths; // stored as delimited text (| separated)

    @Column(length = 1500)
    private String improvements; // stored as delimited text (| separated)

    @Column(length = 2000)
    private String modelAnswer;

    private Integer relevance;
    private Integer clarity;
    private Integer technicalAccuracy;
}
