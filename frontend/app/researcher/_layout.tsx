// app/(researcher)/_layout.tsx
import { Tabs } from "expo-router";
export default () => (
  <Tabs screenOptions={{ headerShown:false }}>
    <Tabs.Screen name="create-trial" options={{ title:"New Trial"   }} />
    <Tabs.Screen name="dashboard"    options={{ title:"Dashboard"  }} />
    <Tabs.Screen name="account" options={{ title:"Account"  }} />
  </Tabs>
);