"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  ClipboardList, 
  Dumbbell, 
  History as HistoryIcon, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: 'WORKOUT', href: '/', icon: Activity },
  { name: 'TEMPLATES', href: '/templates', icon: ClipboardList },
  { name: 'MOVE', href: '/movements', icon: Dumbbell },
  { name: 'HISTORY', href: '/history', icon: HistoryIcon },
  { name: 'SETTINGS', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show nav on login page
  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] glass-nav backdrop-blur-xl">
      <div className="flex h-16 w-full max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 transition-all",
                "active:scale-90",
                isActive ? "text-accent scale-105" : "text-text-tertiary hover:text-accent/70"
              )}
            >
              <div className={cn(
                "p-1 transition-all duration-300",
                isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold tracking-wider">
                {tab.name}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
