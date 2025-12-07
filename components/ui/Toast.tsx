'use client';

// ============================================================================
// TOAST - Système de notifications élégant
// ============================================================================

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto-dismiss après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextType = {
    toasts,
    success: (title, message, duration) => addToast('success', title, message, duration),
    error: (title, message, duration) => addToast('error', title, message, duration),
    info: (title, message, duration) => addToast('info', title, message, duration),
    warning: (title, message, duration) => addToast('warning', title, message, duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-100',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      iconColor: 'text-red-400',
      textColor: 'text-red-100',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      textColor: 'text-amber-100',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-100',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[toast.type];

  return (
    <div
      className={`
        pointer-events-auto
        ${bgColor} ${borderColor}
        backdrop-blur-xl border rounded-xl p-4
        shadow-2xl
        animate-in slide-in-from-right-full duration-300
        flex items-start gap-3
      `}
    >
      <div className={`p-2 rounded-lg ${bgColor} ${iconColor}`}>
        <Icon size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold ${textColor} mb-1`}>{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-slate-300">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
