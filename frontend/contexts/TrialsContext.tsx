// contexts/TrialsContext.tsx
import {
    addDoc,
    collection,
    DocumentData,
    onSnapshot,
    QuerySnapshot,
} from "firebase/firestore";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { DUMMY_TRIALS } from "../data/dummyTrials";
import { db } from "../lib/firebase";

export interface Trial {
  id: string;
  title: string;
  description: string;
  aiRecommendation: string;
  inclusion: string[];
  exclusion: string[];
  researcher: { name: string; email: string; phone?: string };
}

export const TrialsContext = createContext<{
  trials: Trial[];
  addTrial: (t: Omit<Trial, "id">) => Promise<void>;
}>({
  trials: [],
  addTrial: async () => {},
});

export function TrialsProvider({ children }: { children: ReactNode }) {
  const [trials, setTrials] = useState<Trial[]>(DUMMY_TRIALS);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "trials"),
      (snap: QuerySnapshot<DocumentData>) => {
        if (snap.empty) {
          // If no real trials, stick with dummy
          setTrials(DUMMY_TRIALS);
        } else {
          const real: Trial[] = snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              title: d.title,
              description: d.description,
              aiRecommendation: d.aiRecommendation,
              inclusion: d.inclusion as string[],
              exclusion: d.exclusion as string[],
              researcher: d.researcher as { name: string; email: string; phone?: string },
            };
          });
          // Merge dummy + real
          setTrials([...DUMMY_TRIALS, ...real]);
        }
      }
    );
    return unsubscribe;
  }, []);

  const addTrial = async (t: Omit<Trial, "id">) => {
    // Just push the trial data—no timestamp
    await addDoc(collection(db, "trials"), t);
  };

  return (
    <TrialsContext.Provider value={{ trials, addTrial }}>
      {children}
    </TrialsContext.Provider>
  );
}
