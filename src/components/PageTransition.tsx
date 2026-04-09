"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const tabOrder = ['/', '/templates', '/movements', '/history', '/settings'];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [direction, setDirection] = useState<'left' | 'right' | 'none'>('none');

  useEffect(() => {
    if (pathname !== prevPath) {
      const prevIndex = tabOrder.indexOf(prevPath);
      const currIndex = tabOrder.indexOf(pathname);
      
      if (prevIndex !== -1 && currIndex !== -1) {
        setDirection(currIndex > prevIndex ? 'right' : 'left');
      } else {
        setDirection('none');
      }
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  return (
    <div className="relative overflow-hidden w-full h-full">
      <div 
        key={pathname}
        className={cn(
          "w-full h-full",
          direction === 'right' ? 'animate-slide-in-right' : 
          direction === 'left' ? 'animate-slide-in-left' : 'animate-fade-in'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Add these keyframes to globals.css if not already there
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
