// app/index.tsx
import "react-native-gesture-handler";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { useAuthStore } from "@/store/authStore";
import SplashScreen from "./splashScreen";

export default function Index() {
  // ✅ Use string | null instead of complex RouterReplaceArg type
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  console.log("[Index] render. ready =", ready, "initialRoute =", initialRoute);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[Index] checkAuth: validating stored session with the server");
        const isLoggedIn = await useAuthStore.getState().hydrate();
        console.log("[Index] checkAuth: isLoggedIn =", isLoggedIn);

        setInitialRoute(isLoggedIn ? "./(homeScreenTabs)" : "./(onboardingStack)/welcome");
      } catch (error) {
        console.log("[Index] checkAuth error:", error);
        // Fail closed — if we can't confirm the session is valid, send the
        // user to login rather than assuming they're authenticated.
        setInitialRoute("./(onboardingStack)/welcome");
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, []);

  // ✅ Always render SplashScreen
  return (
    <SplashScreen
      ready={ready}
      initialRoute={initialRoute}
      onFinish={() => {
        if (initialRoute) {
          router.replace(initialRoute as any); // ✅ Cast as any for complex type
        }
      }}
    />
  );
}