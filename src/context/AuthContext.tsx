"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User,
  signInWithRedirect
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { getMovements, seedInitialData } from '../lib/firestore';
import { DEFAULT_MOVEMENTS, INITIAL_TEMPLATES } from '../lib/seeding/defaults';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Check if we need to seed data
          const movements = await getMovements(user.uid);
          if (movements.length === 0) {
            console.log('Seeding initial data for new user...');
            await seedInitialData(user.uid, DEFAULT_MOVEMENTS, INITIAL_TEMPLATES);
          }
        }
      } catch (err: unknown) {
        console.error('Auth synchronization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: unknown) {
          setError(redirectError instanceof Error ? redirectError.message : String(redirectError));
        }
      } else if (typeof error === 'object' && error !== null && 'code' in error && error.code !== 'auth/cancelled-by-user') {
        setError(error instanceof Error ? error.message : 'Authentication failed');
        throw error;
      }
    }
  };

  const loginWithRedirect = async () => {
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginWithRedirect, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
