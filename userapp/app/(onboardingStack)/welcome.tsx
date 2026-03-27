import React, { FC, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Refined Premium Palette (Tailwind-aligned)
const COLORS = {
  bgDark: '#0F172A', // Slate-900
  accentBlue: '#7DD3FC', // Blue-300
  white: '#FFFFFF',
  glassWhite: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  textMain: '#1E293B',
  textMuted: '#64748B',
  success: '#10B981',
};

const AnimatedBubble: FC<{
  size: number;
  color: string;
  delay: number;
  left: number;
}> = ({ size, color, delay, left }) => {
  const yPosition = useSharedValue(-size);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    yPosition.value = withRepeat(
      withTiming(height + size, {
        duration: 18000 + delay * 1000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      false
    );
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: yPosition.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left,
          // Premium Glow effect
          shadowColor: color,
          shadowRadius: 40,
          shadowOpacity: 0.4,
        },
        bubbleStyle,
      ]}
    />
  );
};

const HeroSection: FC = () => {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <Animated.View style={[animatedStyle]} className="items-center mb-10 mt-4">
      <Image
        source={require("@/assets/images/app_name.jpeg")}
        style={{ width: 180, height: 60, resizeMode: 'contain', marginBottom: 20 }}
      />
      <View className="items-center">
        <Text className="text-5xl font-extrabold text-slate-900 tracking-tighter text-center">
          Elevate Your
        </Text>
        <Text className="text-5xl font-extrabold text-blue-500 tracking-tighter text-center">
          Athletic Life.
        </Text>
      </View>
    </Animated.View>
  );
};

const CreateAccountSection: FC<{ onSignUp: () => void }> = ({ onSignUp }) => {
  return (
    <View style={styles.glassContainer} className="rounded-[40px] p-8 border border-white/40 shadow-2xl overflow-hidden">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-slate-900 mb-2">Get Started</Text>
        <Text className="text-slate-500 font-medium">Experience the future of sports management.</Text>
      </View>

      <View className="space-y-4 mb-8">
        {[
          { icon: 'star-four-points', text: 'Elite Academy Access', color: '#8B5CF6' },
          { icon: 'map-marker-radius', text: 'Instant Venue Booking', color: '#3B82F6' },
          { icon: 'trophy-outline', text: 'Global Tournaments', color: '#F59E0B' },
        ].map((item, idx) => (
          <View key={idx} className="flex-row items-center bg-slate-50/80 p-4 rounded-2xl mb-3">
            <View className="bg-white p-2 rounded-xl shadow-sm mr-4">
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text className="text-slate-700 font-semibold text-base">{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onSignUp}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        className="bg-slate-900 rounded-2xl py-5 items-center flex-row justify-center"
      >
        <Text className="text-white font-bold text-lg mr-2">Create Account</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
      </Pressable>
    </View>
  );
};

const NavigationSection: FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  return (
    <View className="absolute bottom-10 left-0 right-0 px-8">
      <Pressable
        onPress={onSignIn}
        style={({ pressed }) => [{ 
          backgroundColor: pressed ? 'rgba(255,255,255,0.9)' : 'white',
          transform: [{ scale: pressed ? 0.98 : 1 }] 
        }]}
        className="rounded-3xl py-4 flex-row items-center justify-center border border-slate-200 shadow-xl"
      >
        <MaterialCommunityIcons name="account-circle-outline" size={24} color="#0F172A" className="mr-3" />
        <View className="ml-3">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Welcome Back</Text>
          <Text className="text-slate-900 text-base font-black">Sign In to Dashboard</Text>
        </View>
      </Pressable>
    </View>
  );
};

const WelcomeScreen: FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Premium Mesh Gradient Background */}
      <LinearGradient
        colors={['#F8FAFC', '#E0F2FE', '#DBEAFE']}
        className="absolute inset-0"
      />

      {/* Ambient Animated Lights */}
      <View className="absolute inset-0 overflow-hidden">
        <AnimatedBubble size={250} color="#7DD3FC" delay={0} left={-100} />
        <AnimatedBubble size={200} color="#BAE6FD" delay={2} left={width - 150} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 180 }}
      >
        <HeroSection />
        <CreateAccountSection onSignUp={() => router.push('/(homeScreenTabs)')} />
      </ScrollView>

      <NavigationSection onSignIn={() => router.push('/(onboardingStack)/basicInfoRegisterOne')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: COLORS.glassWhite,
 // For web/ios support if enabled
  },
});

export default WelcomeScreen;