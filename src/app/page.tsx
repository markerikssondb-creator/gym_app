"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getWorkouts, 
  getMovements, 
  saveWorkout 
} from '@/lib/firestore';
import { Workout, Movement, WorkoutEntry } from '@/types';
import { formatDate } from '@/lib/utils';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { WorkoutList } from '@/components/workout/WorkoutList';
import { UndoToast } from '@/components/ui/UndoToast';
import { SuccessToast } from '@/components/ui/SuccessToast';

export default function HomePage() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [undoItem, setUndoItem] = useState<{ type: 'set' | 'movement', data: any } | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ title: string, msg: string } | null>(null);

  const today = formatDate(new Date());

  useEffect(() => {
    if (user) {
      Promise.all([
        getWorkouts(user.uid),
        getMovements(user.uid)
      ]).then(([workouts, m]) => {
        const todayWorkout = workouts.find(w => w.date === today && !w.completed);
        if (todayWorkout) setWorkout(todayWorkout);
        setMovements(m);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user, today]);

  const handleLogSet = async (entryData: Omit<WorkoutEntry, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const newEntry: WorkoutEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    const updatedWorkout: Workout = workout ? {
      ...workout,
      entries: [...workout.entries, newEntry]
    } : {
      id: Math.random().toString(36).substr(2, 9),
      date: today,
      entries: [newEntry],
      createdAt: Date.now(),
      completed: false
    };

    setWorkout(updatedWorkout);
    await saveWorkout(user.uid, updatedWorkout);
  };

  const handleDeleteSet = async (id: string) => {
    if (!user || !workout) return;
    const deletedSet = workout.entries.find(e => e.id === id);
    if (!deletedSet) return;

    setUndoItem({ type: 'set', data: { set: deletedSet, index: workout.entries.indexOf(deletedSet) } });
    
    const updatedEntries = workout.entries.filter(e => e.id !== id);
    const updatedWorkout = { ...workout, entries: updatedEntries };
    setWorkout(updatedWorkout);
    await saveWorkout(user.uid, updatedWorkout);
  };

  const handleUndo = async () => {
    if (!user || !workout || !undoItem) return;

    const updatedWorkout = { ...workout };
    if (undoItem.type === 'set') {
      const { set, index } = undoItem.data;
      const newEntries = [...workout.entries];
      newEntries.splice(index, 0, set);
      updatedWorkout.entries = newEntries;
    } else if (undoItem.type === 'movement') {
      const { movementName, sets } = undoItem.data;
      updatedWorkout.entries = [...workout.entries, ...sets].sort((a, b) => a.createdAt - b.createdAt);
    }

    setWorkout(updatedWorkout);
    await saveWorkout(user.uid, updatedWorkout);
    setUndoItem(null);
  };

  const handleFinishWorkout = async () => {
    if (!user || !workout) return;
    const finishedWorkout = { ...workout, completed: true };
    await saveWorkout(user.uid, finishedWorkout);
    
    const totalVolume = workout.entries.reduce((acc, e) => acc + (Number(e.weight) * Number(e.reps)), 0);
    setSuccessMsg({ 
      title: 'WORKOUT COMPLETE!', 
      msg: `${workout.entries.length} sets logged. Total volume: ${totalVolume}kg.` 
    });
    setWorkout(null);
  };

  if (loading) return (
    <div className="flex flex-col gap-6">
      <div className="h-40 skeleton rounded-3xl" />
      <div className="h-20 skeleton rounded-3xl" />
      <div className="h-20 skeleton rounded-3xl" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tight">Today's Session</h1>
        <p className="text-text-tertiary text-sm font-bold uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <WorkoutForm 
        movements={movements} 
        onLogSet={handleLogSet} 
        lastEntry={workout?.entries[workout.entries.length - 1]}
      />

      {workout && workout.entries.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-color pb-2">
            <h2 className="text-xs font-black text-text-tertiary uppercase tracking-widest">Logged Sets</h2>
            <span className="text-xs font-bold text-accent">
              {workout.entries.length} sets • {workout.entries.reduce((acc, e) => acc + (Number(e.weight) * Number(e.reps)), 0)}kg
            </span>
          </div>
          
          <WorkoutList 
            entries={workout.entries}
            onDeleteSet={handleDeleteSet}
            onDuplicateSet={(id) => {
              const set = workout.entries.find(e => e.id === id);
              if (set) {
                const { id: _, createdAt: __, ...data } = set;
                handleLogSet(data);
              }
            }}
            onDeleteMovement={(name) => {
              const sets = workout.entries.filter(e => e.movementName === name);
              setUndoItem({ type: 'movement', data: { movementName: name, sets } });
              const updatedWorkout = { ...workout, entries: workout.entries.filter(e => e.movementName !== name) };
              setWorkout(updatedWorkout);
              if (user) saveWorkout(user.uid, updatedWorkout);
            }}
            onUpdateSet={(id, reps, weight) => {
              const updatedEntries = workout.entries.map(e => e.id === id ? { ...e, reps, weight } : e);
              const updatedWorkout = { ...workout, entries: updatedEntries };
              setWorkout(updatedWorkout);
              if (user) saveWorkout(user.uid, updatedWorkout);
            }}
          />

          <button
            onClick={handleFinishWorkout}
            className="w-full bg-text-primary text-bg-primary font-black py-4 rounded-2xl shadow-lg mt-4 active:scale-95 transition-all text-sm tracking-widest uppercase"
          >
            Finish Workout
          </button>
        </div>
      )}

      {undoItem && (
        <UndoToast 
          message={undoItem.type === 'set' ? 'Set deleted' : `Deleted ${undoItem.data.movementName}`}
          onUndo={handleUndo}
          onClose={() => setUndoItem(null)}
        />
      )}

      {successMsg && (
        <SuccessToast 
          title={successMsg.title}
          message={successMsg.msg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
    </div>
  );
}
