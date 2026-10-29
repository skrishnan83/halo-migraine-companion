// HOME: greeting, the main actions, and your recent attacks (works offline).
// Tap an attack to rate how it went.
import { signOut } from "firebase/auth";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import HaloLogo from "../components/HaloLogo";
import { useAttacks } from "../hooks/useAttacks";
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";
import { reliefSummary } from "../utils/relief";
import { formatWhen } from "../utils/stats";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({ navigation }: ScreenProps<"Home">) {
  const { items, online, waitingCount } = useAttacks(10);

  let statusText = "All synced";
  let statusColor = colors.sage;
  if (!online) {
    statusText = "Offline: logs are saved on this phone";
    statusColor = colors.accent;
  } else if (waitingCount > 0) {
    statusText = `${waitingCount} waiting to sync`;
    statusColor = colors.accent;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <HaloLogo size={36} />
        </View>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.title}>How are you feeling?</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Log a migraine"
          onPress={() => navigation.navigate("QuickLog")}
        />
        <View style={styles.pair}>
          <View style={styles.half}>
            <Button
              title="My medications"
              variant="secondary"
              onPress={() => navigation.navigate("Medications")}
            />
          </View>
          <View style={styles.half}>
            <Button
              title="History"
              variant="secondary"
              onPress={() => navigation.navigate("History")}
            />
          </View>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recent attacks</Text>
        <View style={styles.status}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={(a) => a.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No attacks logged yet. Tap "Log a migraine" when one starts.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("Relief", {
                attackId: item.id,
                severity: item.severity,
                startedAtMs: item.startedAtMs,
                relief: item.relief,
              })
            }
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.severity}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardWhen}>
                {formatWhen(item.startedAtMs)}
                {item.pending ? "  ·  Waiting to sync" : ""}
              </Text>
              <Text style={styles.cardSymptoms} numberOfLines={1}>
                {item.symptoms.length > 0
                  ? item.symptoms.join(", ")
                  : "No symptoms noted"}
              </Text>
              {item.relief ? (
                <Text style={styles.relief} numberOfLines={1}>
                  {reliefSummary(item.relief)}
                </Text>
              ) : (
                <Text style={styles.rate}>Tap to rate relief ›</Text>
              )}
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.email}>Signed in as {auth.currentUser?.email}</Text>
        <Pressable onPress={() => signOut(auth)} hitSlop={12}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 28 },
  hero: { alignItems: "center", marginTop: 24, marginBottom: 20 },
  logo: { alignSelf: "center" },
  greeting: { fontSize: 15, color: colors.muted, marginTop: 12 },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  actions: { marginBottom: 8 },
  pair: { flexDirection: "row", marginHorizontal: -5 },
  half: { flex: 1, marginHorizontal: 5 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 14,
  },
  section: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  status: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginLeft: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12.5, color: colors.muted, flexShrink: 1 },
  list: { flex: 1 },
  emptyCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },
  emptyText: {
    fontSize: 14.5,
    color: colors.muted,
    lineHeight: 21,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 17, fontWeight: "700" },
  cardBody: { marginLeft: 14, flex: 1 },
  cardWhen: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  cardSymptoms: { fontSize: 13.5, color: colors.muted, marginTop: 3 },
  relief: {
    fontSize: 13.5,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 3,
  },
  rate: {
    fontSize: 13.5,
    color: colors.accent,
    fontWeight: "600",
    marginTop: 3,
  },
  footer: { alignItems: "center", paddingTop: 12, paddingBottom: 16 },
  email: { fontSize: 12.5, color: colors.muted, marginBottom: 8 },
  logoutText: { fontSize: 15, fontWeight: "600", color: colors.primary },
});
