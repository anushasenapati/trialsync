// app/(participant)/saved.tsx
import React, { useContext } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import TrialCard from "../../components/TrialCard";
import { LikedTrialsContext } from "../../contexts/LikedTrialContext";

export default function Saved() {
  const { likedTrials } = useContext(LikedTrialsContext);

  if (likedTrials.length === 0) {
    return <Text style={styles.empty}>No saved trials yet.</Text>;
  }

  return (
    <FlatList
      data={likedTrials}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <TrialCard trial={item} showContact />}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  empty:     { flex: 1, textAlign: "center", marginTop: 50, color: "#555" },
});
