import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps the browser Web Speech API (SpeechRecognition).
 * Voice input is purely an enhancement: recognized speech is handed back
 * as plain text via onResult, so the caller can drop it into a normal
 * textarea for the user to review and edit before submitting.
 */
export function useSpeechRecognition({ onResult } = {}) {
  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!RecognitionCtor;

  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('Microphone permission was denied. You can type your answer instead.');
          break;
        case 'no-speech':
          setError('No speech was detected. You can try again or type your answer.');
          break;
        case 'audio-capture':
          setError('No microphone was detected. You can type your answer instead.');
          break;
        case 'network':
          setError('A network error interrupted speech recognition. You can type your answer instead.');
          break;
        case 'service-not-allowed':
          setError('Speech recognition service is unavailable right now. You can type your answer instead.');
          break;
        default:
          setError('Something went wrong with voice input. You can type your answer instead.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // start() throws if already started - safe to ignore.
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, error, start, stop, clearError: () => setError(null) };
}
