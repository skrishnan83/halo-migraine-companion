// LOG IN: email + password, checked by Firebase Authentication.
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import FormField from "../components/FormField";
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";

// Turns Firebase's technical error codes into plain English.
function friendlyError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginScreen({ navigation }: ScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Success: the app will move to Home automatically (added in the next step).
    } catch (e) {
      setError(friendlyError((e as { code?: string }).code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Image
            source={require("../../assets/icon-mark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue to Halo</Text>

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            autoCapitalize="none"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Log In" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => navigation.navigate("Signup")} style={styles.linkRow}>
            <Text style={styles.linkText}>
              New to Halo? <Text style={styles.link}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  container: { paddingHorizontal: 28, paddingBottom: 32 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  logo: { width: 72, height: 72, alignSelf: "center", marginTop: 24 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 28,
  },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
  linkRow: { marginTop: 22, alignItems: "center" },
  linkText: { fontSize: 15, color: colors.muted },
  link: { color: colors.accent, fontWeight: "600" },
});