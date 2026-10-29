// A small rounded choice button. Dark when chosen.
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type Props = { label: string; selected: boolean; onPress: () => void };

export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.primary },
  text: { fontSize: 14.5, color: colors.textDark },
  textOn: { color: colors.white },
});
