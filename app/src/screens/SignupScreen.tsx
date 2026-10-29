// SIGN UP: creates a new account in Firebase Authentication.
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
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
import PasswordChecklist from "../components/PasswordChecklist";
import { checkPassword, MIN_PASSWORD_LENGTH } from "../utils/passwordRules";
import type { ScreenProps } from "../navigation/types";
import { auth } from "../services/firebase";
import { colors } from "../theme/colors";
import { signupState } from "../utils/signupState";

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
    if (!checkPassword(password).isValid) {
      setError("Your password doesn't meet all the requirements below.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setError("");
    setLoading(true);
    signupState.creating = true;
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // A new account goes to Log In, never Home: sign out, then open Log In.
      await signOut(auth);
      Alert.alert("Account created", "Please log in with your new account.");
      navigation.replace("Login");
    } catch (e) {
      setError(friendlyError((e as { code?: string }).code));
    } finally {
      signupState.creating = false;
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
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoCapitalize="none"
            secureTextEntry
          />
          <PasswordChecklist password={password} />
          <FormField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Type it again"
            autoCapitalize="none"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
          />

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.linkRow}
          >
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
  linkRow: { marginTop: 22, alignItems: "center" },
  linkText: { fontSize: 15, color: colors.muted },
  link: { color: colors.accent, fontWeight: "600" },
});
