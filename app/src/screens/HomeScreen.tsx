// HOME: shown after logging in. A simple placeholder for now.
import { signOut } from "firebase/auth";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Image
          source={require("../../assets/icon-mark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>You're in</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
      </View>
      <View style={styles.bottom}>
        <Button title="Log Out" variant="secondary" onPress={() => signOut(auth)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 110, height: 110 },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginTop: 16 },
  email: { fontSize: 15, color: colors.muted, marginTop: 6 },
  bottom: { paddingBottom: 20 },
});