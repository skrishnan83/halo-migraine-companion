// HOME: greeting, the main actions, and your recent attacks.
import { signOut } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import type { ScreenProps } from "../navigation/types";
import { auth, db } from "../services/firebase";
import { colors } from "../theme/colors";

type Attack = {
  id: string;
  severity: number;
  startedAt: Timestamp;
  symptoms: string[];
  note: string;
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// "Today, 11:51 AM", "Yesterday, 9:30 PM", or "Oct 2, 4:15 PM"
function formatWhen(ts: Timestamp): string {
  const d = ts.toDate();
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export default function HomeScreen({ navigation }: ScreenProps<"Home">) {
  const [attacks, setAttacks] = useState<Attack[]>([]);

  // Listens to Firestore, so the list updates by itself when you save a log.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "attacks"),
      orderBy("startedAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setAttacks(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Attack, "id">) }))
        );
      },
      (e) => console.warn("Could not load attacks", e)
    );
    return unsubscribe;
  }, []);

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

      <Text style={styles.section}>Recent attacks</Text>
      <FlatList
        style={styles.list}
        data={attacks}
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
              <Text style={styles.cardWhen}>{formatWhen(item.startedAt)}</Text>
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
  section: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    marginTop: 28,
    marginBottom: 14,
  },
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