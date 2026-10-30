import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePlatform();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-xs leading-relaxed transition-all duration-200 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#131517] text-white border-white/10'
              : toast.type === 'error'
              ? 'bg-red-500/15 text-red-300 border-red-500/30'
              : 'bg-[#1A1C1F] text-white border-white/15'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-[#D1FE17] shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-white/75 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 font-medium">{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#898A8B] hover:text-white p-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
