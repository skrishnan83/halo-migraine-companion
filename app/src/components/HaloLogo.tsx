// halo logo: "hal" + the two brand rings as the "o".
// The rings are the same height as the letter "l".
import { Platform, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  size?: number; // font size of "hal"
  color?: string; // colour of "hal"
};

export default function HaloLogo({ size = 46, color = colors.primary }: Props) {
  const ring = size * 0.755; // outer ring = height of the "l"
  const stroke = ring * 0.1; // ring thickness
  const inner = ring * 0.694; // inner (orange) ring

  return (
    <View
      style={{ flexDirection: "row", alignItems: "flex-end" }}
      accessible
      accessibilityLabel="halo"
    >
      <Text
        style={{
          fontSize: size,
          lineHeight: size * 1.2,
          fontWeight: "700",
          color,
          fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
        }}
      >
        hal
      </Text>
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: colors.sage,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: size * 0.03,
          marginBottom: size * 0.24,
        }}
      >
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            borderWidth: stroke,
            borderColor: colors.accent,
          }}
        />
      </View>
    </View>
  );
}
