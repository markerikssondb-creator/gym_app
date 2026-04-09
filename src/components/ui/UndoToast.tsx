"use client";

import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export function UndoToast({ message, onUndo, onClose, duration = 5000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] max-w-lg mx-auto animate-slide-up">
      <div className="bg-text-primary text-bg-primary rounded-2xl p-4 shadow-card-lg flex items-center justify-between gap-4 overflow-hidden relative">
        <span className="text-sm font-medium">{message}</span>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onUndo}
            className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            UNDO
          </button>
          <button onClick={onClose} className="p-1 opacity-50 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
