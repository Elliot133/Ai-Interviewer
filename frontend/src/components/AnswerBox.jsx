import { useState } from 'react';
import Textarea from './Textarea';
import VoiceInput from './VoiceInput';
import Button from './Button';
import { Send } from 'lucide-react';

export default function AnswerBox({ value, onChange, onSubmit, submitting, disabled }) {
  const [touched, setTouched] = useState(false);
  const isEmpty = !value || !value.trim();

  const handleSubmit = () => {
    setTouched(true);
    if (isEmpty || disabled) return;
    onSubmit();
  };

  const handleTranscript = (transcript) => {
    onChange(transcript);
  };

  return (
    <div className="answer-box">
      <Textarea
        label="Your Answer"
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here, or use the microphone below..."
        error={touched && isEmpty ? 'An answer is required before submitting.' : null}
        disabled={disabled}
      />

      <div className="answer-actions">
        <VoiceInput onTranscript={handleTranscript} disabled={disabled} />
        <Button icon={Send} onClick={handleSubmit} disabled={disabled || submitting}>
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </div>

      <style>{`
        .answer-box { display: flex; flex-direction: column; gap: 16px; }
        .answer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media (max-width: 560px) {
          .answer-actions { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
}
