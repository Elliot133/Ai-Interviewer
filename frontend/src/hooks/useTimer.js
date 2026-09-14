import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Countdown timer used during an interview.
 * The backend independently enforces expiration.
 * The timer stays inactive until a valid positive duration is supplied.
 */
export function useTimer(totalSeconds, { onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (totalSeconds == null || totalSeconds <= 0) {
      setSecondsLeft(null);
      expiredRef.current = false;
      return;
    }

    setSecondsLeft(totalSeconds);
    expiredRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft == null) {
      return undefined;
    }

    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return undefined;
    }

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev == null) return null;
        return Math.max(prev - 1, 0);
      });
    }, 1000);

    return () => clearInterval(id);
  }, [secondsLeft, onExpire]);

  const reset = useCallback((next) => {
    const value = next ?? totalSeconds;

    if (value == null || value <= 0) {
      setSecondsLeft(null);
      expiredRef.current = false;
      return;
    }

    setSecondsLeft(value);
    expiredRef.current = false;
  }, [totalSeconds]);

  const safeSeconds = secondsLeft ?? 0;

  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  const isWarning =
    secondsLeft != null &&
    secondsLeft <= 60 &&
    secondsLeft > 0;

  const isExpired =
    secondsLeft != null &&
    secondsLeft <= 0;

  const formatted =
    secondsLeft == null
      ? '--:--'
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    formatted,
    isWarning,
    isExpired,
    reset,
  };
}