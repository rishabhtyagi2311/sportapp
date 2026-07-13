import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { motion } from '@/constants/theme';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  /** How much to scale down on press. Defaults to a subtle 0.97. */
  pressScale?: number;
}

/**
 * Drop-in replacement for TouchableOpacity/Pressable that adds a subtle
 * scale-down press animation — used for primary CTAs and cards throughout
 * the app so tap feedback feels consistent instead of the flat opacity-only
 * default.
 */
export default function AnimatedPressable({
  children,
  className,
  style,
  pressScale = 0.97,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      className={className}
      style={[style, animatedStyle]}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) scale.value = withTiming(pressScale, { duration: motion.fast });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: motion.fast });
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
}
