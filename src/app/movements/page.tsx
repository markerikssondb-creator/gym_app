"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMovements, saveMovement, deleteMovement } from '@/lib/firestore';
import { Movement, Category } from '@/types';
import { Plus, Search, Trash2, Dumbbell } from 'lucide-react';

const CATEGORIES: Category[] = ['Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Other');

  useEffect(() => {
    if (user) {
      getMovements(user.uid).then((m) => {
        setMovements(m);
        setLoading(false);
      });
    }
  }, [user]);

  const filteredMovements = movements
    .filter(m => selectedCategory === 'All' || m.category === selectedCategory)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;

    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      category: newCategory,
      isCustom: true
    };

    setMovements(prev => [...prev, newMovement]);
    await saveMovement(user.uid, newMovement);
    setNewName('');
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Delete this movement?")) return;
    setMovements(prev => prev.filter(m => m.id !== id));
    await deleteMovement(user.uid, id);
  };

  if (loading) return <div className="animate-pulse flex flex-col gap-4"><div className="h-10 bg-bg-tertiary rounded-2xl w-full" /></div>;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Movements</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
          <input 
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              selectedCategory === 'All' ? "bg-accent text-white" : "bg-bg-tertiary text-text-secondary"
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                selectedCategory === cat ? "bg-accent text-white" : "bg-bg-tertiary text-text-secondary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {showAddForm ? (
        <form onSubmit={handleAdd} className="card-depth p-6 flex flex-col gap-4 animate-slide-up">
          <h3 className="font-bold text-sm uppercase tracking-wider">New Movement</h3>
          <input 
            type="text" 
            placeholder="Exercise Name (e.g. Bench Press)" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="w-full"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-bg-tertiary py-3 rounded-xl font-bold text-sm"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-accent text-white py-3 rounded-xl font-bold text-sm"
            >
              ADD MOVEMENT
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full bg-accent/10 border border-accent/20 text-accent py-4 rounded-2xl flex items-center justify-center gap-2 font-black tracking-widest uppercase text-sm active:scale-95 transition-all shadow-sm"
        >
          <Plus size={20} />
          Add Custom Movement
        </button>
      )}

      <div className="flex flex-col gap-3">
        {filteredMovements.map(m => (
          <div key={m.id} className="card-depth flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <div className="bg-bg-tertiary p-2 rounded-xl text-text-tertiary group-hover:text-accent transition-colors">
                <Dumbbell size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">{m.name}</span>
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{m.category}</span>
              </div>
            </div>
            {m.isCustom && (
              <button 
                onClick={() => handleDelete(m.id)}
                className="p-2 text-text-tertiary hover:text-danger active:scale-90 transition-all"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
