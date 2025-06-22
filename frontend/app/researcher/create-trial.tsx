// app/create-trial.tsx
import { useRouter } from "expo-router";
import {
  addDoc,
  collection
} from "firebase/firestore";
import {
  useState,
} from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { auth, db } from "../../lib/firebase";

export default function CreateTrialScreen() {
  const router = useRouter();
  const [title, setTitle]         = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return Alert.alert("Please fill out both fields.");
    }
    try {
      await addDoc(collection(db, "trials"), {
        title,
        description,
        aiRecommendation: "Patients will be matched to this trial.",
        inclusion: [],
        exclusion: [],
        researcher: {
          name:  auth.currentUser?.displayName || "Dr. Researcher",
          email: auth.currentUser?.email       || "",
        },
      });
      Alert.alert("Published!", `"${title}" is now live.`);
      // stay in researcher land, or navigate to their home tab:
      router.replace("/researcher/dashboard"); 
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not publish trial.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Clinical Trial</Text>
      <TextInput
        style={styles.input}
        placeholder="Trial Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Publish Trial" onPress={handleSubmit} color="#7c3aed" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#f9f9fc" },
  title:     { fontSize: 22, fontWeight: "bold", color: "#7c3aed", marginBottom: 16, textAlign: "center" },
  input:     { backgroundColor: "#fff", borderColor: "#ccc", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
});
