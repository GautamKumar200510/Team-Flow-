import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 2500);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, 'error', title), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const iconMap = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
              error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
              info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
            };

            const borderColors = {
              success: 'border-emerald-200 bg-white text-gray-900',
              error: 'border-rose-200 bg-white text-gray-900',
              warning: 'border-amber-200 bg-white text-gray-900',
              info: 'border-indigo-200 bg-white text-gray-900',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
                onClick={() => removeToast(toast.id)}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-md hover:shadow-lg cursor-pointer transition-all ${borderColors[toast.type]}`}
                id={`toast-${toast.id}`}
                role="alert"
                title="Click to dismiss"
              >
                {iconMap[toast.type]}
                <div className="flex-1 min-w-0 pr-1">
                  {toast.title && <h5 className="text-xs font-semibold text-gray-900 tracking-tight">{toast.title}</h5>}
                  <p className="text-xs text-gray-600 leading-relaxed break-words">{toast.message}</p>
                </div>
                <button
                  id={`btn-close-${toast.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 rounded p-0.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
