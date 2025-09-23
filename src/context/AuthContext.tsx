'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Interfaces remain the same
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
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false); // <-- NEW state for the dialog
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Cleanup socket on component unmount
    return () => {
        if(socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }
  }, []);
  
  // Effect to manage the user's main socket connection
  useEffect(() => {
    if (user && !socketRef.current) {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
        socketRef.current = socket;

        // Identify this user to the socket server
        socket.emit('authenticate', user.id);

        // Listen for a force-logout command from the server
        socket.on('force-logout', (data) => {
            // --- MODIFICATION: Show dialog instead of alert ---
            setIsSuspendedModalOpen(true);
            logout(); // Still log the user out immediately to clear the session
        });

    } else if (!user && socketRef.current) {
        // If user logs out, disconnect the socket.
        socketRef.current.disconnect();
        socketRef.current = null;
    }
  }, [user]);

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
    router.push('/login');
  };

  const handleModalClose = () => {
    setIsSuspendedModalOpen(false);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}

      {/* --- NEW: Suspended Account Dialog --- */}
      <Dialog open={isSuspendedModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Account Suspended
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your account has been suspended by an administrator. You have been logged out. Please contact support for assistance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleModalClose}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}