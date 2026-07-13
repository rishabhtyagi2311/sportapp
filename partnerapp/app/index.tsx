// app/index.tsx
import "react-native-gesture-handler";

import { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import SplashScreen from "./splashScreen";

export default function Index() {
  // Fire-and-forget: starts validating the stored session against the
  // backend immediately, in parallel with the splash animation, instead of
  // blocking the splash on it. By the time the splash finishes (~2s) this
  // has often already resolved; if it hasn't (e.g. a cold-started backend),
  // the welcome screen shows its own loader for whatever's left.
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <SplashScreen
      onFinish={() => {
        router.replace("/(onboardingStack)/welcome");
      }}
    />
  );
}
