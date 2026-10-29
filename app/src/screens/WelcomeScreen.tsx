// WELCOME: Log in, create an account, or read About halo.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import HaloLogo from "../components/HaloLogo";
import type { ScreenProps } from "../navigation/types";
import { colors } from "../theme/colors";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "flash-outline", label: "Quick logging" },
  { icon: "medkit-outline", label: "See what works" },
  { icon: "document-text-outline", label: "Doctor reports" },
];

export default function WelcomeScreen({ navigation }: ScreenProps<"Welcome">) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <HaloLogo size={64} />
        <Text style={styles.tagline}>MIGRAINE CARE COMPANION</Text>

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
      </View>

      <View style={styles.bottom}>
        <Button title="Log In" onPress={() => navigation.navigate("Login")} />
        <Button
          title="Create Account"
          variant="secondary"
          onPress={() => navigation.navigate("Signup")}
        />
        <Pressable
          onPress={() => navigation.navigate("About")}
          style={styles.aboutLink}
          hitSlop={10}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.aboutText}>About halo</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          halo gives general information only and is not a substitute for
          medical advice.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 28 },
  top: { flex: 1, alignItems: "center", justifyContent: "center" },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#4F6466",
    marginTop: 4,
  },
  features: { flexDirection: "row", alignSelf: "stretch", marginTop: 36 },
  feature: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 18,
  },
  bottom: { paddingBottom: 20 },
  aboutLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 6,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 16,
  },
});
