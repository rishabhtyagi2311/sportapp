// app/index.tsx
import "react-native-gesture-handler";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./splashScreen";

// 🔥 Pull correct route type from expo-router
type RouterReplaceArg = Parameters<typeof router.replace>[0];

export default function Index() {
  const [initialRoute, setInitialRoute] =
    useState<RouterReplaceArg | null>(null);
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
          setInitialRoute("./(homeScreenTabs)");
        } else {
          setInitialRoute("./(onboardingStack)/welcome");
        }
      } catch (error) {
        console.log("[Index] checkAuth error:", error);
        setInitialRoute("./(homeScreenTabs)");
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, []);

  // Keep native splash while deciding
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
        if (initialRoute) {
          router.replace(initialRoute);
        }
      }}
    />
  );
}
