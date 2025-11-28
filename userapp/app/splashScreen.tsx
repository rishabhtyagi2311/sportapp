// app/splashScreen.tsx
import React, { useEffect, useState } from "react";
import { Image, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Keyframe,
  RotateOutDownLeft,
  RotateOutUpRight,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

/**
 * Top image movement
 */
export const topTranslateKeyframe = new Keyframe({
  0: {
    transform: [{ translateY: -height }],
  },
  70: {
    transform: [{ translateY: -height * 0.2 }],
  },
  100: {
    transform: [{ translateY: 0 }],
  },
});

/**
 * Bottom image movement
 */
export const bottomTranslateKeyframe = new Keyframe({
  0: {
    transform: [{ translateY: height }],
  },
  70: {
    transform: [{ translateY: height * 0.2 }],
  },
  100: {
    transform: [{ translateY: 0 }],
  },
});

/**
 * Rotation animation
 */
export const rotateKeyframe = new Keyframe({
  0: {
    transform: [{ rotate: "0deg" }],
  },
  100: {
    transform: [{ rotate: "720deg" }],
  },
});

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const DURATION = 2600;
  const DELAY = 1300;

  // how long total until we start exit
  const MAIN_ANIM_END = 4500; // ms
  const EXIT_DURATION = 500;  // ms

  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // 1) after main animation, trigger exit
    const exitTimer = setTimeout(() => {
      setShowContent(false); // this causes exiting animations to run
    }, MAIN_ANIM_END);

    // 2) after exit duration, tell parent to navigate
    const navTimer = setTimeout(() => {
      onFinish();
    }, MAIN_ANIM_END + EXIT_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [onFinish]);

  return (
    <Animated.View
      className="flex-1 "
    
    >
      {showContent && (
        <>
          {/* Top Section */}
          <Animated.View
            entering={topTranslateKeyframe.duration(DURATION).delay(DELAY)}
            className="flex-1 justify-end"
          >
            <Animated.View
              entering={rotateKeyframe.duration(DURATION).delay(DELAY)}
              exiting={RotateOutDownLeft.duration(EXIT_DURATION)}
            >
              <Image
                style={{ width: 72, height: 72 }}
                className="self-center aspect-square"
                resizeMode="contain"
                source={require("@/assets/images/logo3.png")}
              />
            </Animated.View>
          </Animated.View>

          {/* Center Section */}
          <Animated.View className="h-64 bg-slate-900 flex justify-center items-center">
            <Animated.View
              entering={FadeIn.delay(4000)}
              exiting={FadeOut.duration(EXIT_DURATION)}
              className="bg-slate-900 rounded-xl"
            >
              <Image
                style={{ width: 224, height: 224 }}
                className="aspect-square"
                resizeMode="contain"
                source={require("@/assets/images/logo2.png")}
              />
            </Animated.View>
          </Animated.View>

          {/* Bottom Section */}
          <Animated.View
            entering={bottomTranslateKeyframe.duration(DURATION).delay(DELAY)}
            className="flex-1 justify-start"
          >
            <Animated.View
              entering={rotateKeyframe.duration(DURATION).delay(DELAY)}
              exiting={RotateOutUpRight.duration(EXIT_DURATION)}
            >
              <Image
                style={{ width: 72, height: 72 }}
                className="self-center aspect-square"
                resizeMode="contain"
                source={require("@/assets/images/logo1.png")}
              />
            </Animated.View>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}
