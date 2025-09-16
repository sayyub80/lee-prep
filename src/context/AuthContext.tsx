'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  role: 'user' | 'admin';
  referredBy?: string;
  isAcceptedTerms: boolean; 
  level?: string; 
  referralCode: string;
  referrals: string[];
  streak: number;
  subscription: {
    plan: 'free' | 'pro';
    startDate: Date;
    endDate: Date;
  };
  dailyProgress: {
    completed: number;
    goal: number;
  };
  speakingTimeMinutes: number;
  accuracy: number;
  achievements: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          // Fix: Ensure user has a name; if not, derive from email
          if (!data.user.name || data.user.name.trim() === '') {
            data.user.name = data.user.email.split('@')[0];
          }
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Apply the same name-fix logic on login
        if (data.user && (!data.user.name || data.user.name.trim() === '')) {
            data.user.name = data.user.email.split('@')[0];
        }
        setUser(data.user);
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout,setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}