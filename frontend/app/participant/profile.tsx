// app/(tabs)/profile.tsx
import { Picker } from "@react-native-picker/picker";
import {
  useFocusEffect,
  useRouter
} from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../lib/firebase";

const CONDITION_OPTIONS = [
  "Type 2 Diabetes",
  "Asthma",
  "Hypertension",
  "Cancer",
  "Arthritis",
  "Other",
];

export default function ProfileScreen() {
  const router = useRouter();

  // ─ Auth and profile loading state ───────────────────────────
  const [user, setUser]               = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile]         = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ─ Edit vs View mode ──────────────────────────────────────────
  const [editing, setEditing] = useState(false);

  // ─ Form fields ───────────────────────────────────────────────
  const [age, setAge]                       = useState("");
  const [gender, setGender]                 = useState("");
  const [condition, setCondition]           = useState("");
  const [smokingStatus, setSmokingStatus]   = useState("");
  const [currentMedication, setCurrentMedication] = useState("");
  const [conditionSeverity, setConditionSeverity] = useState("");
  const [location, setLocation]             = useState("");
  const [interventionType, setInterventionType] = useState("");
  const [biomarkers, setBiomarkers]         = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [otherMedications, setOtherMedications] = useState("");

  // 1️⃣ Watch Firebase auth
  useFocusEffect(
    useCallback(() => {
      const unsub = onAuthStateChanged(auth, u => {
        setUser(u);
        setLoadingAuth(false);
      });
      return unsub;
    }, [])
  );

  // 2️⃣ On focus, load profile doc
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoadingProfile(true);
      getDoc(doc(db, "profiles", user.uid))
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            // populate form fields for editing
            setAge(String(data.age));
            setGender(data.gender);
            setCondition(data.condition);
            setSmokingStatus(data.smokingStatus);
            setCurrentMedication(data.currentMedication);
            setConditionSeverity(data.conditionSeverity);
            setLocation(data.location);
            setInterventionType(data.interventionType);
            setBiomarkers(data.biomarkers);
            setMedicalHistory(data.medicalHistory);
            setOtherMedications(data.otherMedications);
            setEditing(false);
          } else {
            // no profile yet → go straight to edit mode
            setEditing(true);
          }
        })
        .catch(e => {
          console.error(e);
          Alert.alert("Error", "Could not load profile.");
        })
        .finally(() => setLoadingProfile(false));
    }, [user])
  );

  // 3️⃣ Redirect to login if signed out
  useFocusEffect(
    useCallback(() => {
      if (!loadingAuth && !user) {
        router.replace("/");
      }
    }, [loadingAuth, user])
  );

  // 4️⃣ Save handler
  const handleSave = async () => {
    if (
      !age ||
      !gender ||
      !condition ||
      !smokingStatus ||
      !currentMedication ||
      !conditionSeverity.trim() ||
      !location.trim() ||
      !interventionType.trim() ||
      !biomarkers.trim() ||
      !medicalHistory.trim() ||
      !otherMedications.trim()
    ) {
      return Alert.alert("Please fill out all fields.");
    }
    try {
      await setDoc(doc(db, "profiles", user!.uid), {
        age: Number(age),
        gender,
        condition,
        smokingStatus,
        currentMedication,
        conditionSeverity,
        location,
        interventionType,
        biomarkers,
        medicalHistory,
        otherMedications,
        updatedAt: new Date(),
      });
      setEditing(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  // 5️⃣ Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  // ─── Loading spinners ─────────────────────────────────────────
  if (loadingAuth || loadingProfile) {
    return <ActivityIndicator style={styles.loader} size="large" color="#7c3aed" />;
  }
  if (!user) {
    return null; // redirecting…
  }

  // ─── VIEW MODE ────────────────────────────────────────────────
  if (!editing && profile) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Your Profile</Text>

        <ProfileField label="Name" value={user.displayName!} />
        <ProfileField label="Email" value={user.email!} />
        <ProfileField label="Age"   value={String(profile.age)} />
        <ProfileField label="Gender" value={profile.gender} />
        <ProfileField label="Condition" value={profile.condition} />
        <ProfileField label="Smoking" value={profile.smokingStatus} />
        <ProfileField label="Medication?" value={profile.currentMedication} />
        <ProfileField label="Severity" value={profile.conditionSeverity} />
        <ProfileField label="Location" value={profile.location} />
        <ProfileField label="Intervention" value={profile.interventionType} />
        <ProfileField label="Biomarkers" value={profile.biomarkers} />
        <ProfileField label="History" value={profile.medicalHistory} />
        <ProfileField label="Other Meds" value={profile.otherMedications} />

        <View style={{ marginTop: 24 }}>
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Button title="Logout" color="#c00" onPress={handleLogout} />
        </View>
      </ScrollView>
    );
  }

  // ─── EDIT MODE ────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{profile ? "Edit Profile" : "Create Profile"}</Text>

      {/* age picker */}
      <Text style={styles.label}>Age</Text>
      <Picker style={styles.picker} selectedValue={age} onValueChange={setAge}>
        <Picker.Item label="Select age" value="" />
        {Array.from({ length: 83 }, (_, i) => 18 + i).map(a => (
          <Picker.Item key={a} label={`${a}`} value={`${a}`} />
        ))}
      </Picker>

      {/* gender */}
      <Text style={styles.label}>Gender</Text>
      <Picker style={styles.picker} selectedValue={gender} onValueChange={setGender}>
        <Picker.Item label="Select gender" value="" />
        <Picker.Item label="Male"   value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Other"  value="Other" />
      </Picker>

      {/* condition */}
      <Text style={styles.label}>Condition</Text>
      <Picker style={styles.picker} selectedValue={condition} onValueChange={setCondition}>
        <Picker.Item label="Select condition" value="" />
        {CONDITION_OPTIONS.map(c => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>

      {/* smoking */}
      <Text style={styles.label}>Smoking Status</Text>
      <Picker style={styles.picker} selectedValue={smokingStatus} onValueChange={setSmokingStatus}>
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No"  value="No" />
      </Picker>

      {/* medication */}
      <Text style={styles.label}>On Medication?</Text>
      <Picker style={styles.picker} selectedValue={currentMedication} onValueChange={setCurrentMedication}>
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No"  value="No" />
      </Picker>

      {/* text inputs */}
      <Text style={styles.label}>Severity</Text>
      <TextInput
        style={styles.input}
        placeholder="Mild / Moderate / Severe"
        value={conditionSeverity}
        onChangeText={setConditionSeverity}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="City, State or ZIP"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Intervention Type</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Inhaler, Insulin pump"
        value={interventionType}
        onChangeText={setInterventionType}
      />

      <Text style={styles.label}>Biomarkers</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. HbA1c, FEV1"
        value={biomarkers}
        onChangeText={setBiomarkers}
      />

      <Text style={styles.label}>Medical History</Text>
      <TextInput
        style={styles.input}
        placeholder="Past surgeries, etc."
        value={medicalHistory}
        onChangeText={setMedicalHistory}
      />

      <Text style={styles.label}>Other Medications</Text>
      <TextInput
        style={styles.input}
        placeholder="List other meds"
        value={otherMedications}
        onChangeText={setOtherMedications}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Save Profile" onPress={handleSave} color="#7c3aed" />
      </View>
    </ScrollView>
  );
}

// small helper component
function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  loader:        { flex: 1, justifyContent: "center", alignItems: "center" },
  container:     { padding: 24, backgroundColor: "#f9f9fc" },
  header:        { fontSize: 22, fontWeight: "bold", color: "#7c3aed", marginBottom: 24, textAlign: "center" },
  label:         { marginTop: 16, marginBottom: 8, fontWeight: "600", color: "#333" },
  picker:        { backgroundColor: "#fff", borderColor: "#ccc", borderWidth: 1, borderRadius: 8, marginBottom: 16, height: 50 },
  input:         { backgroundColor: "#fff", borderColor: "#ccc", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  fieldLabel:    { marginTop: 16, fontWeight: "600", color: "#555" },
  fieldValue:    { marginTop: 4, fontSize: 16, fontWeight: "bold", color: "#000" },
});
