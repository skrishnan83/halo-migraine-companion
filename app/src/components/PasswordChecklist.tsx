// Shows each password rule with a tick (✓) once it's met.
import { StyleSheet, Text, View } from "react-native";
import { checkPassword } from "../utils/passwordRules";

export default function PasswordChecklist({ password }: { password: string }) {
  const { results } = checkPassword(password);

  return (
    <View style={styles.wrap}>
      {results.map((rule) => (
        <Text
          key={rule.id}
          style={[styles.rule, rule.passed ? styles.pass : styles.fail]}
        >
          {rule.passed ? "✓" : "○"} {rule.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, alignSelf: "stretch" },
  rule: { fontSize: 14, marginBottom: 4 },
  pass: { color: "#2E8B57" }, // green
  fail: { color: "#6B7C7D" }, // grey
});
