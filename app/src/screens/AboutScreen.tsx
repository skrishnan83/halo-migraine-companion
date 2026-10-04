// ABOUT: what Halo is and what it does. Information only.
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ScreenProps } from "../navigation/types";
import { colors } from "../theme/colors";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "flash-outline", label: "Quick logging" },
  { icon: "mic-outline", label: "Voice notes" },
  { icon: "cloud-offline-outline", label: "Works offline" },
];

export default function AboutScreen({ navigation }: ScreenProps<"About">) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Image source={require("../../assets/icon-mark.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>About Halo</Text>
        <Text style={styles.body}>
          Halo is a migraine care companion. Log an attack in a few taps or by voice, and keep a
          list of the medications you take. It works with or without internet and syncs to the
          cloud when you're back online.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.feature}>
              <View style={styles.iconCircle}>
                <Ionicons name={f.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.next}>
          Coming next: relief ratings, history and trends, and a report to share with your doctor.
        </Text>

        <Text style={styles.disclaimer}>
          Halo gives general information only and is not a substitute for medical advice.
        </Text>
        <Text style={styles.version}>Version 1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { paddingHorizontal: 28, paddingBottom: 28 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  logo: { width: 96, height: 96, alignSelf: "center", marginTop: 16 },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, textAlign: "center", marginTop: 12 },
  body: { fontSize: 16, color: colors.textDark, lineHeight: 24, marginTop: 16 },
  features: { flexDirection: "row", marginTop: 28 },
  feature: { flex: 1, alignItems: "center" },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  featureText: { fontSize: 13, color: colors.textDark, textAlign: "center" },
  next: { fontSize: 14, fontStyle: "italic", color: colors.muted, lineHeight: 20, marginTop: 24 },
  disclaimer: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 28 },
  version: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 6 },
});