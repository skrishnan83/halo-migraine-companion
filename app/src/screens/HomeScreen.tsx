// HOME: greeting, the main actions, and your recent attacks (works offline).
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { signOut } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import type { ScreenProps } from "../navigation/types";
import {
  getPending,
  onPendingChange,
  syncPending,
  type PendingAttack,
} from "../services/attackQueue";
import { auth, db } from "../services/firebase";
import { colors } from "../theme/colors";

type AttackItem = {
  id: string;
  severity: number;
  startedAtMs: number;
  symptoms: string[];
  pending: boolean;
};

const cacheKey = (uid: string) => `halo.cache.${uid}`;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// "Today, 11:51 AM", "Yesterday, 9:30 PM", or "Oct 2, 4:15 PM"
function formatWhen(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export default function HomeScreen({ navigation }: ScreenProps<"Home">) {
  const uid = auth.currentUser?.uid;
  const [remote, setRemote] = useState<AttackItem[]>([]);
  const [pending, setPending] = useState<PendingAttack[]>([]);
  const [online, setOnline] = useState(true);

  // 1. Show the last saved list straight away, even with no internet.
  useEffect(() => {
    if (!uid) return;
    AsyncStorage.getItem(cacheKey(uid))
      .then((raw) => {
        if (raw) setRemote((current) => (current.length ? current : JSON.parse(raw)));
      })
      .catch(() => {});
  }, [uid]);

  // 2. Live updates from the cloud.
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "attacks"),
      orderBy("startedAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Offline and nothing cached by Firebase: keep showing the saved list.
        if (snapshot.metadata.fromCache && snapshot.empty) return;
        const items: AttackItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            severity: data.severity,
            startedAtMs: data.startedAt.toMillis(),
            symptoms: data.symptoms ?? [],
            pending: false,
          };
        });
        setRemote(items);
        if (!snapshot.metadata.fromCache) {
          AsyncStorage.setItem(cacheKey(uid), JSON.stringify(items)).catch(() => {});
        }
      },
      (e) => console.warn("Could not load attacks", e)
    );
    return unsubscribe;
  }, [uid]);

  // 3. Logs waiting to upload, plus sync whenever the internet comes back.
  const loadPending = useCallback(() => {
    if (uid) getPending(uid).then(setPending);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    loadPending();
    const stopListening = onPendingChange(loadPending);
    syncPending(uid);
    const stopNet = NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected && state.isInternetReachable !== false;
      setOnline(isOnline);
      if (isOnline) syncPending(uid);
    });
    return () => {
      stopListening();
      stopNet();
    };
  }, [uid, loadPending]);

  // Cloud logs + waiting logs, newest first.
  const items = useMemo(() => {
    const cloudIds = new Set(remote.map((r) => r.id));
    const waiting: AttackItem[] = pending
      .filter((p) => !cloudIds.has(p.id))
      .map((p) => ({
        id: p.id,
        severity: p.severity,
        startedAtMs: p.startedAtMs,
        symptoms: p.symptoms,
        pending: true,
      }));
    return [...waiting, ...remote].sort((a, b) => b.startedAtMs - a.startedAtMs).slice(0, 10);
  }, [remote, pending]);

  const waitingCount = items.filter((i) => i.pending).length;
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
        <Image
          source={require("../../assets/icon-mark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.title}>How are you feeling?</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Log a migraine" onPress={() => navigation.navigate("QuickLog")} />
        <Button
          title="My medications"
          variant="secondary"
          onPress={() => navigation.navigate("Medications")}
        />
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
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.severity}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardWhen}>
                {formatWhen(item.startedAtMs)}
                {item.pending ? "  ·  Waiting to sync" : ""}
              </Text>
              <Text style={styles.cardSymptoms} numberOfLines={2}>
                {item.symptoms.length > 0 ? item.symptoms.join(", ") : "No symptoms noted"}
              </Text>
            </View>
          </View>
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
  hero: { alignItems: "center", marginTop: 36, marginBottom: 32 },
  logo: { width: 76, height: 76 },
  greeting: { fontSize: 15, color: colors.muted, marginTop: 16 },
  title: { fontSize: 27, fontWeight: "700", color: colors.primary, marginTop: 4 },
  actions: { marginBottom: 8 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 14,
  },
  section: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  status: { flexDirection: "row", alignItems: "center", flexShrink: 1, marginLeft: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12.5, color: colors.muted, flexShrink: 1 },
  list: { flex: 1 },
  emptyCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },
  emptyText: { fontSize: 14.5, color: colors.muted, lineHeight: 21, textAlign: "center" },
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
  cardSymptoms: { fontSize: 13.5, color: colors.muted, marginTop: 3, lineHeight: 19 },
  footer: { alignItems: "center", paddingTop: 12, paddingBottom: 16 },
  email: { fontSize: 12.5, color: colors.muted, marginBottom: 8 },
  logoutText: { fontSize: 15, fontWeight: "600", color: colors.primary },
});