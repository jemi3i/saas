
import React from 'react';
import { useToastStore, ToastType } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border bg-card shadow-2xl animate-in slide-in-from-right-4 duration-300",
            "border-l-4",
            toast.type === 'success' && "border-l-emerald-500",
            toast.type === 'error' && "border-l-rose-500",
            toast.type === 'info' && "border-l-blue-500",
            toast.type === 'warning' && "border-l-amber-500"
          )}
        >
          <div className="shrink-0">{icons[toast.type]}</div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
