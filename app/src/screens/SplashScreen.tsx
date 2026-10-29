// SPLASH: shows the logo for about 2.5 seconds, then goes to Welcome.
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ScreenProps } from "../navigation/types";
import { colors } from "../theme/colors";
import HaloLogo from "../components/HaloLogo";

export default function SplashScreen({ navigation }: ScreenProps<"Splash">) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Welcome"), 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <HaloLogo size={64} />
      <Text style={styles.tagline}>MIGRAINE CARE COMPANION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#4F6466",
    marginTop: 4,
  },
});
