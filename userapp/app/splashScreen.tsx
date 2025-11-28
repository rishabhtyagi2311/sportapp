import React from "react";
import { Image, Dimensions } from "react-native";
import Animated, { FadeIn, Keyframe } from "react-native-reanimated";

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

export default function SplashScreen() {
  const DURATION = 2600;
  const DELAY = 1300;

  return (
    <Animated.View
      className="flex-1 bg-slate-900"
      entering={FadeIn.delay(100).duration(300)}
    >
      {/* Top Section */}
      <Animated.View
        entering={topTranslateKeyframe.duration(DURATION).delay(DELAY)}
        className="flex-1 justify-end"
      >
        <Animated.View entering={rotateKeyframe.duration(DURATION).delay(DELAY)}>
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
          className="bg-slate-900  rounded-xl"
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
        <Animated.View entering={rotateKeyframe.duration(DURATION).delay(DELAY)}>
          <Image
            style={{ width: 72, height: 72 }}
            className="self-center aspect-square"
            resizeMode="contain"
            source={require("@/assets/images/logo1.png")}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
