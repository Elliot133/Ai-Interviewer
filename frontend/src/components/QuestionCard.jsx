import ProgressBar from './ProgressBar';
import InterviewTimer from './InterviewTimer';
import SpeechControls from './SpeechControls';
import { Briefcase } from 'lucide-react';

export default function QuestionCard({ jobRole, questionNumber, totalQuestions, questionText, timer }) {
  return (
    <div className="question-card">
      <div className="qc-top">
        <div className="qc-role">
          <Briefcase size={15} />
          <span>{jobRole}</span>
        </div>
        <InterviewTimer formatted={timer.formatted} isWarning={timer.isWarning} />
      </div>

      <ProgressBar value={questionNumber} max={totalQuestions} label={`Question ${questionNumber} of ${totalQuestions}`} />

      <div className="qc-question">
        <p>{questionText}</p>
        <SpeechControls text={questionText} />
      </div>

      <style>{`
        .question-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .qc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .qc-role {
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-primary);
          font-size: 14px;
        }
        .qc-question {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-top: 4px;
        }
        .qc-question p {
          margin: 0;
          font-size: 19px;
          line-height: 1.5;
          font-weight: 600;
          color: var(--color-ink);
        }
        @media (max-width: 600px) {
          .question-card { padding: 18px; }
          .qc-question p { font-size: 17px; }
        }
      `}</style>
    </div>
  );
}
