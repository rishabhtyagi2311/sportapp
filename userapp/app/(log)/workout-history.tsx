import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore, WorkoutEntry } from '@/store/HealthLogStore';

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { workoutHistory, isLoading, fetchWorkoutHistory } = useHealthStore();

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const renderItem = ({ item }: { item: WorkoutEntry }) => {
    const date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
      <View className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white font-bold text-base">{date}</Text>
            <Text className="text-cyan-400 text-xs font-bold uppercase mt-0.5">{item.split} · {item.type}</Text>
          </View>
          <View className="bg-cyan-500/10 p-2 rounded-xl">
            <MaterialCommunityIcons name={item.type === 'Gym' ? 'dumbbell' : 'home-variant'} size={20} color="#06b6d4" />
          </View>
        </View>

        {item.exercises.map((ex, idx) => (
          <View key={idx} className="flex-row items-center justify-between py-2 border-t border-slate-700/50">
            <Text className="text-slate-200 font-semibold text-sm flex-1" numberOfLines={1}>{ex.name}</Text>
            <Text className="text-slate-400 text-xs font-bold">{ex.sets} × {ex.reps}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Workout History</Text>
        <View className="w-9" />
      </View>

      {isLoading && workoutHistory.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : (
        <FlatList
          data={workoutHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <MaterialCommunityIcons name="dumbbell" size={40} color="#475569" />
              <Text className="text-slate-500 mt-3">No workout logs yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
