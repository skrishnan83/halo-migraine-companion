// HOME: the main button opens Quick Log, and recent attacks are listed below.
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

function formatWhen(ts: Timestamp): string {
  return ts.toDate().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
      <View style={styles.header}>
        <Image
          source={require("../../assets/icon-mark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
        </View>
      </View>

      <Button title="Log a migraine" onPress={() => navigation.navigate("QuickLog")} />

      <Text style={styles.section}>Recent attacks</Text>
      <FlatList
        data={attacks}
        keyExtractor={(a) => a.id}
        contentContainerStyle={attacks.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <Text style={styles.empty}>No attacks logged yet. Tap "Log a migraine" when one starts.</Text>
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

      <Pressable onPress={() => signOut(auth)} style={styles.logout} hitSlop={12}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 28 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12 },
  logo: { width: 56, height: 56 },
  headerText: { marginLeft: 14, flex: 1 },
  title: { fontSize: 22, fontWeight: "700", color: colors.primary },
  email: { fontSize: 13.5, color: colors.muted, marginTop: 2 },
  section: { fontSize: 15, fontWeight: "600", color: colors.textDark, marginTop: 28, marginBottom: 12 },
  emptyWrap: { flexGrow: 1 },
  empty: { fontSize: 14.5, color: colors.muted, lineHeight: 21 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 17, fontWeight: "700" },
  cardBody: { marginLeft: 14, flex: 1 },
  cardWhen: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  cardSymptoms: { fontSize: 13.5, color: colors.muted, marginTop: 3 },
  logout: { alignSelf: "center", paddingVertical: 14 },
  logoutText: { fontSize: 15, color: colors.muted },
});