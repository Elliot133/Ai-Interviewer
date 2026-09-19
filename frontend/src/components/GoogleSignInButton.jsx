import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google's official "Continue with Google" button and forwards the
 * resulting ID token to the caller. The actual sign-in/registration request
 * to our backend is handled by the parent (Login/Register page) via
 * onCredential, so this component only owns the Google Identity Services
 * widget and a lightweight "verifying" overlay while that request is in
 * flight.
 */
export default function GoogleSignInButton({ onCredential, onError, disabled = false }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;

    function renderButton() {
      if (cancelled) return;
      if (!window.google?.accounts?.id || !containerRef.current) {
        retryTimeoutRef.current = setTimeout(renderButton, 100);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onCredential(response.credential);
          } else {
            onError?.('Google sign-in did not return a valid response. Please try again.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 360,
      });
      setReady(true);
    }

    renderButton();

    return () => {
      cancelled = true;
      clearTimeout(retryTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={`google-btn-wrap ${disabled ? 'is-disabled' : ''}`}>
      <div ref={containerRef} className="google-btn-target" />
      {disabled && (
        <div className="google-btn-status">
          <span className="google-btn-dot" />
          Signing in with Google...
        </div>
      )}
      {!ready && !disabled && <div className="google-btn-placeholder" />}

      <style>{`
        .google-btn-wrap {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .google-btn-target {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .google-btn-wrap.is-disabled .google-btn-target {
          opacity: 0;
          pointer-events: none;
          height: 0;
          overflow: hidden;
        }
        .google-btn-placeholder {
          height: 40px;
          width: 100%;
          max-width: 360px;
          border-radius: 999px;
          background: var(--color-border);
          opacity: 0.4;
        }
        .google-btn-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 360px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid var(--color-border-strong);
          background: var(--color-surface);
          color: var(--color-ink-soft);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
        }
        .google-btn-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
          animation: google-btn-pulse 1s ease-in-out infinite;
        }
        @keyframes google-btn-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
