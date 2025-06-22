// components/TrialCard.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export interface Trial {
  id: string;
  title: string;
  description: string;
  aiRecommendation: string;
  inclusion: string[];
  exclusion: string[];
  researcher: { name: string; email: string; phone?: string };
}

export default function TrialCard({
  trial,
  showContact = false,
}: {
  trial: Trial;
  showContact?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trial.title}</Text>
      <ScrollView style={styles.scroll}>
        <Text style={styles.section}>📝 Description</Text>
        <Text style={styles.text}>{trial.description}</Text>

        <Text style={styles.section}>🤖 AI Recommendation</Text>
        <Text style={styles.text}>{trial.aiRecommendation}</Text>

        <Text style={styles.section}>✅ Inclusion</Text>
        {trial.inclusion.map((i, idx) => (
          <Text key={idx} style={styles.text}>• {i}</Text>
        ))}

        <Text style={styles.section}>❌ Exclusion</Text>
        {trial.exclusion.map((e, idx) => (
          <Text key={idx} style={styles.text}>• {e}</Text>
        ))}

        {showContact && (
          <>
            <Text style={styles.section}>👤 Researcher Contact</Text>
            <Text style={styles.text}>{trial.researcher.name}</Text>
            <Text style={styles.text}>{trial.researcher.email}</Text>
            {trial.researcher.phone && (
              <Text style={styles.text}>{trial.researcher.phone}</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  scroll: { marginTop: 10 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    textAlign: 'center',
  },
  section: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  text: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
