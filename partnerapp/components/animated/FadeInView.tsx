import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { motion } from '@/constants/theme';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Stagger delay in ms — pass `index * 60` when rendering a list. */
  delay?: number;
  /** 'up' slides in from below (good for cards/sections), 'none' is a plain fade (good for headers). */
  direction?: 'up' | 'none';
  className?: string;
  style?: ViewStyle;
}

/**
 * Shared entrance animation — replaces one-off reanimated setups that were
 * previously copy-pasted per screen. Keeps timing/easing consistent app-wide.
 */
export default function FadeInView({ children, delay = 0, direction = 'up', className, style }: FadeInViewProps) {
  const entering = direction === 'up'
    ? FadeInDown.duration(motion.base).delay(delay).springify().damping(18)
    : FadeIn.duration(motion.base).delay(delay);

  return (
    <Animated.View entering={entering} className={className} style={style}>
      {children}
    </Animated.View>
  );
}
