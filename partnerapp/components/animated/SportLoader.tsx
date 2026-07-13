import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

interface SportLoaderProps {
  label?: string;
  size?: number;
}

/** A rolling, bouncing football — used wherever we need a branded loading
 * state instead of a plain spinner (e.g. the session check on the welcome
 * screen). The bounce here is the point of the animation (a ball bouncing),
 * not incidental press feedback, so it's exempt from the "no gratuitous
 * spring bounce" rule applied to buttons/cards elsewhere in the app. */
export default function SportLoader({ label, size = 56 }: SportLoaderProps) {
  const rotation = useSharedValue(0);
  const bounce = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
    bounce.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="items-center justify-center">
      <Animated.View style={animatedStyle}>
        <FontAwesome5 name="futbol" size={size} color="#2563eb" />
      </Animated.View>
      {label && <Text className="text-slate-400 font-bold text-xs mt-5 uppercase tracking-widest">{label}</Text>}
    </View>
  );
}
