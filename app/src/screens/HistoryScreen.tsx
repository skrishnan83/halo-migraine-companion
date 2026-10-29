// HISTORY AND TRENDS: your attacks over time, what helps, and a PDF report for your doctor.
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { useAttacks } from "../hooks/useAttacks";
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { shareReport } from "../services/report";
import { colors } from "../theme/colors";
import { formatMinutes, reliefSummary } from "../utils/relief";
import {
  formatWhen,
  inRange,
  oneDecimal,
  RANGES,
  summarise,
  weeklyCounts,
} from "../utils/stats";

export default function HistoryScreen({ navigation }: ScreenProps<"History">) {
  const { items } = useAttacks(500);
  const [range, setRange] = useState(RANGES[0]);
  const [sharing, setSharing] = useState(false);

  const shown = inRange(items, range.days);
  const s = summarise(shown);
  const weeks = weeklyCounts(items);
  const tallest = Math.max(1, ...weeks.map((w) => w.count));

  async function handleShare() {
    if (shown.length === 0) {
      Alert.alert(
        "Nothing to share yet",
        "Log a migraine first, then make a report.",
      );
      return;
    }
    setSharing(true);
    try {
      await shareReport(
        shown,
        `Last ${range.label}`.replace("Last All", "All attacks"),
        auth.currentUser?.email ?? "",
      );
    } catch (e) {
      console.warn("Report failed", e);
      Alert.alert("Couldn't make the report", "Please try again.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>History and trends</Text>

        <View style={styles.row}>
          {RANGES.map((r) => (
            <Chip
              key={r.label}
              label={r.label}
              selected={range.label === r.label}
              onPress={() => setRange(r)}
            />
          ))}
        </View>

        <View style={styles.tiles}>
          <Tile value={String(s.count)} label="Attacks" />
          <Tile
            value={oneDecimal(s.averageSeverity)}
            label="Average severity"
          />
          <Tile
            value={s.rated ? `${s.goodRelief} of ${s.rated}` : "—"}
            label="Rated with good relief"
          />
          <Tile
            value={formatMinutes(s.averageMinutes)}
            label="Average time to relief"
          />
        </View>

        <Text style={styles.section}>Attacks per week</Text>
        <View style={styles.chart}>
          {weeks.map((w) => (
            <View key={w.label} style={styles.barCol}>
              <Text style={styles.barCount}>{w.count || ""}</Text>
              <View
                style={[
                  styles.bar,
                  { height: 6 + (w.count / tallest) * 90 },
                  w.count === 0 && styles.barEmpty,
                ]}
              />
              <Text style={styles.barLabel}>{w.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>What helps</Text>
        {s.medications.length ? (
          s.medications.map((m) => (
            <View key={m.medication} style={styles.medRow}>
              <View style={styles.flex}>
                <Text style={styles.medName}>{m.medication}</Text>
                <Text style={styles.medSub}>
                  Used {m.uses} {m.uses === 1 ? "time" : "times"} · relief in
                  about {formatMinutes(m.averageMinutes)}
                </Text>
              </View>
              <Text
                style={[
                  styles.verdict,
                  m.averageScore >= 2
                    ? styles.good
                    : m.averageScore >= 1
                      ? styles.some
                      : styles.little,
                ]}
              >
                {m.verdict}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            Rate how your attacks went (tap one on Home) to see what helps.
          </Text>
        )}

        <Text style={styles.section}>Most common symptoms</Text>
        <Text style={styles.empty}>
          {s.topSymptoms.length
            ? s.topSymptoms.map((t) => `${t.name} (${t.count})`).join(", ")
            : "None recorded yet."}
        </Text>

        <Button
          title="Share PDF report for my doctor"
          onPress={handleShare}
          loading={sharing}
        />

        <Text style={styles.section}>All attacks</Text>
        {shown.map((a) => (
          <Pressable
            key={a.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("Relief", {
                attackId: a.id,
                severity: a.severity,
                startedAtMs: a.startedAtMs,
                relief: a.relief,
              })
            }
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{a.severity}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardWhen}>{formatWhen(a.startedAtMs)}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {a.relief ? reliefSummary(a.relief) : "Not rated yet"}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  flex: { flex: 1 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 16,
    marginBottom: 16,
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 8,
  },
  tile: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 14,
    margin: 5,
  },
  tileValue: { fontSize: 22, fontWeight: "700", color: colors.primary },
  tileLabel: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  section: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    marginTop: 26,
    marginBottom: 12,
  },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 140 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barCount: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  bar: { width: 18, borderRadius: 6, backgroundColor: colors.accent },
  barEmpty: { backgroundColor: colors.secondaryLight },
  barLabel: { fontSize: 10, color: colors.muted, marginTop: 4 },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  medName: { fontSize: 15.5, fontWeight: "600", color: colors.textDark },
  medSub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  verdict: { fontSize: 13, fontWeight: "700", marginLeft: 10 },
  good: { color: "#2F7D5B" },
  some: { color: colors.accent },
  little: { color: colors.danger },
  empty: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  cardWhen: { fontSize: 14.5, fontWeight: "600", color: colors.textDark },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
