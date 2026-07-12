import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useMatchSessionStore } from '@/store/matchSessionStore';
import { useResponsive } from '@/hooks/useResponsive';
import FadeInView from '@/components/animated/FadeInView';
import AnimatedPressable from '@/components/animated/AnimatedPressable';

interface MatchForm {
  sport: string;
  totalPlayers: string;
  minPlayers: string;
  price: string;
  skillLevel: string;
  description: string;
}

export default function CreateMatchSession() {
  const router = useRouter();
  const { isTablet } = useResponsive();
  const params = useLocalSearchParams();
  const createSession = useMatchSessionStore((state) => state.createSession);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<MatchForm>({
    defaultValues: {
      sport: 'Football',
      totalPlayers: '14',
      minPlayers: '10',
      price: '',
      skillLevel: 'Intermediate',
      description: '',
    }
  });

  const currentSkill = watch('skillLevel');

  const onSubmit = async (data: MatchForm) => {
    if (parseInt(data.minPlayers) > parseInt(data.totalPlayers)) {
      Alert.alert("Logic Error", "Min players cannot be higher than total players.");
      return;
    }

    setSubmitting(true);
    try {
      await createSession({
        venueId: params.venueId as string,
        slotId: params.slotId as string,
        date: params.date as string,
        startTime: params.startTime as string,
        endTime: params.endTime as string,
        sport: data.sport,
        totalPlayers: parseInt(data.totalPlayers),
        minPlayersForLive: parseInt(data.minPlayers),
        pricePerPerson: parseFloat(data.price),
        skillLevel: data.skillLevel as any,
        description: data.description,
      });
      Alert.alert("Success", "Match published successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Failed to Publish", err.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* MODAL HEADER */}
        <View className="px-6 py-4 bg-white flex-row items-center justify-between shadow-sm">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-100 p-2 rounded-full"
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Create Session</Text>
          <View className="w-10" /> 
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
        <FadeInView className={isTablet ? 'self-center w-full max-w-xl' : 'w-full'}>

          {/* INFO CARD */}
          <View className="bg-slate-900 p-6 rounded-[32px] mb-8 shadow-xl shadow-slate-900">
            <View className="flex-row items-center space-x-3 mb-4">
               <View className="bg-white/20 p-2 rounded-xl">
                 <Ionicons name="calendar" size={20} color="white" />
               </View>
               <Text className="text-white/80 font-medium">{params.date}</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{params.startTime} - {params.endTime}</Text>
            <Text className="text-slate-900 mt-1 opacity-80">{params.venueName || 'Premium Turf Center'}</Text>
          </View>

          <View className="space-y-8">
            {/* SPORT TYPE */}
            <View>
              <Label text="What are we playing?" />
              <Controller
                control={control}
                name="sport"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1">
                    <MaterialCommunityIcons name="soccer" size={20} color="#6366f1" />
                    <TextInput 
                      className="flex-1 p-4 text-slate-900 font-medium"
                      placeholder="e.g. Football (7v7)"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
            </View>

            {/* SKILL LEVEL CHIPS */}
            <View>
              <Label text="Skill Level" />
              <View className="flex-row flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Advanced', 'Open'].map((level) => (
                  <TouchableOpacity 
                    key={level}
                    onPress={() => setValue('skillLevel', level)}
                    className={`px-5 py-3 rounded-full border ${currentSkill === level ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                  >
                    <Text className={`font-semibold ${currentSkill === level ? 'text-white' : 'text-slate-500'}`}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PLAYER CONFIG & PRICING */}
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Label text="Capacity" />
                <Controller
                  control={control}
                  name="totalPlayers"
                  render={({ field: { onChange, value } }) => (
                    <InputWithIcon icon="people" value={value} onChangeText={onChange} keyboardType="numeric" />
                  )}
                />
              </View>
              <View className="w-[48%]">
                <Label text="Price (₹)" />
                <Controller
                  control={control}
                  name="price"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <InputWithIcon icon="cash-outline" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0.00" />
                  )}
                />
              </View>
            </View>

            {/* DESCRIPTION */}
            <View>
              <Label text="Match Details" />
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    multiline
                    numberOfLines={4}
                    placeholder="Rules, bibs info, or parking details..."
                    className="bg-white border border-slate-200 p-4 rounded-2xl h-32 text-slate-900"
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
          <View className="h-10" />
        </FadeInView>
        </ScrollView>

        {/* FLOATING FOOTER */}
        <View className="px-6 py-6 bg-white border-t border-slate-100 shadow-2xl items-center">
          <AnimatedPressable
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            className={`bg-slate-900 py-5 rounded-2xl items-center shadow-lg shadow-slate-900 ${isTablet ? 'w-96' : 'w-full'}`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Publish Match</Text>
            )}
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const Label = ({ text }: { text: string }) => (
  <Text className="text-slate-500 font-bold mb-3 uppercase text-[11px] tracking-wider ml-1">{text}</Text>
);

const InputWithIcon = ({ icon, ...props }: any) => (
  <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1">
    <Ionicons name={icon} size={18} color="#6366f1" />
    <TextInput className="flex-1 p-4 text-slate-900 font-bold" {...props} />
  </View>
);