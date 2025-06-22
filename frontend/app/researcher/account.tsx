// app/(researcher)/account.tsx
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../../lib/firebase";

export default function ResearcherAccount() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Researcher:</Text>
      <Text style={styles.email}>{auth.currentUser?.email}</Text>
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

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center", padding:24, backgroundColor:"#f9f9fc" },
  title:     { textAlign:"center", marginBottom:8, color:"#555" },
  email:     { textAlign:"center", fontWeight:"bold", marginBottom:24 },
});
