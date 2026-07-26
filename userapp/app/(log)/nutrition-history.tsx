import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore, NutritionEntry } from '@/store/HealthLogStore';

export default function NutritionHistoryScreen() {
  const router = useRouter();
  const { nutritionHistory, isLoading, fetchNutritionHistory } = useHealthStore();

  useEffect(() => {
    fetchNutritionHistory();
  }, []);

  const renderItem = ({ item }: { item: NutritionEntry }) => {
    const date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
      <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm">
        <Text className="text-slate-900 font-black text-base mb-3">{date}</Text>
        {item.meals.map((meal, idx) => (
          <View key={idx} className={`flex-row justify-between py-2 ${idx > 0 ? 'border-t border-slate-50' : ''}`}>
            <View className="flex-1 mr-3">
              <Text className="text-emerald-600 font-bold text-xs uppercase">{meal.category}</Text>
              <Text className="text-slate-700 text-sm mt-0.5">{meal.description}</Text>
            </View>
            {!!meal.time && <Text className="text-slate-400 text-xs font-medium">{meal.time}</Text>}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-100 rounded-full">
          <Ionicons name="chevron-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-slate-900 font-bold text-lg">Nutrition History</Text>
        <View className="w-9" />
      </View>

      {isLoading && nutritionHistory.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={nutritionHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="fast-food-outline" size={40} color="#cbd5e1" />
              <Text className="text-slate-400 mt-3">No nutrition logs yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
