"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessToastProps {
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({ title, message, onClose, duration = 3000 }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-8 left-4 right-4 z-[100] max-w-lg mx-auto animate-fade-in">
      <div className="bg-success text-white rounded-2xl p-4 shadow-card-lg flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-xl">
          <CheckCircle2 size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm uppercase tracking-wider">{title}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 opacity-50 hover:opacity-100">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
