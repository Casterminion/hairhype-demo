import { ReactNode, useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];
let toastId = 0;

export function showToast(type: ToastType, message: string) {
  const toast: ToastMessage = {
    id: `toast-${toastId++}`,
    type,
    message,
  };
  toastListeners.forEach(listener => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const icons = {
    success: <CheckCircle size={20} className="text-[var(--success)]" />,
    error: <AlertCircle size={20} className="text-[var(--danger)]" />,
    info: <AlertCircle size={20} className="text-[var(--gold)]" />,
  };

  const borderColors = {
    success: 'border-l-[var(--success)]',
    error: 'border-l-[var(--danger)]',
    info: 'border-l-[var(--gold)]',
  };

  return (
    <div
      className={`
        pointer-events-auto
        bg-[var(--card)] border-l-4 ${borderColors[toast.type]}
        rounded-[var(--radius-lg)] shadow-[var(--shadow-med)]
        p-4 flex items-start gap-3
        animate-slide-left
      `}
      style={{
        animation: 'slideLeft 0.3s var(--ease-default)'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm text-[var(--ink)]">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Uždaryti"
      >
        <X size={16} />
      </button>
    </div>
  );
}
