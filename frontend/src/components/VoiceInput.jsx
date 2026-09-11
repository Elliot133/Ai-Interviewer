import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function VoiceInput({ onTranscript, disabled }) {
  const { isSupported, isListening, error, start, stop } = useSpeechRecognition({
    onResult: onTranscript,
  });

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        <MicOff size={15} />
        <span>Voice input isn't supported by this browser. You can type your answer instead.</span>
        <style>{`
          .voice-unsupported {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            color: var(--color-ink-faint);
            padding: 8px 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="voice-input">
      <button
        type="button"
        className={`mic-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stop : start}
        disabled={disabled}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        <span>{isListening ? 'Stop Speaking' : 'Start Speaking'}</span>
      </button>

      {isListening && (
        <span className="listening-indicator">
          <span className="dot" /> Listening...
        </span>
      )}

      {error && (
        <span className="voice-error">
          <AlertCircle size={14} /> {error}
        </span>
      )}

      <style>{`
        .voice-input { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
        .mic-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink);
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }
        .mic-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
        .mic-btn.listening { background: var(--color-danger-soft); border-color: var(--color-danger); color: var(--color-danger); }
        .mic-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .listening-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--color-danger);
          font-weight: 600;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-danger);
          animation: pulse 1s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .voice-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--color-warning);
        }
      `}</style>
    </div>
  );
}
