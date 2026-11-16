// SYMPTOM COMPANION: ask halo a question about migraine. General information only.
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState, type ComponentRef } from "react";
import {
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
import type { ChatMessage } from "../services/ai";
import { askCompanion, hasRedFlag } from "../services/companion";
import { colors } from "../theme/colors";

const SUGGESTIONS = [
  "What can trigger a migraine?",
  "What helps with nausea during an attack?",
  "When should I see a doctor?",
];

export default function CompanionScreen({
  navigation,
}: ScreenProps<"Companion">) {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // askQuestion(): "Ask" sends the question and shows halo's answer.
  async function askQuestion(text = question) {
    const q = text.trim();
    if (!q) {
      setError("Please type a question.");
      return;
    }
    setError("");
    setUrgent(hasRedFlag(q));
    setQuestion("");
    setChat((c) => [...c, { role: "user", content: q }]);
    setThinking(true);
    try {
      const answer = await askCompanion(chat, q);
      setChat((c) => [...c, { role: "assistant", content: answer }]);
    } catch (e) {
      console.warn("Companion failed", e);
      setError("Couldn't get an answer. Check your connection and try again.");
    } finally {
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>Symptom Companion</Text>
          <Text style={styles.intro}>
            Ask a question about migraine. halo gives general information only,
            not a diagnosis.
          </Text>

          {chat.length === 0 && (
            <View style={styles.chips}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={styles.chip}
                  onPress={() => askQuestion(s)}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {chat.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.role === "user" ? styles.mine : styles.halo,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  m.role === "user" && styles.mineText,
                ]}
              >
                {m.content}
              </Text>
            </View>
          ))}
          {thinking && <Text style={styles.thinking}>halo is thinking...</Text>}
          {urgent && (
            <View style={styles.urgentBox}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.urgentText}>
                This could need urgent care. If it is happening now, call 911 or
                go to the emergency room.
              </Text>
            </View>
          )}

          <View style={styles.askBox}>
            <FormField
              label="Your question"
              value={question}
              onChangeText={setQuestion}
              placeholder="e.g. Why do I feel sick during a migraine?"
              multiline
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title="Ask"
              onPress={() => askQuestion()}
              loading={thinking}
            />
          </View>
          <Text style={styles.note}>
            Answers are made by AI. General information only, not medical
            advice.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back: { fontSize: 16, color: colors.muted, marginTop: 8 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 16,
  },
  intro: { fontSize: 15, color: colors.muted, lineHeight: 21, marginTop: 6 },
  urgentBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: "#FEF2F2",
  },
  urgentText: { flex: 1, fontSize: 14, color: colors.danger, lineHeight: 20 },
  chips: { marginTop: 18 },
  chip: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  chipText: { fontSize: 14.5, color: colors.primary },
  bubble: { marginTop: 12, padding: 14, borderRadius: 16, maxWidth: "88%" },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  halo: { alignSelf: "flex-start", backgroundColor: colors.secondaryLight },
  bubbleText: { fontSize: 15, color: colors.textDark, lineHeight: 21 },
  mineText: { color: colors.white },
  thinking: { marginTop: 12, fontSize: 14, color: colors.muted },
  askBox: { marginTop: 24 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
  note: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 14,
  },
});
