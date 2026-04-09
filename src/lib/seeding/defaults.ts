import { Movement, Template } from "@/types";

export const DEFAULT_MOVEMENTS: Movement[] = [
  // Legs
  { id: 'squat', name: 'Squat', category: 'Legs', isCustom: false },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs', isCustom: false },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs', isCustom: false },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs', isCustom: false },
  // Back
  { id: 'deadlift', name: 'Deadlift', category: 'Back', isCustom: false },
  { id: 'pull-up', name: 'Pull-Up', category: 'Back', isCustom: false },
  { id: 'barbell-row', name: 'Barbell Row', category: 'Back', isCustom: false },
  // Chest
  { id: 'bench-press', name: 'Bench Press', category: 'Chest', isCustom: false },
  { id: 'incline-press', name: 'Incline Bench Press', category: 'Chest', isCustom: false },
  { id: 'cable-fly', name: 'Cable Fly', category: 'Chest', isCustom: false },
  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', category: 'Shoulders', isCustom: false },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'Shoulders', isCustom: false },
  // Arms
  { id: 'bicep-curl', name: 'Barbell Curl', category: 'Arms', isCustom: false },
  { id: 'skull-crusher', name: 'Skull Crusher', category: 'Arms', isCustom: false },
  // Core
  { id: 'plank', name: 'Plank', category: 'Core', isCustom: false },
  { id: 'leg-raise', name: 'Hanging Leg Raise', category: 'Core', isCustom: false },
  // Cardio
  { id: 'running', name: 'Running', category: 'Cardio', isCustom: false },
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'full-body-a',
    name: 'Majestic Full Body A',
    order: 0,
    createdAt: Date.now(),
    entries: [
      { movementName: 'Squat', reps: 8, weight: 60, unit: 'kg' },
      { movementName: 'Bench Press', reps: 8, weight: 40, unit: 'kg' },
      { movementName: 'Barbell Row', reps: 8, weight: 40, unit: 'kg' },
    ]
  }
];
