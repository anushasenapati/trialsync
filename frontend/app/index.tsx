// app/index.tsx
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"participant" | "researcher">("participant");
  const [user, setUser] = useState(auth.currentUser);

  // watch for Firebase auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // prepare Google OAuth
  const redirectUri = makeRedirectUri({ useProxy: true } as any);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:    "69557673469-50ssctd7gs7l0pvhrhldmn5t463tbesp.apps.googleusercontent.com",
    redirectUri,
    scopes:     ["profile", "email"],
  });

  // when Google auth completes, sign in & route
  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      const { idToken, accessToken } = response.authentication;
      const cred = GoogleAuthProvider.credential(idToken, accessToken);
      signInWithCredential(auth, cred).then(() => {
        if (role === "participant") {
          router.replace("/participant/home");
        } else {
          router.replace("/researcher/dashboard");
        }
      });
    }
  }, [response]);

  // if already signed in, show logout
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Logged in as:</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <Button
          title="Logout"
          color="#c00"
          onPress={async () => {
            await signOut(auth);
            router.replace("/");
          }}
        />
      </View>
    );
  }

  // otherwise show login form
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrialMatch</Text>
      <Text style={styles.subtitle}>Swipe into your next clinical trial</Text>

      <View style={styles.roleSwitch}>
        {(["participant", "researcher"] as const).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRole(r)}
            style={[
              styles.roleButton,
              role === r && styles.roleSelected,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                role === r && styles.roleTextSelected,
              ]}
            >
              {r[0].toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue with Google"
        onPress={() => promptAsync()}
        disabled={!request}
        color="#7c3aed"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, justifyContent:"center", padding:24, backgroundColor:"#f9f9fc" },
  title:          { fontSize:28, fontWeight:"bold", color:"#7c3aed", textAlign:"center", marginBottom:8 },
  subtitle:       { textAlign:"center", marginBottom:32, color:"#555" },
  roleSwitch:     { flexDirection:"row", justifyContent:"center", marginBottom:24 },
  roleButton:     { padding:8, paddingHorizontal:16, marginHorizontal:8, borderWidth:1, borderColor:"#ccc", borderRadius:20 },
  roleSelected:   { backgroundColor:"#7c3aed", borderColor:"#7c3aed" },
  roleText:       { color:"#333", fontWeight:"bold" },
  roleTextSelected:{ color:"#fff" },
});
