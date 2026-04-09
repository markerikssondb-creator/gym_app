"use client";

import React from 'react';
import { Trash2, Copy, Pencil, Check } from 'lucide-react';
import { WorkoutEntry } from '@/types';
import { cn } from '@/lib/utils';

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onDeleteSet: (id: string) => void;
  onDuplicateSet: (id: string) => void;
  onDeleteMovement: (movementName: string) => void;
  onUpdateSet: (id: string, reps: number, weight: number) => void;
}

export function WorkoutList({ 
  entries, 
  onDeleteSet, 
  onDuplicateSet, 
  onDeleteMovement,
  onUpdateSet
}: WorkoutListProps) {
  // Group entries by movement name
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.movementName]) {
      acc[entry.movementName] = [];
    }
    acc[entry.movementName].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {Object.entries(groupedEntries).map(([movementName, sets]) => (
        <div key={movementName} className="flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
              {movementName} <span className="text-text-tertiary ml-1 ml-2 font-normal">({sets.length} sets)</span>
            </h3>
            <button 
              onClick={() => onDeleteMovement(movementName)}
              className="p-2 text-text-tertiary hover:text-danger active:scale-90 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {sets.map((set, index) => (
              <WorkoutEntryRow 
                key={set.id}
                set={set}
                index={index + 1}
                onDelete={() => onDeleteSet(set.id)}
                onDuplicate={() => onDuplicateSet(set.id)}
                onUpdate={(reps, weight) => onUpdateSet(set.id, reps, weight)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkoutEntryRow({ 
  set, 
  index, 
  onDelete, 
  onDuplicate,
  onUpdate
}: { 
  set: WorkoutEntry, 
  index: number,
  onDelete: () => void,
  onDuplicate: () => void,
  onUpdate: (reps: number, weight: number) => void
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editReps, setEditReps] = React.useState(set.reps.toString());
  const [editWeight, setEditWeight] = React.useState(set.weight.toString());

  const handleSave = () => {
    onUpdate(parseInt(editReps), parseFloat(editWeight));
    setIsEditing(false);
  };

  return (
    <div className="card-depth flex items-center justify-between px-4 py-3 bg-bg-secondary group">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-text-tertiary w-4">{index}</span>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
              className="w-12 p-1 text-center font-bold text-sm h-8"
              autoFocus
            />
            <span className="text-text-tertiary">×</span>
            <input 
              type="number"
              step="0.5"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              className="w-16 p-1 text-center font-bold text-sm h-8"
            />
            <button onClick={handleSave} className="p-1 text-success">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 font-bold">
            <span className="text-lg">{set.reps}</span>
            <span className="text-text-tertiary text-sm font-normal">×</span>
            <span className="text-lg">{set.weight}</span>
            <span className="text-text-tertiary text-xs font-normal ml-0.5">{set.unit}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-text-tertiary hover:text-accent active:scale-90 transition-all"
          >
            <Pencil size={18} />
          </button>
        )}
        <button 
          onClick={onDuplicate}
          className="p-2 text-text-tertiary hover:text-accent active:scale-90 transition-all"
        >
          <Copy size={18} />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-text-tertiary hover:text-danger active:scale-90 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
