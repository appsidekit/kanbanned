"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 10 seconds
    setTimeout(() => removeToast(id), 10000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md animate-toast-in",
              t.type === "success" && "bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-700 dark:text-emerald-100",
              t.type === "error" && "bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/90 dark:border-rose-700 dark:text-rose-100",
              t.type === "warning" && "bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-950/90 dark:border-amber-700 dark:text-amber-100",
              t.type === "info" && "bg-stone-50/90 border-stone-200 text-stone-900 dark:bg-stone-900/90 dark:border-stone-600 dark:text-stone-100"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {t.type === "info" && <Info className="h-5 w-5 text-stone-500" />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="mt-0.5 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
