// app/index.tsx
import "react-native-gesture-handler";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./splashScreen";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  console.log("[Index] render. ready =", ready, "initialRoute =", initialRoute);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(
          '[Index] checkAuth: starting AsyncStorage.getItem("user_id")'
        );
        const userId = await AsyncStorage.getItem("user_id");
        console.log("[Index] checkAuth: userId =", userId);

        if (userId) {
          setInitialRoute("/(homeScreenTabs)");
        } else {
          // later you can change this to onboarding or something else
          setInitialRoute("/(onboardingStack)/welcome");
        }
      } catch (error) {
        console.log("[Index] checkAuth error:", error);
        setInitialRoute("/(homeScreenTabs)");
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, []);

  // While deciding which route to go to, keep native splash
  if (!ready || !initialRoute) {
    console.log(
      "[Index] not ready yet, returning null to keep native splash visible"
    );
    return null;
  }

  console.log(
    "[Index] ready, rendering SplashScreen that will navigate to",
    initialRoute
  );

  return (
    <SplashScreen
      onFinish={() => {
        router.replace(initialRoute);
      }}
    />
  );
}
