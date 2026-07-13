// Shared design tokens for values that can't be expressed as nativewind
// classNames (icon colors, animation timing, breakpoints). Keep these in
// sync with tailwind.config.js's `brand`/`success`/`danger`/`warning` scale.

export const colors = {
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    400: '#94a3b8',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  success: '#16a34a',
  danger: '#ef4444',
  warning: '#f59e0b',
  white: '#ffffff',
} as const;

// Radius convention for new/touched screens — keeps rounding consistent
// without redefining Tailwind's default scale (which existing screens rely
// on and haven't been visually re-verified after any such change).
export const radius = {
  chip: 9999, // pill-shaped tags/badges/status chips
  button: 16, // rounded-2xl
  card: 24, // rounded-[24px]
  sheet: 32, // modals / bottom sheets — rounded-[32px]
} as const;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const breakpoints = {
  small: 375,
  tablet: 768,
} as const;
