'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, ApiError } from './api';
import { User, Gym } from './types';

interface AuthContextType {
  user: User | null;
  gym: Gym | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGymActive: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshGymStatus: () => Promise<void>;
  clearSession: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isGymActive = !!gym?.is_active;

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.signIn({ email, password });
      
      if (response.success && response.user && response.gym) {
        setUser(response.user);
        setGym(response.gym);
        
        // Store session data based on rememberMe preference
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('forma_user', JSON.stringify(response.user));
        storage.setItem('forma_gym', JSON.stringify(response.gym));
        storage.setItem('forma_remember_me', rememberMe.toString());
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await authApi.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setGym(null);
      // Clear from both storages
      localStorage.removeItem('forma_user');
      localStorage.removeItem('forma_gym');
      localStorage.removeItem('forma_remember_me');
      sessionStorage.removeItem('forma_user');
      sessionStorage.removeItem('forma_gym');
      sessionStorage.removeItem('forma_remember_me');
      setIsLoading(false);
    }
  };

  const refreshGymStatus = async () => {
    if (!gym) return;
    
    try {
      // Simply update the gym status to active in the appropriate storage
      const updatedGym = { ...gym, is_active: true };
      setGym(updatedGym);
      
      // Check which storage is being used
      const hasLocalStorage = localStorage.getItem('forma_gym') !== null;
      const storage = hasLocalStorage ? localStorage : sessionStorage;
      storage.setItem('forma_gym', JSON.stringify(updatedGym));
      console.log('✅ Gym status refreshed to active');
    } catch (error) {
      console.error('Error refreshing gym status:', error);
    }
  };

  const clearSession = () => {
    setUser(null);
    setGym(null);
    // Clear from both storages
    localStorage.removeItem('forma_user');
    localStorage.removeItem('forma_gym');
    localStorage.removeItem('forma_remember_me');
    sessionStorage.removeItem('forma_user');
    sessionStorage.removeItem('forma_gym');
    sessionStorage.removeItem('forma_remember_me');
    console.log('🗑️ Session cleared manually');
  };

  // Load persisted data on app startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first (rememberMe = true)
      let storedUser = localStorage.getItem('forma_user');
      let storedGym = localStorage.getItem('forma_gym');
      let storageType = 'localStorage';
      
      // If not found in localStorage, check sessionStorage
      if (!storedUser || !storedGym) {
        storedUser = sessionStorage.getItem('forma_user');
        storedGym = sessionStorage.getItem('forma_gym');
        storageType = 'sessionStorage';
      }
      
      if (storedUser && storedGym) {
        try {
          const userData = JSON.parse(storedUser);
          const gymData = JSON.parse(storedGym);
          setUser(userData);
          setGym(gymData);
          console.log(`✅ Loaded existing auth data from ${storageType}`);
        } catch (err) {
          console.error('Error parsing stored auth data:', err);
          // Clear corrupted data from both storages
          localStorage.removeItem('forma_user');
          localStorage.removeItem('forma_gym');
          localStorage.removeItem('forma_remember_me');
          sessionStorage.removeItem('forma_user');
          sessionStorage.removeItem('forma_gym');
          sessionStorage.removeItem('forma_remember_me');
        }
      } else {
        console.log('ℹ️ No auth data found in any storage');
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    gym,
    isLoading,
    isAuthenticated,
    isGymActive,
    signIn,
    signOut,
    refreshGymStatus,
    clearSession,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
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