import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <NotificationContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

const toastColors = {
  success: { bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
  error:   { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
  info:    { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  warning: { bg: '#fef9c3', border: '#f59e0b', text: '#78350f' },
};

function Toast({ toast, onClose }) {
  const c = toastColors[toast.type] || toastColors.info;
  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`, color: c.text,
      padding: '12px 16px', borderRadius: 10, minWidth: 260, maxWidth: 380,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      animation: 'slideIn 0.2s ease',
    }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: c.text, lineHeight: 1, padding: 0 }}
      >×</button>
    </div>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
};