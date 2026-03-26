import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useMatchSessionStore } from '@/store/matchSessionStore';

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
  const params = useLocalSearchParams();
  const createSession = useMatchSessionStore((state) => state.createSession);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<MatchForm>({
    defaultValues: {
      sport: 'Football',
      totalPlayers: '16',
      minPlayers: '12',
      price: '',
      skillLevel: 'Open',
      description: '',
    }
  });

  const onSubmit = (data: MatchForm) => {
    // Basic Security Check: Min players cannot exceed total players
    if (parseInt(data.minPlayers) > parseInt(data.totalPlayers)) {
      Alert.alert("Invalid Logic", "Minimum players for 'Live' status cannot exceed total players.");
      return;
    }

    const newSession = {
      id: Math.random().toString(36).substring(7),
      venueId: params.venueId as string,
      venueName: params.venueName as string,
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
      status: 'pending' as const,
      playersJoined: 0,
    };

    createSession(newSession);
    Alert.alert("Success", "Match session is now live for registration!");
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* HEADER */}
        <View className="px-4 py-4 border-b border-slate-100 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">New Match Session</Text>
          <View className="w-10" /> 
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* SLOT SUMMARY CARD */}
          <View className="bg-slate-900 p-5 rounded-3xl mb-8 flex-row items-center justify-between">
            <View>
              <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Selected Slot</Text>
              <Text className="text-white text-lg font-bold mt-1">{params.startTime} - {params.endTime}</Text>
              <Text className="text-slate-400 text-xs">{params.date}</Text>
            </View>
            <FontAwesome5 name="calendar-check" size={24} color="#60a5fa" />
          </View>

          {/* FORM FIELDS */}
          <View className="space-y-6 pb-20">
            
            {/* Sport Selection */}
            <View>
              <Text className="text-slate-700 font-bold mb-2">Sport Type</Text>
              <Controller
                control={control}
                name="sport"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
                    placeholder="e.g. Football (7-a-side)"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            {/* Players Config */}
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className="text-slate-700 font-bold mb-2">Total Players</Text>
                <Controller
                  control={control}
                  name="totalPlayers"
                  render={({ field: { onChange, value } }) => (
                    <TextInput 
                      keyboardType="numeric"
                      className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              <View className="w-[48%]">
                <Text className="text-slate-700 font-bold mb-2">Min. to Go Live</Text>
                <Controller
                  control={control}
                  name="minPlayers"
                  render={({ field: { onChange, value } }) => (
                    <TextInput 
                      keyboardType="numeric"
                      className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            </View>

            {/* Pricing */}
            <View>
              <Text className="text-slate-700 font-bold mb-2">Price per Person (₹)</Text>
              <Controller
                control={control}
                name="price"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.price && <Text className="text-red-500 text-xs mt-1">Price is required</Text>}
            </View>

            {/* Description */}
            <View>
              <Text className="text-slate-700 font-bold mb-2">Match Rules / Notes</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    multiline
                    numberOfLines={4}
                    placeholder="e.g. We provide bibs. Please bring your own water."
                    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl h-32"
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>

        {/* FOOTER BUTTON */}
        <View className="p-6 border-t border-slate-100">
          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            className="bg-blue-600 py-5 rounded-2xl items-center shadow-lg shadow-blue-200"
          >
            <Text className="text-white font-bold text-lg">Publish Match Session</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}