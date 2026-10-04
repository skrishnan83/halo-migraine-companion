// QUICK LOG: record a migraine in a few taps. Saved to Firestore under the user.
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

const WHEN_OPTIONS = [
  { label: "Just now", minutesAgo: 0 },
  { label: "30 min ago", minutesAgo: 30 },
  { label: "1 hour ago", minutesAgo: 60 },
  { label: "2+ hours ago", minutesAgo: 120 },
];

const SYMPTOMS = [
  "Nausea",
  "Vomiting",
  "Light sensitivity",
  "Sound sensitivity",
  "Aura",
  "Neck pain",
];

export default function QuickLogScreen({ navigation }: ScreenProps<"QuickLog">) {
  const [severity, setSeverity] = useState<number | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleSymptom(name: string) {
    setSymptoms((current) =>
      current.includes(name) ? current.filter((s) => s !== name) : [...current, name]
    );
  }

  async function handleSave() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You need to be logged in.");
      return;
    }
    if (severity === null) {
      setError("Please choose how severe it is.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "attacks"), {
        severity,
        startedAt: Timestamp.fromMillis(Date.now() - minutesAgo * 60000),
        symptoms,
        note: note.trim(),
        status: "ongoing",
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (e) {
      console.warn("Save failed", e);
      setError("Couldn't save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>Log a migraine</Text>

          <Text style={styles.section}>How severe is it?</Text>
          <View style={styles.severityGrid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => setSeverity(n)}
                style={[styles.severityBtn, severity === n && styles.severityBtnOn]}
              >
                <Text style={[styles.severityText, severity === n && styles.severityTextOn]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.scaleRow}>
            <Text style={styles.scaleText}>Mild</Text>
            <Text style={styles.scaleText}>Worst ever</Text>
          </View>

          <Text style={styles.section}>When did it start?</Text>
          <View style={styles.chipRow}>
            {WHEN_OPTIONS.map((o) => (
              <Pressable
                key={o.label}
                onPress={() => setMinutesAgo(o.minutesAgo)}
                style={[styles.chip, minutesAgo === o.minutesAgo && styles.chipOn]}
              >
                <Text style={[styles.chipText, minutesAgo === o.minutesAgo && styles.chipTextOn]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>Any symptoms?</Text>
          <View style={styles.chipRow}>
            {SYMPTOMS.map((s) => {
              const on = symptoms.includes(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => toggleSymptom(s)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 20 }}>
            <FormField
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="Anything else worth remembering"
              multiline
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Save" onPress={handleSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginTop: 16 },
  section: { fontSize: 15, fontWeight: "600", color: colors.textDark, marginTop: 26, marginBottom: 12 },
  severityGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  severityBtn: {
    width: "18%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  severityBtnOn: { backgroundColor: colors.accent },
  severityText: { fontSize: 18, fontWeight: "600", color: colors.textDark },
  severityTextOn: { color: colors.white },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
  scaleText: { fontSize: 12, color: colors.muted },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 14.5, color: colors.textDark },
  chipTextOn: { color: colors.white },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
});