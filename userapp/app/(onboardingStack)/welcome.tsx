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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 500;

// Utility for responsive sizing
const scale = (size: number) => (width / 375) * size;
const responsiveFontSize = (f: number) => (isTablet ? f * 1.3 : f);

const COLORS = {
  bgDark: '#0F172A',
  accentBlue: '#3B82F6',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
};

const HeroSection: FC = () => {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <Animated.View style={[animatedStyle]} className="items-center mb-10 mt-6">
      <View className="bg-white  rounded-full mb-6 mt-10 shadow-sm">
        <Image
          source={require("@/assets/images/app_name.jpeg")}
          style={{ width: isTablet ? 280 : 160, height: isTablet ? 80 : 50, resizeMode: 'contain' }}
        />
      </View>
      
      <View className="px-4">
        <Text 
          style={{ fontSize: responsiveFontSize(42) }} 
          className="font-black text-slate-900 leading-none text-center tracking-tight"
        >
          Elevate Your{"\n"}
          <Text className="text-blue-600">Athletic Life.</Text>
        </Text>
        <Text 
          style={{ fontSize: responsiveFontSize(16) }}
          className="text-slate-500 text-center mt-4 font-medium px-6"
        >
          The all-in-one digital ecosystem for India's next generation of sports champions.
        </Text>
      </View>
    </Animated.View>
  );
};

const FeatureCard: FC<{ icon: string, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
  <View 
    style={{ width: isTablet ? '48%' : '100%' }} 
    className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm"
  >
    <View style={{ backgroundColor: color + '20' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-4">
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <Text className="text-slate-900 font-bold text-lg mb-1">{title}</Text>
    <Text className="text-slate-500 text-sm leading-5">{desc}</Text>
  </View>
);

const WelcomeScreen: FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']} className="absolute inset-0" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: isTablet ? 40 : 20, paddingBottom: 150 }}
      >
        <HeroSection />


         {/* Create Account CTA */}
        <View className="mt-8 bg-blue-600 rounded-[40px] p-8 items-center shadow-2xl">
          <Text className="text-white text-2xl font-bold text-center mb-2">Ready to Play?</Text>
          <Text className="text-blue-100 text-center mb-6">Join thousands of athletes and owners today.</Text>
          <Pressable 
            onPress={() => router.push('/(homeScreenTabs)')}
            className="bg-white w-full py-5 rounded-2xl items-center"
          >
            <Text className="text-blue-600 font-black text-lg">CREATE ACCOUNT</Text>
          </Pressable>
        </View>

        {/* Content Heavy Section: Stats Bar */}
        <View className="flex-row justify-between bg-slate-900 rounded-3xl p-6 mt-12 mb-8 shadow-xl">
          {[
            { label: 'Academies', val: '500+' },
            { label: 'Venues', val: '1.2k' },
            { label: 'Players', val: '50k+' }
          ].map((s, i) => (
            <View key={i} className="items-center flex-1">
              <Text className="text-blue-400 font-black text-xl">{s.val}</Text>
              <Text className="text-slate-400 text-[10px] uppercase tracking-widest">{s.label}</Text>
            </View>
          ))}
        </View>

       

       


         {/* Responsive Feature Grid */}
        <Text className="text-slate-900 font-bold text-xl mt-12 mb-4 px-2">Core Modules</Text>
        <View className="flex-row flex-wrap justify-between">
          <FeatureCard 
            icon="shield-check-outline" 
            title="Academy ERP" 
            desc="Complete management for enrollments, attendance, and fees."
            color="#8B5CF6"
          />
          <FeatureCard 
            icon="calendar-check" 
            title="Venue Engine" 
            desc="Real-time slot booking with automated UPI payouts."
            color="#3B82F6"
          />
          <FeatureCard 
            icon="trophy-variant" 
            title="Tournaments" 
            desc="Automated brackets, live scoring, and digital resumes."
            color="#F59E0B"
          />
          <FeatureCard 
            icon="account-group" 
            title="Sports Verse" 
            desc="Verified community for scouting and talent discovery."
            color="#10B981"
          />
        </View>
      </ScrollView>

      {/* Responsive Bottom Navigation */}
      <View 
        style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 60 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 pt-4"
      >
        <Pressable
          onPress={() => router.push('/(onboardingStack)/basicInfoRegisterOne')}
          className="flex-row items-center justify-center py-4 bg-slate-900 rounded-2xl"
        >
          <MaterialCommunityIcons name="login" size={20} color="white" />
          <Text className="text-white font-bold ml-3 text-lg">Sign In to Dashboard</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;