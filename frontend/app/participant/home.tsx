// app/participant/home.tsx
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import Swiper from "react-native-deck-swiper";

import TrialCard from "../../components/TrialCard";
import { Trial as LikedTrial, LikedTrialsContext } from "../../contexts/LikedTrialContext";
import { TrialsContext, Trial as TrialsTrial } from "../../contexts/TrialsContext";
import { DUMMY_TRIALS } from "../../data/dummyTrials";
import { auth, db } from "../../lib/firebase";

export default function ParticipantHome() {
  const { trials }   = useContext(TrialsContext);
  const { addTrial } = useContext(LikedTrialsContext);

  const cards: TrialsTrial[] = [
    ...DUMMY_TRIALS,
   ...trials.filter(t => !DUMMY_TRIALS.some(d => d.id === t.id)),
  ];

  if (cards.length === 0) {
    return <Text style={styles.empty}>No trials available.</Text>;
  }

  const handleSwipeRight = async (index: number) => {
    const card = cards[index];

    // ① in-memory save (participant’s Saved tab)
    const liked: LikedTrial = { ...card, researcher: { ...card.researcher } };
    addTrial(liked);

    // ② persist so researchers can see it
    await addDoc(collection(db, "interests"), {
      userId:    auth.currentUser!.uid,
      userEmail: auth.currentUser!.email, 
      trialId:   card.id,
      trial:     card,
      timestamp: serverTimestamp(),
    });

    console.log("Interested:", card.title);
  };

  return (
    <View style={styles.container}>
      <Swiper<TrialsTrial>
        cards={cards}
        renderCard={(card: TrialsTrial) => <TrialCard trial={card} />}
        onSwipedLeft={(i: number) => console.log("Skipped:", cards[i].title)}
        onSwipedRight={handleSwipeRight}
        cardIndex={0}
        stackSize={3}
        backgroundColor="transparent"
        animateCardOpacity
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9fc", paddingTop: 50 },
  empty:     { marginTop: 50, textAlign: "center", color: "#555" },
});
