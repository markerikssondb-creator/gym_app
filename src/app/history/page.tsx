"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWorkouts, deleteWorkout, saveWorkout } from '@/lib/firestore';
import { Workout } from '@/types';
import { formatRelativeDate, formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react';
import { WorkoutList } from '@/components/workout/WorkoutList';

export default function HistoryPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      getWorkouts(user.uid).then((w) => {
        setWorkouts(w);
        setLoading(false);
      });
    }
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm("Permanently delete this workout?")) return;
    setWorkouts(prev => prev.filter(w => w.id !== id));
    await deleteWorkout(user.uid, id);
  };

  const getWeekStart = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return formatDate(weekStart);
  };

  const groupedWorkouts = workouts.reduce((acc, w) => {
    const weekStart = getWeekStart(w.date);
    if (!acc[weekStart]) acc[weekStart] = [];
    acc[weekStart].push(w);
    return acc;
  }, {} as Record<string, Workout[]>);

  if (loading) return <div className="animate-pulse h-40 bg-bg-tertiary rounded-3xl" />;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tight">History</h1>
        <p className="text-text-tertiary text-sm font-bold uppercase tracking-wider">Your Journey</p>
      </header>

      {Object.entries(groupedWorkouts).map(([week, weekWorkouts]) => (
        <div key={week} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Calendar size={14} className="text-accent" />
            <h2 className="text-xs font-black text-accent uppercase tracking-[0.2em]">
              Week of {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {weekWorkouts.map(w => (
              <div key={w.id} className="card-depth overflow-hidden">
                <header 
                  onClick={() => toggleExpand(w.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-accent/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black uppercase tracking-tight">{formatRelativeDate(w.date)}</span>
                    <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                      {w.entries[0]?.movementName} {w.entries.length > 1 && `+ ${w.entries.length - 1} more`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-bg-tertiary px-2 py-1 rounded-lg text-[10px] font-black text-text-secondary uppercase">
                      {w.entries.length} sets
                    </span>
                    {expandedIds.includes(w.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </header>

                {expandedIds.includes(w.id) && (
                  <div className="p-4 border-t border-border-color bg-bg-primary/30 animate-fade-in">
                    <WorkoutList 
                      entries={w.entries}
                      onDeleteSet={async (sid) => {
                        const newEntries = w.entries.filter(e => e.id !== sid);
                        if (newEntries.length === 0) {
                          handleDelete(w.id);
                        } else {
                          const updated = { ...w, entries: newEntries };
                          setWorkouts(prev => prev.map(p => p.id === w.id ? updated : p));
                          if (user) await saveWorkout(user.uid, updated);
                        }
                      }}
                      onDuplicateSet={async (sid) => {
                        const set = w.entries.find(e => e.id === sid);
                        if (set) {
                          const newEntry = { ...set, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
                          const updated = { ...w, entries: [...w.entries, newEntry] };
                          setWorkouts(prev => prev.map(p => p.id === w.id ? updated : p));
                          if (user) await saveWorkout(user.uid, updated);
                        }
                      }}
                      onDeleteMovement={async (name) => {
                        const newEntries = w.entries.filter(e => e.movementName !== name);
                        if (newEntries.length === 0) {
                          handleDelete(w.id);
                        } else {
                          const updated = { ...w, entries: newEntries };
                          setWorkouts(prev => prev.map(p => p.id === w.id ? updated : p));
                          if (user) await saveWorkout(user.uid, updated);
                        }
                      }}
                      onUpdateSet={async (sid, reps, weight) => {
                        const newEntries = w.entries.map(e => e.id === sid ? { ...e, reps, weight } : e);
                        const updated = { ...w, entries: newEntries };
                        setWorkouts(prev => prev.map(p => p.id === w.id ? updated : p));
                        if (user) await saveWorkout(user.uid, updated);
                      }}
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }}
                      className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-danger font-bold text-xs uppercase tracking-widest border border-danger/20 rounded-xl hover:bg-danger/5"
                    >
                      <Trash2 size={16} />
                      Delete Workout
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {workouts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-tertiary">
          <Calendar size={48} strokeWidth={1} />
          <p className="font-bold text-sm uppercase tracking-widest">No workout history yet</p>
        </div>
      )}
    </div>
  );
}
