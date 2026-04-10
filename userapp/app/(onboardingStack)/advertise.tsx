import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure expo-linear-gradient is installed

const SLIDES = [
  require('@/assets/images/advertiseImage2.png'),
  require('@/assets/images/advertiseImage1.png'),
  require('@/assets/images/advertiseImage3.png'),
];

function useResponsive() {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  return { width, height, isTablet };
}

export default function OnboardingScreen() {
  const { width, height, isTablet } = useResponsive();

  const handleStartJourney = useCallback(() => {
    router.navigate('/(onboardingStack)/welcome');
  }, []);

  const logoSize = isTablet ? height * 0.15 : height * 0.10;
  const middleW = width * (isTablet ? 0.40 : 0.48);
  const middleH = height * (isTablet ? 0.65 : 0.60);
  const sideW = middleW * 0.9;
  const sideH = middleH * 1;

  return (
    <View className="flex-1 bg-white"> 
      {/* Background Glow */}
      <View 
        style={[styles.glow, { top: height * 0.3, left: width * 0.1 }]} 
        className="absolute w-64 h-64 bg-white rounded-full blur-3xl" 
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 flex-col justify-between">

          {/* ── 1. Logo Section ── */}
          <View  className="mt-4 items-center justify-center  self-center relative h-1/6 w-1/2">
            <View className="w-full h-full ">
              <Image
                source={require('@/assets/images/app_name.jpeg')}
                className="w-full h-full rounded-2xl"
                resizeMode="contain"
              />
              <Text
                className="absolute bottom-8 right-8 font-black italic text-black tracking-tighter"
                style={{ fontSize: isTablet ? 22 : 18 }}
              >
                Be a Sport
              </Text>
            </View>
          </View>

          {/* ── 2. 3D Image Stack ── */}
          <View className="flex-1 items-center justify-center">
            <View className="flex-row items-center justify-center px-4">
              
     
              <View
                style={{
                  width: sideW,
                  height: sideH,
                  borderRadius: 24,
                  marginRight: -width * 0.2,
                  zIndex: 1,
                  opacity: 0.4,
                  transform: [{ perspective: 1000 }, { rotateY: '25deg' }, { scale: 0.9 }],
                  backgroundColor: '#1e293b',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                className="overflow-hidden shadow-2xl"
              >
                <Image source={SLIDES[0]} className="w-full h-full" resizeMode="cover" />
              </View>

              {/* Center Hero Slide */}
              <View
                style={{
                  width: middleW,
                  height: middleH,
                  borderRadius: 32,
                  zIndex: 10,
                  transform: [{ scale: 1.05 }],
                  backgroundColor: '#1e293b',
                  borderWidth: 1.5,
                  borderColor: 'rgba(96, 165, 250, 0.3)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.4,
                  shadowRadius: 30,
                  elevation: 20,
                }}
                className="overflow-hidden"
              >
                <Image source={SLIDES[1]} className="w-full h-full" resizeMode="cover" />
              </View>

              {/* Right Slide */}
              <View
                style={{
                  width: sideW,
                  height: sideH,
                  borderRadius: 24,
                  marginLeft: -width * 0.2,
                  zIndex: 1,
                  opacity: 0.4,
                  transform: [{ perspective: 1000 }, { rotateY: '-25deg' }, { scale: 0.9 }],
                  backgroundColor: '#1e293b',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                className="overflow-hidden shadow-2xl"
              >
                <Image source={SLIDES[2]} className="w-full h-full" resizeMode="cover" />
              </View>
            </View>
          </View>

          {/* ── 3. Action Section ── */}
          <View className="px-8 pb-10 items-center">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleStartJourney}
              style={{ width: isTablet ? 400 : '100%' }}
            >
              <LinearGradient
                colors={['#60a5fa', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text
                  className="text-[#0f172a] text-center font-black uppercase tracking-[2px]"
                  style={{ fontSize: isTablet ? 20 : 16 }}
                >
                  Continue Journey
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="mt-6 flex-row items-center">
              <View className="h-[1px] w-8 bg-slate-700" />
              <Text className="text-slate-500 mx-3 font-medium uppercase tracking-widest text-[10px]">
                The Digital Backbone
              </Text>
              <View className="h-[1px] w-8 bg-slate-700" />
            </View>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  }
});