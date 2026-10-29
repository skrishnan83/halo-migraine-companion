// The list of every screen in halo. Add a name here when you add a screen.
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Relief } from "../utils/relief";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  About: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  QuickLog: undefined;
  Medications: undefined;
  Relief: {
    attackId: string;
    severity: number;
    startedAtMs: number;
    relief?: Relief;
  };
  History: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
