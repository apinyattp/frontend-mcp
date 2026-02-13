"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircleIcon, XCircleIcon } from "./icons";

type ToastType = "success" | "error";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string, t: ToastType = "success") => {
    setMessage(msg);
    setType(t);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed bottom-8 right-8 bg-bg-surface-2 border border-border rounded-[10px] px-5 py-3.5 text-[0.85rem] text-text-primary flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[200] transition-all duration-350 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-[100px] opacity-0"
        }`}
      >
        {type === "success" ? (
          <CheckCircleIcon className="w-5 h-5 text-success" />
        ) : (
          <XCircleIcon className="w-5 h-5 text-danger" />
        )}
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  );
}
