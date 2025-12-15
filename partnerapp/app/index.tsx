// app/index.tsx
import "react-native-gesture-handler";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./splashScreen";

export default function Index() {
  // ✅ Use string | null instead of complex RouterReplaceArg type
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