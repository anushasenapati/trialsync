// contexts/LikedTrialsContext.tsx
import React, { createContext, ReactNode, useState } from "react";

export interface Trial {
  id: string;
  title: string;
  description: string;
  aiRecommendation: string;
  inclusion: string[];
  exclusion: string[];
  researcher: { name: string; email: string; phone?: string };
}

interface LikedTrialsContextType {
  likedTrials: Trial[];
  addTrial: (trial: Trial) => void;
}

export const LikedTrialsContext = createContext<LikedTrialsContextType>({
  likedTrials: [],
  addTrial:    () => {},
});

export function LikedTrialsProvider({ children }: { children: ReactNode }) {
  const [likedTrials, setLikedTrials] = useState<Trial[]>([]);
  const addTrial = (trial: Trial) => setLikedTrials((prev) => [...prev, trial]);

  return (
    <LikedTrialsContext.Provider value={{ likedTrials, addTrial }}>
      {children}
    </LikedTrialsContext.Provider>
  );
}
