// data/dummyTrials.ts
import { Trial } from "../components/TrialCard";

export const DUMMY_TRIALS: Trial[] = [
  {
    id: "1",
    title: "Type 2 Diabetes Oral Medication",
    description: "A 12-week randomized trial testing efficacy of a new oral medication for Type 2 Diabetes management.",
    aiRecommendation: "Based on your profile, you’re a strong match for this trial.",
    inclusion: ["Age 18–65", "Diagnosed with Type 2 Diabetes", "BMI 25–40"],
    exclusion: ["Pregnancy", "Heart Disease", "Insulin Therapy"],
    researcher: {
      name: "Dr. Jane Smith",
      email: "jane@research.org",
      phone: "555-1234",
    },
  },
  {
    id: "2",
    title: "Asthma Inhaler Study",
    description: "A 6-week open-label study for a novel asthma inhaler device to improve lung function.",
    aiRecommendation: "You meet all key inclusion criteria—consider joining!",
    inclusion: ["Age 12–60", "Mild to moderate asthma", "No smoking history"],
    exclusion: ["COPD", "Recent respiratory infection"],
    researcher: {
      name: "Dr. John Doe",
      email: "john@research.org",
      phone: "555-5678",
    },
  },
  // …etc
];
