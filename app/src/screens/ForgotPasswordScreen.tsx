// FORGOT PASSWORD: Firebase emails the person a link to choose a new password.
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  Image,
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
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";

export default function ForgotPasswordScreen({ navigation }: ScreenProps<"ForgotPassword">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "auth/invalid-email") {
        setError("That email address doesn't look right.");
      } else if (code === "auth/network-request-failed") {
        setError("No internet connection. Please check and try again.");
      } else {
        // For privacy, don't reveal whether an account exists.
        setSent(true);
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Image
            source={require("../../assets/icon-mark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to choose a new one.
          </Text>

          {sent ? (
            <View style={styles.success}>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successText}>
                If an account exists for that email, a reset link is on its way. Open it, choose a
                new password, then come back and log in. Check your spam folder too.
              </Text>
            </View>
          ) : (
            <>
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
            </>
          )}

          <Button
            title="Back to Log In"
            variant="secondary"
            onPress={() => navigation.navigate("Login")}
          />
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
    fontSize: 26,
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
    lineHeight: 21,
  },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
  success: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
  },
  successTitle: { fontSize: 17, fontWeight: "700", color: colors.primary, marginBottom: 6 },
  successText: { fontSize: 14.5, color: colors.textDark, lineHeight: 21 },
});