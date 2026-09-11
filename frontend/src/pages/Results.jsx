import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, TrendingUp, Sparkles, RotateCcw, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getInterviewResults } from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getInterviewResults(id);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  useEffect(() => {
    if (!result) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: 32 }}><ErrorMessage message={error} onRetry={load} /></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Loading results..." />
      </div>
    );
  }

  const percentage = Math.round(result.overallPercentage || 0);
  const durationMinutes = Math.round((result.durationSeconds || 0) / 60);

  return (
    <div>
      <Navbar />
      <div className="container results-page">
        <div className="results-hero">
          <span className="hero-label">Interview complete</span>
          <span className="hero-score">{percentage}%</span>
          <span className="hero-role">{result.jobRole} · {result.difficulty} difficulty</span>
          <span className="hero-sub">{result.answeredQuestions} / {result.totalQuestions} questions completed · {durationMinutes} min</span>
        </div>

        <div className="stats-grid">
          <ScoreCard label="Average score" value={result.overallScore?.toFixed?.(1) ?? result.overallScore} suffix="/10" accent />
          <ScoreCard label="Questions completed" value={result.answeredQuestions} suffix={`/${result.totalQuestions}`} />
          <ScoreCard label="Duration" value={durationMinutes} suffix=" min" />
        </div>

        <div className="results-columns">
          {result.strengths?.length > 0 && (
            <div className="result-panel">
              <h3><CheckCircle2 size={16} /> Strengths</h3>
              <ul>{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {result.improvements?.length > 0 && (
            <div className="result-panel">
              <h3><TrendingUp size={16} /> Areas for improvement</h3>
              <ul>{result.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
        </div>

        {result.aiRecommendation && (
          <div className="recommendation">
            <h3><Sparkles size={16} /> AI recommendation</h3>
            <p>{result.aiRecommendation}</p>
          </div>
        )}

        <div className="question-breakdown">
          <h3>Question-by-question breakdown</h3>
          {result.questionResults?.map((q) => (
            <div key={q.questionId} className="qr-item">
              <div className="qr-head">
                <span>Question {q.questionNumber}</span>
                {q.score != null && <span className="qr-score">{q.score}/{q.maxScore}</span>}
              </div>
              <p className="qr-question">{q.questionText}</p>
              {q.answerText && <p className="qr-answer">{q.answerText}</p>}
              {q.feedback && <p className="qr-feedback">{q.feedback}</p>}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <Link to="/interview/setup"><Button icon={RotateCcw} variant="secondary">Practice again</Button></Link>
          <Link to="/dashboard"><Button icon={LayoutDashboard}>Back to dashboard</Button></Link>
        </div>
      </div>

      <style>{`
        .results-page { padding: 32px 24px 60px; max-width: 780px; display: flex; flex-direction: column; gap: 28px; }
        .results-hero {
          display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
          background: var(--color-primary); color: #fff; border-radius: var(--radius-lg); padding: 40px 24px;
        }
        .hero-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.75; font-weight: 600; }
        .hero-score { font-family: var(--font-display); font-size: 56px; font-weight: 800; }
        .hero-role { font-weight: 700; font-size: 16px; }
        .hero-sub { font-size: 13px; opacity: 0.8; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .results-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .result-panel {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-md); padding: 18px 20px;
        }
        .result-panel h3 { display: flex; align-items: center; gap: 7px; font-size: 14px; margin-bottom: 10px; }
        .result-panel ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
        .result-panel li { font-size: 13.5px; }
        .recommendation {
          background: var(--color-accent-soft); border: 1px solid var(--color-accent);
          border-radius: var(--radius-md); padding: 18px 20px;
        }
        .recommendation h3 { display: flex; align-items: center; gap: 7px; font-size: 14px; margin-bottom: 8px; color: var(--color-accent-strong); }
        .recommendation p { margin: 0; font-size: 14px; color: var(--color-ink); }
        .question-breakdown h3 { font-size: 16px; margin-bottom: 14px; }
        .qr-item {
          border: 1px solid var(--color-border); border-radius: var(--radius-md);
          padding: 16px 18px; margin-bottom: 12px; background: var(--color-surface);
        }
        .qr-head { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; color: var(--color-ink-soft); margin-bottom: 8px; }
        .qr-score { color: var(--color-accent-strong); }
        .qr-question { font-weight: 600; margin: 0 0 8px; }
        .qr-answer { color: var(--color-ink-soft); font-size: 13.5px; margin: 0 0 8px; }
        .qr-feedback { font-size: 13px; color: var(--color-ink-faint); margin: 0; font-style: italic; }
        .results-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .results-columns { grid-template-columns: 1fr; }
          .hero-score { font-size: 44px; }
        }
      `}</style>
    </div>
  );
}
