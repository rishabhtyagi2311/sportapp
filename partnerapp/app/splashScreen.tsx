import React, { useEffect, useState } from "react";
import { Image, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  Keyframe,
  RotateOutDownLeft,
  RotateOutUpRight,
  Easing,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

/** Chevron entrance: slides in from off-screen and settles into place. */
const topTranslateKeyframe = new Keyframe({
  0: { transform: [{ translateY: -height * 0.4 }] },
  100: { transform: [{ translateY: 0 }] },
});

const bottomTranslateKeyframe = new Keyframe({
  0: { transform: [{ translateY: height * 0.4 }] },
  100: { transform: [{ translateY: 0 }] },
});

/** One full spin while sliding in — the flourish this screen is built around. */
const rotateKeyframe = new Keyframe({
  0: { transform: [{ rotate: "0deg" }] },
  100: { transform: [{ rotate: "360deg" }] },
});

interface SplashScreenProps {
  /** Always fires after a fixed duration — never gated on anything async
   * (auth checks, network calls, etc). Those happen on the screen we
   * navigate to next, with their own loading state. A splash screen that
   * waits on the network can freeze indefinitely if that call is slow. */
  onFinish: () => void;
}

const DELAY = 150;
const SLIDE_ROTATE_DURATION = 900;
const LOGO_DELAY = 150;
const LOGO_DURATION = 500;
const HOLD_MS = 700;
const EXIT_DURATION = 400;
const SHOW_DURATION_MS = Math.max(DELAY + SLIDE_ROTATE_DURATION, LOGO_DELAY + LOGO_DURATION) + HOLD_MS;

export default function SplashScreen({ onFinish }: SplashScreenProps): React.ReactNode {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const exitTimer = setTimeout(() => setShowContent(false), SHOW_DURATION_MS);
    const navTimer = setTimeout(() => onFinish(), SHOW_DURATION_MS + EXIT_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [onFinish]);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#F8FAFC']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {showContent && (
        <View className="flex-1 items-center justify-center">
          {/* Soft glow behind the mark */}
          <View
            className="absolute bg-blue-100 rounded-full"
            style={{ width: 260, height: 260, opacity: 0.5 }}
          />

          {/* Top chevron */}
          <Animated.View
            entering={topTranslateKeyframe.duration(SLIDE_ROTATE_DURATION).delay(DELAY)}
            className="absolute"
            style={{ top: '50%', marginTop: -170 }}
          >
            <Animated.View
              entering={rotateKeyframe.duration(SLIDE_ROTATE_DURATION).delay(DELAY)}
              exiting={RotateOutDownLeft.duration(EXIT_DURATION)}
            >
              <Image
                style={{ width: 56, height: 40 }}
                resizeMode="contain"
                source={require("@/assets/images/logo3.png")}
              />
            </Animated.View>
          </Animated.View>

          {/* Brand mark */}
          <Animated.View
            entering={FadeIn.duration(LOGO_DURATION).delay(LOGO_DELAY).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(EXIT_DURATION)}
          >
            <Image
              style={{ width: 190, height: 190 }}
              resizeMode="contain"
              source={require("@/assets/images/logo2.png")}
            />
          </Animated.View>

          {/* Bottom chevron */}
          <Animated.View
            entering={bottomTranslateKeyframe.duration(SLIDE_ROTATE_DURATION).delay(DELAY)}
            className="absolute"
            style={{ bottom: '50%', marginBottom: -170 }}
          >
            <Animated.View
              entering={rotateKeyframe.duration(SLIDE_ROTATE_DURATION).delay(DELAY)}
              exiting={RotateOutUpRight.duration(EXIT_DURATION)}
            >
              <Image
                style={{ width: 56, height: 40 }}
                resizeMode="contain"
                source={require("@/assets/images/logo1.png")}
              />
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
