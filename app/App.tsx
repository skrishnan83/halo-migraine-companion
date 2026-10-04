// The starting point of Halo. Shows Welcome/Login/Signup when logged out,
// and Home when logged in.
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, type User } from "firebase/auth";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { RootStackParamList } from "./src/navigation/types";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import { auth } from "./src/services/firebase";
import { colors } from "./src/theme/colors";
import { ensureUserProfile } from "./src/services/userProfile";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import QuickLogScreen from "./src/screens/QuickLogScreen";
import MedicationsScreen from "./src/screens/MedicationsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  // Firebase tells us whenever someone logs in or out.
  useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
      if (firebaseUser) {
        ensureUserProfile(firebaseUser).catch((e) => console.warn("Profile save failed", e));
      }
    });
    return unsubscribe;
  }, []);

  // Brief spinner while Firebase checks for a saved login.
  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
                        <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="QuickLog" component={QuickLogScreen} />
                            <Stack.Screen name="Medications" component={MedicationsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}