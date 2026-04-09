"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { getWorkouts } from '@/lib/firestore';
import { LogOut, Sun, Moon, Monitor, Scale, Download, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  const handleExportCSV = async () => {
    if (!user) return;
    const workouts = await getWorkouts(user.uid);
    
    let csv = 'Date,Movement,Weight,Unit,Reps,Notes\n';
    workouts.forEach(w => {
      w.entries.forEach(e => {
        const notes = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : '';
        csv += `${w.date},${e.movementName},${e.weight},${e.unit},${e.reps},${notes}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `gym-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-8 pb-10 animate-fade-in">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
        <p className="text-text-tertiary text-sm font-bold uppercase tracking-wider">Account & Preferences</p>
      </header>

      {/* Profile Section */}
      <section className="flex flex-col gap-4">
        <div className="card-depth p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-bg-tertiary w-12 h-12 rounded-full flex items-center justify-center text-accent font-bold">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-text-primary truncate max-w-[200px]">{user?.email}</span>
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Logged In</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-danger/10 text-danger rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-danger/20 transition-all active:scale-95"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-text-tertiary uppercase tracking-widest pl-1">Appearance</h2>
        <div className="card-depth p-2 grid grid-cols-3 gap-1">
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                setTheme(opt.id as any);
                updateSettings({ theme: opt.id as any });
              }}
              className={cn(
                "flex flex-col items-center gap-2 py-4 rounded-xl transition-all",
                (theme === opt.id) ? "bg-bg-accent text-accent shadow-sm" : "text-text-tertiary hover:bg-bg-tertiary"
              )}
            >
              <opt.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Unit Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-text-tertiary uppercase tracking-widest pl-1">Weight Unit</h2>
        <div className="card-depth p-2 grid grid-cols-2 gap-1">
          {['kg', 'lbs'].map(u => (
            <button
              key={u}
              onClick={() => updateSettings({ unit: u as any })}
              className={cn(
                "flex items-center justify-center gap-2 py-4 rounded-xl transition-all",
                settings.unit === u ? "bg-bg-accent text-accent shadow-sm" : "text-text-tertiary hover:bg-bg-tertiary"
              )}
            >
              <Scale size={18} />
              <span className="text-sm font-black uppercase tracking-widest">{u}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Data Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-text-tertiary uppercase tracking-widest pl-1">Data</h2>
        <button 
          onClick={handleExportCSV}
          className="card-depth p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-bg-tertiary p-3 rounded-2xl text-text-tertiary group-hover:text-accent transition-colors">
              <Download size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Export All Data</span>
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">CSV Format</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-accent uppercase tracking-widest">Download</span>
        </button>
      </section>

      <footer className="mt-10 mb-6 flex flex-col items-center gap-2 opacity-30">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
          Gym Logger <Heart size={10} className="fill-current" /> Aesthetic
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest">Built with Next.js & Firebase</p>
      </footer>
    </div>
  );
}
