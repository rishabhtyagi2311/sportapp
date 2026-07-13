import React, { FC } from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import FadeInView from '@/components/animated/FadeInView';
import AnimatedPressable from '@/components/animated/AnimatedPressable';

const FEATURE_CHIPS = ['Venues', 'Slots', 'Academies', 'Bookings', 'Match Sessions'];

const FEATURES: { icon: string; title: string; desc: string }[] = [
  {
    icon: 'office-building-marker-outline',
    title: 'Venue Management',
    desc: 'List courts and turfs with automated slot scheduling that stays in sync in real time.',
  },
  {
    icon: 'account-group-outline',
    title: 'Academy Suite',
    desc: 'Students, coaches, attendance, photos and certificates — all in one place.',
  },
  {
    icon: 'account-multiple-plus-outline',
    title: 'Match Sessions',
    desc: 'Open up shared slots for players to join and fill your off-peak hours.',
  },
  {
    icon: 'calendar-check-outline',
    title: 'Booking Requests',
    desc: 'Approve, track and manage every reservation from a single dashboard.',
  },
];

const FeatureCard: FC<{ icon: string; title: string; desc: string; isTablet: boolean; delay: number }> = ({
  icon,
  title,
  desc,
  isTablet,
  delay,
}) => (
  <FadeInView delay={delay} style={{ width: isTablet ? '48%' : '100%' }}>
    <View className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-start">
      <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
        <MaterialCommunityIcons name={icon as any} size={22} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-base mb-1">{title}</Text>
        <Text className="text-slate-500 text-sm leading-5 font-medium">{desc}</Text>
      </View>
    </View>
  </FadeInView>
);

const WelcomeScreen: FC = () => {
  const router = useRouter();
  const { isTablet } = useResponsive();

  const handleSignUp = () => router.push('/(onboardingStack)/basicInfoRegisterOne' as any);
  const handleSignIn = () => router.push('/(onboardingStack)/login' as any);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HERO */}
        <View className="bg-slate-900 pt-6 pb-10 px-6 rounded-b-[40px] shadow-lg">
          <View className={isTablet ? 'self-center w-full max-w-2xl' : 'w-full'}>
            <FadeInView direction="none" className="items-center mb-6">
              <View className="bg-white rounded-3xl px-5 py-3 shadow-sm">
                <Image
                  source={require('@/assets/images/app_name.jpeg')}
                  style={{ width: isTablet ? 220 : 160, height: isTablet ? 62 : 44, resizeMode: 'contain' }}
                />
              </View>
            </FadeInView>

            <FadeInView delay={60}>
              <Text
                style={{ fontSize: isTablet ? 40 : 32 }}
                className="font-black text-white text-center leading-tight"
              >
                Run your sports business,{'\n'}
                <Text className="text-blue-400">effortlessly.</Text>
              </Text>
              <Text className="text-slate-400 text-center mt-4 font-medium px-4">
                The command center for venue owners and academy managers.
              </Text>
            </FadeInView>

            <FadeInView delay={110} direction="none" className="flex-row flex-wrap justify-center mt-6">
              {FEATURE_CHIPS.map((label) => (
                <View key={label} className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 mr-2 mb-2">
                  <Text className="text-slate-200 text-[11px] font-bold">{label}</Text>
                </View>
              ))}
            </FadeInView>
          </View>
        </View>

        <View className="px-6 -mt-2">
          <View className={isTablet ? 'self-center w-full max-w-2xl' : 'w-full'}>
            {/* CTAs */}
            <FadeInView delay={150} className="mt-8 mb-8">
              <AnimatedPressable
                onPress={handleSignUp}
                className="bg-blue-600 w-full py-5 rounded-2xl items-center flex-row justify-center shadow-md"
              >
                <Text className="text-white font-black text-base mr-2">Create Partner Account</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
              </AnimatedPressable>

              <AnimatedPressable
                onPress={handleSignIn}
                className="w-full py-5 rounded-2xl items-center flex-row justify-center mt-3 border border-slate-200 bg-white"
              >
                <Text className="text-slate-700 font-bold text-base">Already a partner? </Text>
                <Text className="text-blue-600 font-black text-base">Sign In</Text>
              </AnimatedPressable>
            </FadeInView>

            {/* FEATURES */}
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              Everything you need
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} {...f} isTablet={isTablet} delay={200 + i * 50} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
