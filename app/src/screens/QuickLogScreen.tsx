// QUICK LOG: record a migraine in a few taps (or by voice). Saved to Firestore under the user.
import { Ionicons } from "@expo/vector-icons";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { transcribeAudio } from "../services/transcribe";
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

type VoiceState = "idle" | "recording" | "transcribing";

export default function QuickLogScreen({ navigation }: ScreenProps<"QuickLog">) {
  const [severity, setSeverity] = useState<number | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [voice, setVoice] = useState<VoiceState>("idle");

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const scrollRef = useRef<ScrollView>(null);

  function toggleSymptom(name: string) {
    setSymptoms((current) =>
      current.includes(name) ? current.filter((s) => s !== name) : [...current, name]
    );
  }

  async function startVoice() {
    setError("");
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone access is off. Turn it on for Expo Go in your phone's Settings.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setVoice("recording");
    } catch (e) {
      console.warn("Could not start recording", e);
      setError("Couldn't start recording. Please try again.");
      setVoice("idle");
    }
  }

  async function stopVoice() {
    setVoice("transcribing");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("No recording was made");
      const text = await transcribeAudio(uri);
      if (text) {
        setNote((current) => (current ? `${current} ${text}` : text));
      } else {
        setError("Didn't catch that. Please try again.");
      }
    } catch (e) {
      console.warn("Voice entry failed", e);
      setError("Couldn't turn your voice into text. Check your connection and try again.");
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      setVoice("idle");
    }
  }

  async function handleSave() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You need to be logged in.");
      return;
    }
    if (severity === null) {
      setError("Please choose how severe it is.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
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
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={styles.section}>Add a note by voice</Text>
          <Pressable
            onPress={voice === "recording" ? stopVoice : startVoice}
            disabled={voice === "transcribing"}
            style={[styles.micBtn, voice === "recording" && styles.micBtnOn]}
          >
            {voice === "transcribing" ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons
                name={voice === "recording" ? "stop-circle-outline" : "mic-outline"}
                size={22}
                color={voice === "recording" ? colors.white : colors.primary}
              />
            )}
            <Text style={[styles.micText, voice === "recording" && styles.micTextOn]}>
              {voice === "idle" && "Tap to speak"}
              {voice === "recording" && "Listening... tap to stop"}
              {voice === "transcribing" && "Turning your voice into text..."}
            </Text>
          </Pressable>
          <Text style={styles.privacy}>
            Your voice is sent to a speech service to be turned into text. The recording isn't
            saved to your Halo account.
          </Text>

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
    height: 52,
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
  micBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  micBtnOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  micText: { fontSize: 15.5, fontWeight: "600", color: colors.primary, marginLeft: 10 },
  micTextOn: { color: colors.white },
  privacy: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 8 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
});