import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Countdown timer used during an interview. The frontend timer is
 * cosmetic/UX only - the backend independently enforces expiration,
 * so this never needs to be trusted for security decisions.
 */
export function useTimer(totalSeconds, { onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    expiredRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        if (onExpire) onExpire();
      }
      return undefined;
    }
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onExpire]);

  const reset = useCallback((next) => {
    setSecondsLeft(next ?? totalSeconds);
    expiredRef.current = false;
  }, [totalSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 60 && secondsLeft > 0;
  const isExpired = secondsLeft <= 0;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { secondsLeft, formatted, isWarning, isExpired, reset };
}
