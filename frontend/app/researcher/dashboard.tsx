// app/researcher/dashboard.tsx
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../lib/firebase";

interface InterestDoc {
  userId:    string;
  userEmail: string;                 // ← NEW
  trialId:   string;
  trial:     { title: string; researcher: { email: string } };
  timestamp: { toDate: () => Date };
}

export default function Dashboard() {
  const [interests, setInterests] = useState<InterestDoc[]>([]);

  // live subscription to every interest, then filter by my trials
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "interests"), snap => {
      const mine = snap.docs
        .map(d => d.data() as InterestDoc)
        .filter(int => int.trial.researcher.email === auth.currentUser?.email);
      setInterests(mine);
    });
    return unsub;
  }, []);

  if (!interests.length) {
    return <Text style={styles.empty}>No participants interested yet.</Text>;
  }

  return (
    <FlatList
      data={interests}
      keyExtractor={(it, idx) => `${it.userId}-${it.trialId}-${idx}`}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.trial.title}</Text>
          <Text>Participant email: {item.userEmail}</Text>
          <Text>
            Swiped at: {item.timestamp.toDate().toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  empty:     { flex: 1, textAlign: "center", marginTop: 50, color: "#555" },
  item:      { padding: 12, borderBottomWidth: 1, borderColor: "#ccc" },
  title:     { fontWeight: "bold", marginBottom: 4 },
});
