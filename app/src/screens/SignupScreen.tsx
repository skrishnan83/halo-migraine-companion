// SIGN UP: creates a new account in Firebase Authentication.
import { createUserWithEmailAndPassword } from "firebase/auth";
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

function friendlyError(code?: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Please choose a stronger password.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function SignupScreen({ navigation }: ScreenProps<"Signup">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password) {
      setError("Please fill in all the boxes.");
      return;
    }
    if (password.length < 8) {
      setError("Your password needs at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Success: the app moves to Home automatically.
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>It only takes a moment</Text>

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
            placeholder="At least 8 characters"
            autoCapitalize="none"
            secureTextEntry
          />
          <FormField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Type it again"
            autoCapitalize="none"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Account" onPress={handleSignup} loading={loading} />

          <Pressable onPress={() => navigation.navigate("Login")} style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.link}>Log in</Text>
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