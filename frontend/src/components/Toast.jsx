export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      {message}
      <style>{`
        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          z-index: 1000;
          max-width: calc(100vw - 32px);
          padding: 12px 22px;
          border-radius: 999px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
          transform: translateX(-50%);
          animation: toast-in 0.2s ease-out;
        }
        .toast-success { background: #000; }
        .toast-error { background: #dc2626; }
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}