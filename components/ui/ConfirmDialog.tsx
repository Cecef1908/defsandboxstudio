'use client';

// ============================================================================
// CONFIRM DIALOG - Dialogue de confirmation pour actions destructives
// ============================================================================

import { AlertTriangle, Trash2, Info } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const config = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const { icon: Icon, iconBg, iconColor, buttonBg } = config[variant];

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`inline-flex p-4 rounded-full ${iconBg} mb-4`}>
          <Icon size={32} className={iconColor} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-slate-400 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg ${buttonBg} text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Chargement...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
