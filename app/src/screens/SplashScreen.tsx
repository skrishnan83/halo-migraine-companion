// SPLASH: shows the logo for about 2.5 seconds, then goes to Welcome.
import { useEffect } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import type { ScreenProps } from "../navigation/types";
import { colors } from "../theme/colors";

export default function SplashScreen({ navigation }: ScreenProps<"Splash">) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Welcome"), 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/icon-mark.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>halo</Text>
      <Text style={styles.tagline}>MIGRAINE CARE COMPANION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  logo: { width: 185, height: 185 },
  title: {
    fontSize: 46, fontWeight: "700", color: colors.primary, marginTop: 4,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
  },
  tagline: { fontSize: 12, letterSpacing: 2.5, color: colors.muted, marginTop: 6 },
});