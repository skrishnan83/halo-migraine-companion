// The list of every screen in Halo. Add a name here when you add a screen.
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Welcome: undefined;
    Signup: undefined;
  Home: undefined;
};
  Signup: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;