import React, { FC, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  skyBlue: '#E0F2FE',
  navyBlue: '#0F172A',
  darkBrown: '#4B2E2B',
  white: '#FFFFFF',
  darkText: '#1E293B',
  brown200: '#A89878',
  brown300: '#8B7355',
  skyBlue300: '#7DD3FC',
  skyBlue400: '#38BDF8',
  navyBlue900: '#001F3F',
  cream: '#FFFAF5',
  darkNavy: '#0A0E1F',
  lightBrown: '#D4B5A0',
  logoRed: '#FF4B4B',
  logoGreen: '#4EAE6E',
};

// Smooth Animated Bubble with Continuous Motion
const AnimatedBubble: FC<{
  size: number;
  color: string;
  delay: number;
  left: number;
}> = ({ size, color, delay, left }) => {
  const yPosition = useSharedValue(-size);

  useEffect(() => {
    yPosition.value = withRepeat(
      withTiming(height + size, {
        duration: 12000 + delay * 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: yPosition.value }],
  }));

  return (
    <Animated.View
      className="absolute rounded-full"
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          left,
          opacity: 0.12,
        },
        bubbleStyle,
      ]}
    />
  );
};

// Sportify Logo
const SportifyLogo: FC = () => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[logoStyle]} className="flex-row items-center gap-3 mb-5">
      <View className="w-13 h-13 bg-green-500 rounded-lg justify-center items-center">
        <MaterialCommunityIcons name="trophy" size={32} color={COLORS.white} />
      </View>
      <View>
        <Text className="text-2xl font-black tracking-tighter">
          <Text style={{ color: COLORS.logoRed }}>Spor</Text>
          <Text style={{ color: COLORS.logoGreen }}>tif</Text>
          <Text style={{ color: COLORS.logoRed }}>y</Text>
        </Text>
        <Text className="text-xs font-semibold tracking-wide" style={{ color: COLORS.skyBlue400 }}>
          Your Sports Companion
        </Text>
      </View>
    </Animated.View>
  );
};

// Hero Section
const HeroSection: FC = () => {
  const titleScale = useSharedValue(0.9);
  const titleOpacity = useSharedValue(0);
  const descriptionTranslateY = useSharedValue(20);
  const descriptionOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    titleOpacity.value = withTiming(1, { duration: 900 });
    descriptionTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) });
    descriptionOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: descriptionTranslateY.value }],
    opacity: descriptionOpacity.value,
  }));

  return (
    <View className="items-center mb-8">
      <SportifyLogo />

      <Animated.View style={[titleStyle]} className="mb-4">
        <Text className="text-5xl font-black text-white text-center leading-tight tracking-tight">
          Play.
        </Text>
        <Text className="text-5xl font-black text-white text-center leading-tight tracking-tight">
          Train.
          <Text style={{ color: COLORS.logoGreen }}> Win.</Text>
        </Text>
      </Animated.View>

      <Animated.View style={descStyle}>
        <Text className="text-base text-center font-medium leading-6" style={{ color: COLORS.skyBlue300 }}>
          One platform. Academies. Venues. Tournaments.
        </Text>
      </Animated.View>
    </View>
  );
};

// Feature Blob Component
const FeatureBlob: FC<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  gradientStart: string;
  gradientEnd: string;
  rotation?: number;
}> = ({
  title,
  description,
  icon,
  gradientStart,
  gradientEnd,
  rotation = 0,
}) => {
  const translateX = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[cardStyle]} className="w-full my-4">
      <View
        className="rounded-3xl p-6 min-h-56 justify-between overflow-hidden"
        style={[
          {
            backgroundColor: gradientStart,
            borderColor: gradientEnd,
            borderWidth: 2,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
        {/* Corner Decorations */}
        <View
          className="absolute top-0 left-0 w-10 h-10"
          style={{ backgroundColor: gradientEnd }}
        />
        <View
          className="absolute bottom-0 right-0 w-10 h-10"
          style={{ backgroundColor: gradientEnd }}
        />

        {/* Icon Container */}
        <View
          className="w-18 h-18 rounded-2xl justify-center items-center mb-4"
          style={{ backgroundColor: gradientEnd }}
        >
          <MaterialCommunityIcons name={icon} size={48} color={COLORS.white} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-2xl font-black mb-2 text-white leading-8">
            {title}
          </Text>
          <Text
            className="text-sm font-medium leading-6"
            style={{ color: `${COLORS.white}E6` }}
          >
            {description}
          </Text>
        </View>

        {/* Accent Line */}
        <View
          className="h-1 mt-4 rounded-full w-1/4"
          style={{ backgroundColor: gradientEnd }}
        />
      </View>
    </Animated.View>
  );
};

// Stats Showcase
const StatsSection: FC = () => {
  const stats = [
    { number: '500+', label: 'Academies', color: COLORS.logoGreen },
    { number: '1K+', label: 'Venues', color: COLORS.skyBlue400 },
    { number: '50K+', label: 'Players', color: COLORS.logoRed },
  ];

  return (
    <View className="flex-row justify-between gap-3 my-7">
      {stats.map((stat, index) => (
        <Animated.View
          key={index}
          className="flex-1 py-5 px-3 bg-amber-50 rounded-2xl items-center"
          style={{
            borderTopColor: stat.color,
            borderTopWidth: 4,
          }}
        >
          <Text className="text-2xl font-black mb-1" style={{ color: stat.color }}>
            {stat.number}
          </Text>
          <Text className="text-xs font-semibold" style={{ color: COLORS.darkText }}>
            {stat.label}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Navigation Section - Premium Design
const NavigationSection: FC<{
  onSignUp: () => void;
  onSignIn: () => void;
}> = ({ onSignUp, onSignIn }) => {
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    containerOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[containerStyle]} className="absolute bottom-0 left-0 right-0 px-6 py-6" >
      <View className="flex-row gap-4">
        {/* Sign Up Card */}
        <Pressable
          onPress={onSignUp}
          className="flex-1 rounded-2xl py-6 items-center justify-center min-h-40 border-2 active:opacity-70"
          style={{
            backgroundColor: COLORS.logoGreen,
            borderColor: COLORS.logoGreen,
          }}
        >
          <View className="w-14 h-14 bg-green-600 rounded-lg justify-center items-center mb-3">
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={32}
              color={COLORS.white}
            />
          </View>
          <Text className="text-base font-black text-white text-center">Get Started</Text>
          <Text className="text-xs font-semibold mt-1" style={{ color: COLORS.logoGreen }}>
            Create Account
          </Text>
        </Pressable>

        {/* Sign In Card */}
        <Pressable
          onPress={onSignIn}
          className="flex-1 rounded-2xl py-6 items-center justify-center min-h-40 border-2 active:opacity-70"
          style={{
            backgroundColor: COLORS.skyBlue,
            borderColor: COLORS.skyBlue400,
          }}
        >
          <View className="w-14 h-14 bg-sky-400 rounded-lg justify-center items-center mb-3">
            <MaterialCommunityIcons
              name="login-variant"
              size={32}
              color={COLORS.white}
            />
          </View>
          <Text className="text-base font-black text-center" style={{ color: COLORS.navyBlue }}>
            Welcome Back
          </Text>
          <Text className="text-xs font-semibold mt-1" style={{ color: COLORS.skyBlue400 }}>
            Sign In
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

// Main Welcome Screen
const WelcomeScreen: FC = () => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.darkNavy }}>
      {/* Animated Background Bubbles */}
      <View className="absolute w-full h-full overflow-hidden">
        <AnimatedBubble size={100} color={COLORS.logoRed} delay={0} left={10} />
        <AnimatedBubble size={80} color={COLORS.logoGreen} delay={2} left={width - 90} />
        <AnimatedBubble size={120} color={COLORS.skyBlue400} delay={4} left={width / 2 - 60} />
        <AnimatedBubble size={90} color={COLORS.logoRed} delay={1} left={width - 100} />
        <AnimatedBubble size={110} color={COLORS.logoGreen} delay={3} left={20} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 240 }}
      >
        <HeroSection />
        <StatsSection />

        <View className="my-4">
          <Text className="text-2xl font-black text-white">Everything You Need</Text>
        </View>

        <FeatureBlob
          title="Academies"
          description="Find elite training centers, book demos, track progress, and build champions."
          icon="school"
          gradientStart={COLORS.logoGreen}
          gradientEnd={COLORS.logoGreen}
          rotation={-2}
        />

        <View className="flex-row gap-3 my-4">
          <View className="flex-1">
            <FeatureBlob
              title="Venues"
              description="Book grounds, check slots instantly"
              icon="map-marker-multiple"
              gradientStart={COLORS.skyBlue400}
              gradientEnd={COLORS.skyBlue400}
              rotation={2}
            />
          </View>
          <View className="flex-1">
            <FeatureBlob
              title="Tournaments"
              description="Create leagues and compete"
              icon="trophy-outline"
              gradientStart={COLORS.logoRed}
              gradientEnd={COLORS.logoRed}
              rotation={-2}
            />
          </View>
        </View>

        <FeatureBlob
          title="Live Scoring"
          description="Real-time match updates with live scoring boards and instant standings"
          icon="scoreboard"
          gradientStart={COLORS.brown300}
          gradientEnd={COLORS.brown300}
          rotation={1}
        />

        <View className="h-10" />
      </ScrollView>

      <NavigationSection onSignUp={handleSignUp} onSignIn={handleSignIn} />
    </SafeAreaView>
  );
};

export default WelcomeScreen;