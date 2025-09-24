'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Challenge {
  _id: string;
  topic: string;
  reward: number;
  timeLimit: number;
}

interface ChallengeContextType {
  dailyChallenge: Challenge | null;
  isLoadingChallenge: boolean;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

  useEffect(() => {
    // This effect runs only once when the application loads
    const fetchChallenge = async () => {
      try {
        const res = await fetch('/api/challenges/today');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDailyChallenge(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch today's challenge for context:", error);
        setDailyChallenge(null);
      } finally {
        setIsLoadingChallenge(false);
      }
    };

    fetchChallenge();
  }, []); // Empty dependency array ensures this runs only once

  const value = { dailyChallenge, isLoadingChallenge };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
}