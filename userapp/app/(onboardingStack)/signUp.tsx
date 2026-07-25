// app/(onboardingStack)/signUp.tsx
// Single-screen sign-up: replaces the old 3-step basicInfoRegisterOne/Two/Three
// flow as the primary entry point (those screens are left in place, unreferenced).
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');
const isTablet = width >= 500;

const INSIGHTS = [
  { icon: 'football', text: 'Live match scoring & stats' },
  { icon: 'calendar-check', text: 'Book venues in seconds' },
  { icon: 'trophy-variant', text: 'Join leagues & knockouts' },
  { icon: 'shield-check', text: 'Academy enrollment made easy' },
];

type FormData = {
  name: string;
  contact: string;
  city: string;
  dob: string;
  email: string;
  password: string;
};

function InsightTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % INSIGHTS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const current = INSIGHTS[index];

  return (
    <View className="h-8 items-center justify-center overflow-hidden">
      <Animated.View
        key={index}
        entering={FadeIn.duration(350)}
        exiting={FadeOut.duration(250)}
        className="flex-row items-center"
      >
        <MaterialCommunityIcons name={current.icon as any} size={16} color="#93c5fd" />
        <Text className="text-blue-100 text-sm font-semibold ml-2">{current.text}</Text>
      </Animated.View>
    </View>
  );
}

function FieldWrapper({
  label,
  icon,
  error,
  delay,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} className="mb-5">
      <Text className="text-slate-700 font-semibold mb-2 text-sm">{label}</Text>
      <View
        className={`flex-row items-center bg-slate-50 rounded-2xl border-2 px-4 ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      >
        <Ionicons name={icon} size={20} color={error ? '#f87171' : '#64748b'} />
        {children}
      </View>
      {!!error && <Text className="text-red-500 text-xs font-medium mt-1 ml-1">{error}</Text>}
    </Animated.View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.04, { duration: 1400 }), withTiming(1, { duration: 1400 })), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: '', contact: '', city: '', dob: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const [firstname, ...rest] = data.name.trim().split(/\s+/);
    const lastname = rest.join(' ') || firstname;

    setSubmitting(true);
    try {
      await register({
        firstname,
        lastname,
        email: data.email,
        contact: data.contact,
        city: data.city,
        dob: data.dob,
        password: data.password,
      });
      router.replace('/(homeScreenTabs)');
    } catch (err: any) {
      setSubmitError(err.message || 'Could not create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={30}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <LinearGradient colors={['#0F172A', '#1e293b']} className="px-6 pt-6 pb-10 rounded-b-[40px]">
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={() => router.back()} className="p-1">
              <Ionicons name="chevron-back" size={26} color="white" />
            </Pressable>
            <Pressable onPress={() => router.push('/(onboardingStack)/login')}>
              <Text className="text-blue-300 font-semibold">Sign In</Text>
            </Pressable>
          </View>

          <Animated.View style={pulseStyle} className="mb-3">
            <View className="w-14 h-14 bg-blue-500/20 rounded-2xl items-center justify-center border border-blue-400/30">
              <MaterialCommunityIcons name="lightning-bolt" size={28} color="#60a5fa" />
            </View>
          </Animated.View>

          <Text
            style={{ fontSize: isTablet ? 36 : 28 }}
            className="text-white font-black leading-tight"
          >
            Create your{'\n'}Sportify account
          </Text>
          <Text className="text-slate-400 mt-2 text-sm">
            One step, and you're in — everything below powers your profile.
          </Text>

          <View className="mt-6 bg-white/5 rounded-2xl py-3 border border-white/10">
            <InsightTicker />
          </View>
        </LinearGradient>

        {/* Form */}
        <View className="px-6 pt-8">
          <FieldWrapper label="Full Name" icon="person-outline" error={errors.name?.message} delay={50}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="Your full name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Phone Number" icon="call-outline" error={errors.contact?.message} delay={100}>
            <Text className="text-slate-500 font-bold mr-1">+91</Text>
            <Controller
              control={control}
              name="contact"
              rules={{
                required: 'Phone number is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-2 text-base text-slate-900"
                  placeholder="10-digit number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="City" icon="business-outline" error={errors.city?.message} delay={150}>
            <Controller
              control={control}
              name="city"
              rules={{ required: 'City is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="e.g. Mumbai"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Date of Birth" icon="calendar-outline" error={errors.dob?.message} delay={200}>
            <Controller
              control={control}
              name="dob"
              rules={{
                required: 'Date of birth is required',
                pattern: { value: /^\d{2}-\d{2}-\d{4}$/, message: 'Use dd-mm-yyyy format' },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="dd-mm-yyyy"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="next"
                  value={value}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, '');
                    let formatted = digits;
                    if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                    if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
                    onChange(formatted);
                  }}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Email" icon="mail-outline" error={errors.email?.message} delay={250}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="you@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Password" icon="lock-closed-outline" error={errors.password?.message} delay={300}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="Choose a password"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
            </Pressable>
          </FieldWrapper>

          {!!submitError && (
            <Animated.View entering={FadeIn} className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm font-medium text-center">{submitError}</Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              activeOpacity={0.85}
              className="bg-blue-600 rounded-2xl py-5 items-center shadow-lg shadow-blue-300 mt-2"
            >
              <Text className="text-white font-black text-lg">
                {submitting ? 'Creating your account…' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <Text className="text-slate-400 text-xs text-center mt-4 px-4 leading-5">
              By continuing you agree to Sportify's Terms of Service and Privacy Policy.
            </Text>

            <Pressable onPress={() => router.push('/(onboardingStack)/login')} className="items-center py-5">
              <Text className="text-slate-600">
                Already have an account? <Text className="text-blue-600 font-bold">Sign In</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
