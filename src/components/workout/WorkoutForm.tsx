"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Repeat, Info } from 'lucide-react';
import { Movement, WorkoutEntry } from '@/types';
import { cn } from '@/lib/utils';

interface WorkoutFormProps {
  movements: Movement[];
  onLogSet: (entry: Omit<WorkoutEntry, 'id' | 'createdAt'>) => void;
  lastEntry?: WorkoutEntry;
}

export function WorkoutForm({ movements, onLogSet, lastEntry }: WorkoutFormProps) {
  const [movementSearch, setMovementSearch] = useState('');
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const movementInputRef = useRef<HTMLInputElement>(null);

  // Filter movements based on search
  const filteredMovements = movements
    .filter(m => m.name.toLowerCase().includes(movementSearch.toLowerCase()))
    .slice(0, 8);

  // Autocomplete selecting a movement
  const selectMovement = (movementName: string) => {
    setMovementSearch(movementName);
    setShowDropdown(false);
    
    // Find last set for this movement to provide smart defaults
    if (lastEntry && lastEntry.movementName === movementName) {
      setReps(lastEntry.reps.toString());
      setWeight(lastEntry.weight.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementSearch || !reps || !weight) return;

    onLogSet({
      movementName: movementSearch,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      unit: 'kg', // default
      notes: notes || undefined
    });

    // Reset fields but keep movement focused
    setReps('');
    setWeight('');
    setNotes('');
    movementInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-slide-up">
      <div className="relative">
        <input
          ref={movementInputRef}
          type="text"
          placeholder="Movement Name"
          value={movementSearch}
          onChange={(e) => {
            setMovementSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full text-lg font-medium"
        />
        
        {showDropdown && filteredMovements.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-bg-secondary border border-border-color rounded-xl shadow-card-hover overflow-hidden animate-fade-in">
            {filteredMovements.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMovement(m.name)}
                className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors border-b border-border-color last:border-0"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-tertiary px-1 uppercase letter-spacing-wide">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            className="text-center font-bold text-xl"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-tertiary px-1 uppercase letter-spacing-wide">Weight (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            className="text-center font-bold text-xl"
          />
        </div>
      </div>

      {showNotes && (
        <textarea
          placeholder="Add notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none text-sm min-h-[80px]"
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="p-3 bg-bg-tertiary rounded-xl text-text-secondary"
        >
          <Info size={24} />
        </button>
        <button
          type="submit"
          className="flex-1 bg-accent text-white font-bold py-3.5 rounded-xl shadow-card flex items-center justify-center gap-2 text-lg active:bg-accent-active"
        >
          <Plus size={24} />
          LOG SET
        </button>
      </div>

      {lastEntry && (
        <button
          type="button"
          onClick={() => {
            onLogSet({
              movementName: lastEntry.movementName,
              reps: lastEntry.reps,
              weight: lastEntry.weight,
              unit: lastEntry.unit,
              notes: lastEntry.notes
            });
          }}
          className="w-full bg-bg-accent text-accent font-bold py-3 rounded-xl border border-accent/20 flex items-center justify-center gap-2 text-sm active:bg-accent-active/20"
        >
          <Repeat size={18} />
          REPEAT LAST: {lastEntry.movementName}
        </button>
      )}
    </form>
  );
}
