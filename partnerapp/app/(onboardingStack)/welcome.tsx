import React, { FC, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

// ✅ MOVED OUTSIDE - Animated Bubble
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
        duration: 15000 + delay * 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [delay]);

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
          opacity: 0.08,
        },
        bubbleStyle,
      ]}
    />
  );
};

// ✅ MOVED OUTSIDE - Sportify Logo
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
    <Animated.View style={[logoStyle]} className="mb-5 -mt-12 items-center">
      <Image
        source={require("@/assets/images/app_name.jpeg")}
        style={{ width: 200, height: 100, resizeMode: 'contain' }}
      />
    </Animated.View>
  );
};

// ✅ MOVED OUTSIDE - Hero Section
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
        <Text className="text-4xl font-black text-slate-900 text-center leading-tight tracking-tight">
          Register.
        </Text>
        <Text className="text-4xl font-black text-sky-500 text-center leading-tight tracking-tight">
          Manage.
          <Text style={{ color: COLORS.logoGreen }}> Earn.</Text>
        </Text>
      </Animated.View>
      <Animated.View style={descStyle}>
        <Text className="text-base text-center font-medium leading-6 text-sky-700">
          Manage Your Academies and Sport Venues. 
        </Text>
      </Animated.View>
    </View>
  );
};

// ✅ MOVED OUTSIDE - Create Account Section
const CreateAccountSection: FC<{ onSignUp: () => void }> = ({ onSignUp }) => {
  const containerOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.95);

  useEffect(() => {
    containerOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    containerScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View style={[containerStyle]} className="my-8">
      <View
        className="rounded-3xl p-8 border-2 overflow-hidden"
        style={{
          backgroundColor: `${COLORS.white}08`,
          borderColor: COLORS.skyBlue400,
        }}
      >
        <View
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: COLORS.logoGreen }}
        />

        <View className="mb-4 mx-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-black text-green-600">Start the Journey</Text>
          </View>
        </View>

        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          {[
            { icon: 'check-circle' as const, text: 'Manage Sports Academies' },
            { icon: 'check-circle' as const, text: 'Get Bookings for your Venues' },
            { icon: 'check-circle' as const, text: 'Digitalize your Sports Journey' },
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center gap-3 py-2">
              <MaterialCommunityIcons name={item.icon} size={18} color={COLORS.logoGreen} />
              <Text className="text-xs font-semibold flex-1" style={{ color: COLORS.skyBlue300 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onSignUp}
          className="rounded-xl py-4 items-center justify-center active:opacity-80 overflow-hidden"
          style={{ backgroundColor: COLORS.logoGreen }}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-black text-white">Create Account</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
};



// ✅ MOVED OUTSIDE - Navigation Section
const NavigationSection: FC<{
  onSignIn: () => void;
}> = ({ onSignIn }) => {
  const containerOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    containerOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    buttonScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.View style={[containerStyle]} className="absolute bottom-0 left-0 right-0 px-6 py-6 mb-6">
      <Animated.View style={[buttonStyle]}>
        <Pressable
          onPress={onSignIn}
          className="rounded-2xl py-5 px-6 items-center justify-center overflow-hidden active:opacity-75"
          style={{
            backgroundColor: COLORS.white,
            shadowColor: COLORS.logoGreen,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 15,
          }}
        >
          <View className="flex-row items-center gap-3 justify-center ">
            <MaterialCommunityIcons name="login-variant" size={22} color={COLORS.logoGreen} />
            <View>
              <Text className="text-xs font-semibold" style={{ color: COLORS.skyBlue400 }}>
                Welcome Back
              </Text>
              <Text className="text-sm font-black" style={{ color: COLORS.navyBlue }}>
                Sign In
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

// ✅ MAIN COMPONENT - Now clean and simple
const WelcomeScreen: FC = () => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/(onboardingStack)/basicInfoRegisterOne');
  };

  const handleSignIn = () => {
    router.push('/(homeScreenTabs)');
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Gradient Background */}
      <LinearGradient
        colors={['#FFFFFF', '#E0F2FE', '#7DD3FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Animated Bubbles */}
      <View className="absolute w-full h-full overflow-hidden">
        <AnimatedBubble size={150} color={COLORS.logoGreen} delay={0} left={-20} />
        <AnimatedBubble size={120} color={COLORS.skyBlue400} delay={2} left={width - 80} />
        <AnimatedBubble size={100} color={COLORS.logoGreen} delay={4} left={width / 2 - 50} />
        <AnimatedBubble size={130} color={COLORS.skyBlue400} delay={1} left={width - 120} />
        <AnimatedBubble size={110} color={COLORS.logoGreen} delay={3} left={30} />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 240 }}
      >
        <HeroSection />
        <CreateAccountSection onSignUp={handleSignUp} />

        

     
      </ScrollView>

      <NavigationSection onSignIn={handleSignIn} />
    </SafeAreaView>
  );
};

export default WelcomeScreen;