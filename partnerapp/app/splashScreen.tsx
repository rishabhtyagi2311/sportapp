import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import Animated, { FadeIn, FadeOut, Easing } from "react-native-reanimated";

interface SplashScreenProps {
  ready: boolean;
  initialRoute: string | null;
  onFinish: () => void;
}

// Total on-screen time is deliberately short (~2.2s) — the brand mark should
// be the thing people see, not an animation warm-up before it appears.
const ACCENT_ENTER_MS = 400;
const LOGO_ENTER_DELAY_MS = 120;
const LOGO_ENTER_MS = 450;
const HOLD_MS = 1300;
const EXIT_MS = 350;
const SHOW_DURATION_MS = LOGO_ENTER_DELAY_MS + LOGO_ENTER_MS + HOLD_MS;

export default function SplashScreen({ ready, initialRoute, onFinish }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (!ready || !initialRoute) return;

    const exitTimer = setTimeout(() => setShowContent(false), SHOW_DURATION_MS);
    const navTimer = setTimeout(() => onFinish(), SHOW_DURATION_MS + EXIT_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [ready, initialRoute, onFinish]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {showContent && (
        <>
          <Animated.View
            entering={FadeIn.duration(ACCENT_ENTER_MS).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(EXIT_MS)}
            className="absolute"
            style={{ top: "30%" }}
          >
            <Image
              style={{ width: 48, height: 34 }}
              resizeMode="contain"
              source={require("@/assets/images/logo3.png")}
            />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(LOGO_ENTER_MS)
              .delay(LOGO_ENTER_DELAY_MS)
              .easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(EXIT_MS)}
          >
            <Image
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
              source={require("@/assets/images/logo2.png")}
            />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(ACCENT_ENTER_MS).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(EXIT_MS)}
            className="absolute"
            style={{ bottom: "30%" }}
          >
            <Image
              style={{ width: 48, height: 34 }}
              resizeMode="contain"
              source={require("@/assets/images/logo1.png")}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}
