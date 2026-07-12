import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@/constants/theme';

export interface Responsive {
  width: number;
  height: number;
  isSmallScreen: boolean;
  isTablet: boolean;
  /** Scales a base size up slightly on tablets, down slightly on small phones. */
  scale: (base: number) => number;
}

/**
 * Single source of truth for responsive breakpoints — replaces the ad-hoc
 * `isTablet`/`Dimensions.get` checks that used to be copy-pasted per screen
 * with three different breakpoint values. Reactive to rotation/resize
 * because it's built on `useWindowDimensions`, unlike static `Dimensions.get`.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < breakpoints.small;
  const isTablet = width >= breakpoints.tablet;

  const scale = (base: number) => {
    if (isTablet) return base * 1.15;
    if (isSmallScreen) return base * 0.92;
    return base;
  };

  return { width, height, isSmallScreen, isTablet, scale };
}
