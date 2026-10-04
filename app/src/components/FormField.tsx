// A labelled text box, used for email, password, and other inputs.
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../theme/colors";

type Props = TextInputProps & { label: string };

export default function FormField({ label, ...inputProps }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: colors.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#D5DEDA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
});