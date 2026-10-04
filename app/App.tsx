import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "./src/services/firebase";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello, Halo! 👋</Text>
      <Text>Connected to Firebase project: {auth.app.options.projectId}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});