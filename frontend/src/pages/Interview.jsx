import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import AnswerBox from '../components/AnswerBox';
import FeedbackCard from '../components/FeedbackCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useTimer } from '../hooks/useTimer';
import {
  getInterview, getNextQuestion, submitAnswer, completeInterview,
} from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | answering | evaluating | feedback | finishing | error
  const [error, setError] = useState(null);
  const [ended, setEnded] = useState(false);

  const remainingSeconds = useMemo(() => {
    if (!interview) return null;
    const startedAt = new Date(interview.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(interview.durationSeconds - elapsed, 0);
  }, [interview]);

  const finishInterview = useCallback(async () => {
    if (ended) return;
    setEnded(true);
    setPhase('finishing');
    try {
      const result = await completeInterview(id);
      navigate(`/results/${id}`, { state: { result } });
    } catch (err) {
      setError(extractErrorMessage(err));
      setPhase('error');
    }
  }, [id, navigate, ended]);

  const timer = useTimer(remainingSeconds, { onExpire: finishInterview });

  const loadInterview = useCallback(async () => {
    setError(null);
    setPhase('loading');
    try {
      const data = await getInterview(id);
      setInterview(data);
      const firstUnanswered = data.questions.find((q) => !q.answered) || data.questions[data.questions.length - 1];
      setCurrentQuestion(firstUnanswered);
      setPhase('answering');
    } catch (err) {
      setError(extractErrorMessage(err));
      setPhase('error');
    }
  }, [id]);

  useEffect(() => { loadInterview(); }, [loadInterview]);

  const handleSubmitAnswer = async () => {
    setPhase('evaluating');
    setError(null);
    try {
      const result = await submitAnswer(id, { questionId: currentQuestion.id, answer });
      setEvaluation(result);
      setPhase('feedback');
    } catch (err) {
      setError(extractErrorMessage(err));
      setPhase('answering');
    }
  };

  const handleNext = async () => {
    setAnswer('');
    setEvaluation(null);
    setError(null);
    setPhase('loading');
    try {
      const next = await getNextQuestion(id);
      if (!next) {
        await finishInterview();
        return;
      }
      setCurrentQuestion(next);
      setPhase('answering');
    } catch (err) {
      setError(extractErrorMessage(err));
      setPhase('error');
    }
  };

  if (phase === 'loading' && !interview) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Starting interview..." />
      </div>
    );
  }

  if (phase === 'error' && !interview) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: 32 }}>
          <ErrorMessage message={error} onRetry={loadInterview} />
        </div>
      </div>
    );
  }

  if (phase === 'finishing') {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Finalizing your results..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container interview-page">
        {interview && currentQuestion && (
          <QuestionCard
            jobRole={interview.jobRole}
            questionNumber={currentQuestion.questionNumber}
            totalQuestions={interview.totalQuestions}
            questionText={currentQuestion.questionText}
            timer={timer}
          />
        )}

        {error && <ErrorMessage message={error} onRetry={phase === 'answering' ? handleSubmitAnswer : loadInterview} />}

        {phase === 'loading' && interview && <LoadingSpinner label="Generating question..." />}

        {(phase === 'answering' || phase === 'evaluating') && (
          <AnswerBox
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmitAnswer}
            submitting={phase === 'evaluating'}
            disabled={phase === 'evaluating' || timer.isExpired}
          />
        )}

        {phase === 'evaluating' && <LoadingSpinner label="Evaluating your answer..." inline />}

        {phase === 'feedback' && evaluation && (
          <div className="feedback-flow">
            <FeedbackCard {...evaluation} />
            <Button icon={ArrowRight} iconPosition="right" size="lg" onClick={handleNext}>
              {currentQuestion?.questionNumber >= interview?.totalQuestions ? 'View Results' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        .interview-page {
          padding: 28px 24px 60px;
          max-width: 760px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feedback-flow { display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }
      `}</style>
    </div>
  );
}
