// app/index.tsx
import "react-native-gesture-handler";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import SplashScreen from "./splashScreen";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await hydrate();
      setInitialRoute(isLoggedIn ? "/(homeScreenTabs)" : "/(onboardingStack)/advertise");
    };

    checkAuth();
  }, []);

  // While deciding which route to go to, keep native splash
  if (!initialRoute) {
    return null;
  }

  return (
    <SplashScreen
      onFinish={() => {
        router.replace(initialRoute);
      }}
    />
  );
}
