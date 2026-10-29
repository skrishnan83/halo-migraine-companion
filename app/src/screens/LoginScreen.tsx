// LOG IN: email + password, checked by Firebase Authentication.
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import FormField from "../components/FormField";
import HaloLogo from "../components/HaloLogo";
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";

// After this many failed tries in a row, the app opens Forgot password.
const MAX_ATTEMPTS = 3;

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
  const [failedAttempts, setFailedAttempts] = useState(0);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setFailedAttempts(0);
      // Success: the app moves to Home automatically.
    } catch (e) {
      const code = (e as { code?: string }).code;
      const wrongDetails =
        code === "auth/invalid-credential" ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password";
      if (wrongDetails) {
        const next = failedAttempts + 1;
        if (next >= MAX_ATTEMPTS) {
          setFailedAttempts(0);
          setError("");
          Alert.alert(
            "Too many attempts",
            "You've tried 3 times. Reset your password to continue.",
          );
          navigation.navigate("ForgotPassword");
          return;
        }
        setFailedAttempts(next);
        setError(
          `Email or password is incorrect. Attempt ${next} of ${MAX_ATTEMPTS}.`,
        );
      } else {
        setError(friendlyError(code));
      }
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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <View style={styles.logo}>
            <HaloLogo size={40} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue to halo</Text>

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

          <Pressable
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgot}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Log In" onPress={handleLogin} loading={loading} />

          <Pressable
            onPress={() => navigation.navigate("Signup")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>
              New user? <Text style={styles.link}>Create an account</Text>
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
  logo: { alignSelf: "center", marginTop: 24 },
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
  forgot: { alignSelf: "flex-end", marginTop: -4, marginBottom: 14 },
  linkRow: { marginTop: 22, alignItems: "center" },
  linkText: { fontSize: 15, color: colors.muted },
  link: { color: colors.accent, fontWeight: "600" },
});
