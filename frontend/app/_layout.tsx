// app/_layout.tsx
import { Slot } from "expo-router";
import { TrialsProvider } from "../contexts/TrialsContext";

export default function RootLayout() {
  return (
    <TrialsProvider>
=        <Slot />
    </TrialsProvider>
  );
}
