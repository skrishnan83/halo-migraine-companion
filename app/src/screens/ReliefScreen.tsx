// RELIEF ("How did it go?"): after an attack, rate what you took, how much it helped,
// and how long it took to ease. Saved on the phone first, then synced like logs.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Chip from "../components/Chip";
import FormField from "../components/FormField";
import type { ScreenProps } from "../navigation/types";
import { queueRelief, syncPending } from "../services/attackQueue";
import { auth, db } from "../services/firebase";
import { colors } from "../theme/colors";
import {
  EASE_OPTIONS,
  formatMinutes,
  NOTHING,
  RELIEF_LEVELS,
  type ReliefLevel,
} from "../utils/relief";
import { formatWhen } from "../utils/stats";

const medsKey = (uid: string) => `halo.meds.${uid}`;

export default function ReliefScreen({
  navigation,
  route,
}: ScreenProps<"Relief">) {
  const { attackId, severity, startedAtMs, relief } = route.params;
  const uid = auth.currentUser?.uid;
  const [meds, setMeds] = useState<string[]>([]);
  const [medication, setMedication] = useState(relief?.medication ?? "");
  const [other, setOther] = useState("");
  const [level, setLevel] = useState<ReliefLevel | null>(relief?.level ?? null);
  const [minutes, setMinutes] = useState<number | null>(
    relief?.minutesToRelief ?? null,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Your medications as choices: the saved copy first (works offline), then live.
  useEffect(() => {
    if (!uid) return;
    AsyncStorage.getItem(medsKey(uid))
      .then(
        (raw) => raw && setMeds((cur) => (cur.length ? cur : JSON.parse(raw))),
      )
      .catch(() => {});
    const q = query(
      collection(db, "users", uid, "medications"),
      orderBy("name"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const names = snap.docs.map((d) => {
          const m = d.data() as { name: string; dose?: string };
          return m.dose ? `${m.name} ${m.dose}` : m.name;
        });
        setMeds(names);
        AsyncStorage.setItem(medsKey(uid), JSON.stringify(names)).catch(
          () => {},
        );
      },
      (e) => console.warn("Could not load medications", e),
    );
  }, [uid]);

  // A rating made earlier with a medication that is no longer on the list.
  const choices = [...meds];
  if (medication && medication !== NOTHING && !choices.includes(medication)) {
    choices.push(medication);
  }

  async function handleSave() {
    if (!uid) return;
    const took = other.trim() || medication;
    if (!took) {
      setError("Please choose what you took, or Nothing.");
      return;
    }
    if (!level) {
      setError("Please choose how much relief you had.");
      return;
    }
    if (level !== "None" && minutes === null) {
      setError("Please choose when it eased.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await queueRelief(uid, attackId, {
        medication: took,
        level,
        minutesToRelief: level === "None" ? null : minutes,
        ratedAtMs: Date.now(),
      });
      syncPending(uid); // uploads in the background when there is internet
      navigation.goBack();
    } catch (e) {
      console.warn("Relief save failed", e);
      setError("Couldn't save on this phone. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>How did it go?</Text>
        <Text style={styles.sub}>
          {formatWhen(startedAtMs)} · Severity {severity}
        </Text>

        <Text style={styles.section}>What did you take?</Text>
        <View style={styles.row}>
          {[...choices, NOTHING].map((m) => (
            <Chip
              key={m}
              label={m}
              selected={!other.trim() && medication === m}
              onPress={() => {
                setMedication(m);
                setOther("");
              }}
            />
          ))}
        </View>
        <FormField
          label="Something else? (optional)"
          value={other}
          onChangeText={setOther}
          placeholder="e.g. Rest in a dark room"
        />

        <Text style={styles.section}>How much relief?</Text>
        <View style={styles.row}>
          {RELIEF_LEVELS.map((l) => (
            <Chip
              key={l}
              label={l}
              selected={level === l}
              onPress={() => setLevel(l)}
            />
          ))}
        </View>

        {level !== "None" ? (
          <>
            <Text style={styles.section}>When did it ease?</Text>
            <View style={styles.row}>
              {EASE_OPTIONS.map((o) => (
                <Chip
                  key={o.label}
                  label={o.label}
                  selected={minutes === o.minutes}
                  onPress={() => setMinutes(o.minutes)}
                />
              ))}
            </View>
          </>
        ) : null}

        {level && level !== "None" && minutes !== null ? (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              Time to relief: about {formatMinutes(minutes)}
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save" onPress={handleSave} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 16,
  },
  sub: { fontSize: 14.5, color: colors.muted, marginTop: 4 },
  section: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    marginTop: 24,
    marginBottom: 12,
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  result: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    alignItems: "center",
  },
  resultText: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  error: { color: colors.danger, fontSize: 14, marginTop: 12 },
});
