import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  writeBatch,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Workout, WorkoutEntry, Movement, Template, UserSettings } from '@/types';

const getWorkoutsRef = (userId: string) => collection(db, 'users', userId, 'workouts');
const getMovementsRef = (userId: string) => collection(db, 'users', userId, 'movements');
const getTemplatesRef = (userId: string) => collection(db, 'users', userId, 'templates');
const getSettingsRef = (userId: string) => doc(db, 'users', userId, 'settings', 'current');

// Workouts
export async function getWorkouts(userId: string) {
  const q = query(getWorkoutsRef(userId), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)).filter(w => w.entries.length > 0);
}

export async function saveWorkout(userId: string, workout: Workout) {
  const workoutRef = doc(db, 'users', userId, 'workouts', workout.id);
  await setDoc(workoutRef, { ...workout, updatedAt: Date.now() });
}

export async function addEntriesToWorkout(userId: string, workoutId: string, date: string, entries: WorkoutEntry[]) {
  const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
  const workoutSnap = await getDoc(workoutRef);
  
  if (workoutSnap.exists()) {
    const existingWorkout = workoutSnap.data() as Workout;
    const updatedEntries = [...existingWorkout.entries, ...entries];
    await updateDoc(workoutRef, { entries: updatedEntries, updatedAt: Date.now() });
  } else {
    const newWorkout: Workout = {
      id: workoutId,
      date,
      entries,
      createdAt: Date.now(),
      completed: false
    };
    await setDoc(workoutRef, newWorkout);
  }
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
}

// Movements
export async function getMovements(userId: string) {
  const snapshot = await getDocs(getMovementsRef(userId));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
}

export async function saveMovement(userId: string, movement: Movement) {
  const ref = doc(getMovementsRef(userId), movement.id);
  await setDoc(ref, movement);
}

export async function deleteMovement(userId: string, movementId: string) {
  await deleteDoc(doc(getMovementsRef(userId), movementId));
}

// Templates
export async function getTemplates(userId: string) {
  const q = query(getTemplatesRef(userId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
}

export async function saveTemplate(userId: string, template: Template) {
  const ref = doc(getTemplatesRef(userId), template.id);
  await setDoc(ref, template);
}

export async function deleteTemplate(userId: string, templateId: string) {
  await deleteDoc(doc(getTemplatesRef(userId), templateId));
}

// Settings
export async function getSettings(userId: string) {
  const snap = await getDoc(getSettingsRef(userId));
  return snap.exists() ? (snap.data() as UserSettings) : null;
}

export async function saveSettings(userId: string, settings: UserSettings) {
  await setDoc(getSettingsRef(userId), settings);
}

// Seeding
export async function seedInitialData(userId: string, movements: Movement[], templates: Template[]) {
  const batch = writeBatch(db);
  
  movements.forEach(m => {
    const ref = doc(getMovementsRef(userId), m.id);
    batch.set(ref, m);
  });
  
  templates.forEach(t => {
    const ref = doc(getTemplatesRef(userId), t.id);
    batch.set(ref, t);
  });
  
  await batch.commit();
}
