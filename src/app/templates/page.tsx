"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTemplates, saveTemplate, deleteTemplate, addEntriesToWorkout } from '@/lib/firestore';
import { Template } from '@/types';
import { Plus, Play, Trash2, Edit2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getTemplates(user.uid).then((t) => {
        setTemplates(t);
        setLoading(false);
      });
    }
  }, [user]);

  const handleLoadTemplate = async (template: Template) => {
    if (!user) return;
    setLoadingTemplateId(template.id);
    
    const workoutId = Math.random().toString(36).substr(2, 9);
    const date = formatDate(new Date());
    
    const entries = template.entries.map(te => ({
      ...te,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    }));

    await addEntriesToWorkout(user.uid, workoutId, date, entries);
    
    setLoadingTemplateId(null);
    setSuccessId(template.id);
    
    setTimeout(() => {
      router.push('/');
    }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Delete this template?")) return;
    setTemplates(prev => prev.filter(t => t.id !== id));
    await deleteTemplate(user.uid, id);
  };

  const handleReorder = async (index: number, move: 'up' | 'down') => {
    if (!user) return;
    const newTemplates = [...templates];
    const item = newTemplates[index];
    const targetIndex = move === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newTemplates.length) return;
    
    newTemplates.splice(index, 1);
    newTemplates.splice(targetIndex, 0, item);
    
    const updatedWithOrder = newTemplates.map((t, i) => ({ ...t, order: i }));
    setTemplates(updatedWithOrder);
    
    await Promise.all(updatedWithOrder.map(t => saveTemplate(user.uid, t)));
  };

  if (loading) return <div className="animate-pulse h-40 bg-bg-tertiary rounded-3xl" />;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase tracking-tight">Templates</h1>
          <p className="text-text-tertiary text-sm font-bold uppercase tracking-wider">Fast Routines</p>
        </div>
        <button className="bg-accent text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <div className="flex flex-col gap-4">
        {templates.map((template, index) => (
          <div key={template.id} className="card-depth p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-black text-sm uppercase tracking-tight">{template.name}</h3>
                <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                  {template.entries.length} Exercises
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-text-tertiary hover:text-accent disabled:opacity-20"
                >
                  <ChevronUp size={18} />
                </button>
                <button 
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === templates.length - 1}
                  className="p-1.5 text-text-tertiary hover:text-accent disabled:opacity-20"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {template.entries.slice(0, 3).map((e, i) => (
                <span key={i} className="text-[9px] bg-bg-tertiary px-2 py-1 rounded-md font-bold text-text-secondary uppercase">
                  {e.movementName}
                </span>
              ))}
              {template.entries.length > 3 && (
                <span className="text-[9px] bg-bg-tertiary px-2 py-1 rounded-md font-bold text-text-tertiary uppercase">
                  +{template.entries.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => handleLoadTemplate(template)}
                disabled={loadingTemplateId === template.id || successId === template.id}
                className={cn(
                  "flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all active:scale-95 shadow-sm",
                  successId === template.id ? "bg-success text-white" : "bg-accent text-white"
                )}
              >
                {loadingTemplateId === template.id ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : successId === template.id ? (
                  <>
                    <CheckCircle2 size={16} />
                    Loaded!
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Load Routine
                  </>
                )}
              </button>
              <button className="flex-1 bg-bg-tertiary p-3.5 rounded-2xl flex items-center justify-center hover:bg-bg-accent/40 transition-colors">
                <Edit2 size={18} className="text-text-secondary" />
              </button>
              <button 
                onClick={() => handleDelete(template.id)}
                className="flex-1 bg-bg-tertiary p-3.5 rounded-2xl flex items-center justify-center hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={18} className="text-text-tertiary hover:text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-20 text-text-tertiary uppercase font-bold text-xs tracking-widest">
          No templates saved
        </div>
      )}
    </div>
  );
}
