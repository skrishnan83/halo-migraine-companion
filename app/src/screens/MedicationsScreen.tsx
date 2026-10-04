// MEDICATIONS: your personal list of medications. Add one, tap Remove to delete one.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import FormField from "../components/FormField";
import type { ScreenProps } from "../navigation/types";
import { auth, db } from "../services/firebase";
import { colors } from "../theme/colors";

type Medication = { id: string; name: string; dose: string };

export default function MedicationsScreen({ navigation }: ScreenProps<"Medications">) {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Listens to Firestore, so the list updates by itself.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, "users", uid, "medications"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMeds(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Medication, "id">) }))
        );
      },
      (e) => console.warn("Could not load medications", e)
    );
    return unsubscribe;
  }, []);

  async function handleAdd() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!name.trim()) {
      setError("Please enter the medication's name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "medications"), {
        name: name.trim(),
        dose: dose.trim(),
        createdAt: serverTimestamp(),
      });
      setName("");
      setDose("");
    } catch (e) {
      console.warn("Save failed", e);
      setError("Couldn't save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(med: Medication) {
    Alert.alert("Remove medication?", `${med.name} will be removed from your list.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const uid = auth.currentUser?.uid;
          if (uid) deleteDoc(doc(db, "users", uid, "medications", med.id));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={meds}
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <View>
              <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                <Text style={styles.back}>‹ Back</Text>
              </Pressable>
              <Text style={styles.title}>My medications</Text>

              <View style={styles.form}>
                <FormField
                  label="Medication name"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sumatriptan"
                />
                <FormField
                  label="Usual dose (optional)"
                  value={dose}
                  onChangeText={setDose}
                  placeholder="e.g. 50 mg"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Add medication" onPress={handleAdd} loading={saving} />
              </View>

              <Text style={styles.section}>Your list</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nothing here yet. Add the medications you take for migraines.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.dose ? <Text style={styles.cardDose}>{item.dose}</Text> : null}
              </View>
              <Pressable onPress={() => confirmRemove(item)} hitSlop={10}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginTop: 16, marginBottom: 20 },
  form: { marginBottom: 8 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
  section: { fontSize: 15, fontWeight: "600", color: colors.textDark, marginTop: 28, marginBottom: 12 },
  empty: { fontSize: 14.5, color: colors.muted, lineHeight: 21 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: colors.textDark },
  cardDose: { fontSize: 13.5, color: colors.muted, marginTop: 3 },
  remove: { fontSize: 14, color: colors.danger, fontWeight: "600" },
});