import React, { FC, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Dimensions,
  Image,
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

const responsiveFontSize = (f: number) => (isTablet ? f * 1.3 : f);

const COLORS = {
  navy900: '#0F172A',
  emerald600: '#059669',
  sky400: '#38BDF8',
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
      <View className="bg-white rounded-3xl p-4 mb-8 mt-10 shadow-sm border border-slate-100">
        <Image
          source={require("@/assets/images/app_name.jpeg")}
          style={{ width: isTablet ? 280 : 180, height: isTablet ? 80 : 50, resizeMode: 'contain' }}
        />
      </View>
      
      <View className="px-4">
        <Text 
          style={{ fontSize: responsiveFontSize(40) }} 
          className="font-black text-slate-900 leading-none text-center tracking-tight"
        >
          Scale Your{"\n"}
          <Text className="text-emerald-600">Sports Business.</Text>
        </Text>
        <Text 
          style={{ fontSize: responsiveFontSize(16) }}
          className="text-slate-500 text-center mt-4 font-medium px-6"
        >
          The professional command center for academy owners and venue managers.
        </Text>
      </View>
    </Animated.View>
  );
};

const FeatureCard: FC<{ icon: string, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
  <View 
    style={{ width: isTablet ? '48%' : '100%' }} 
    className="bg-white p-6 rounded-3xl mb-4 border border-slate-100 shadow-sm"
  >
    <View style={{ backgroundColor: color + '15' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-4">
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <Text className="text-slate-900 font-bold text-lg mb-1">{title}</Text>
    <Text className="text-slate-500 text-sm leading-5 font-medium">{desc}</Text>
  </View>
);

const WelcomeScreen: FC = () => {
  const router = useRouter();

  const handleSignUp = () => router.push('/(homeScreenTabs)');
  const handleSignIn = () => router.push('/(homeScreenTabs)');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Mesh Gradient Background */}
      <LinearGradient colors={['#F8FAFC', '#ECFDF5', '#F1F5F9']} className="absolute inset-0" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: isTablet ? 40 : 20, paddingBottom: 220 }}
      >
        <HeroSection />

        {/* Partner Stats Bar - Demonstrating Value */}
        <View className="flex-row justify-between bg-emerald-900 rounded-3xl p-6 mb-8 shadow-xl">
          {[
            { label: 'Market Growth', val: '15%↑' },
            { label: 'Active Partners', val: '200+' },
            { label: 'Booking Rate', val: '88%' }
          ].map((s, i) => (
            <View key={i} className="items-center flex-1">
              <Text className="text-emerald-400 font-black text-xl">{s.val}</Text>
              <Text className="text-emerald-100/60 text-[9px] uppercase font-bold tracking-widest">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Create Account Section */}
        <View className="mt-4 bg-emerald-600 rounded-[40px] p-8 items-center shadow-2xl">
          <Text className="text-white text-2xl font-black text-center mb-2 italic uppercase">Join the Network</Text>
          <Text className="text-emerald-100 text-center mb-6 font-medium">Digitalize your operations and maximize your facility revenue.</Text>
          <Pressable 
            onPress={handleSignUp}
            className="bg-white w-full py-5 rounded-2xl items-center flex-row justify-center shadow-md active:opacity-90"
          >
            <Text className="text-emerald-600 font-black text-lg mr-2">CREATE PARTNER ACCOUNT</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#059669" />
          </Pressable>
        </View>

        {/* Partner Core Modules */}
        <Text className="text-slate-900 font-black text-xl mt-12 mb-6 px-2 italic uppercase">Operational Suite</Text>
        <View className="flex-row flex-wrap justify-between">
          <FeatureCard 
            icon="office-building-marker" 
            title="Venue Manager" 
            desc="Automated slot scheduling and real-time availability sync."
            color="#059669"
          />
          <FeatureCard 
            icon="account-tie" 
            title="Academy ERP" 
            desc="Centralized student database, fees, and attendance."
            color="#0891B2"
          />
          <FeatureCard 
            icon="finance" 
            title="Revenue Analytics" 
            desc="Daily earnings reports and automated UPI settlement."
            color="#0F172A"
          />
          <FeatureCard 
            icon="bullhorn-outline" 
            title="Promotions" 
            desc="Target active local athletes with custom membership plans."
            color="#7C3AED"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View 
        style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 40 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 pt-4 shadow-2xl"
      >
        <Pressable
          onPress={handleSignIn}
          className="flex-row items-center justify-center py-5 bg-slate-900 rounded-2xl shadow-lg"
        >
          <MaterialCommunityIcons name="login-variant" size={22} color="white" />
          <View className="ml-4">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Partner Login</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;