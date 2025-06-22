// app/(participant)/_layout.tsx
import { LikedTrialsProvider } from "@/contexts/LikedTrialContext";
import { Tabs } from "expo-router";
export default () => (
  <LikedTrialsProvider>
  <Tabs screenOptions={{ headerShown:false }}>
    <Tabs.Screen name="home"      options={{ title:"Trials" }} />
    <Tabs.Screen name="saved"     options={{ title:"Saved"  }} />
    <Tabs.Screen name="profile"   options={{ title:"Profile"}} />
    <Tabs.Screen name="account" options={{ title:"Account"  }} />
  </Tabs>
  </LikedTrialsProvider>
);