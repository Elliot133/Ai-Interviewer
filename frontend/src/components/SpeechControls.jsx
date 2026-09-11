import { Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function SpeechControls({ text }) {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      className="speak-btn"
      onClick={() => (isSpeaking ? stop() : speak(text))}
    >
      {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
      <span>{isSpeaking ? 'Stop' : 'Read Question'}</span>

      <style>{`
        .speak-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: transparent;
          color: var(--color-ink-soft);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .speak-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
      `}</style>
    </button>
  );
}
