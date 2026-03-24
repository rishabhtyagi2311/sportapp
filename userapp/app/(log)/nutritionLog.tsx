import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore } from '@/store/HealthLogStore';

const MEAL_CATEGORIES = [
  'Early Morning', 'Breakfast', 'Mid Morning', 
  'Lunch', 'Tea Time', 'Dinner', 'Post Dinner'
];

export default function NutritionScreen() {
  const router = useRouter();
  const addNutrition = useHealthStore((state) => state.addNutritionEntry);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // Initialize 7 rows of empty meal data
  const [meals, setMeals] = useState(
    MEAL_CATEGORIES.map(cat => ({ category: cat, time: '', description: '' }))
  );

  const updateMeal = (index: number, field: string, value: string) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setMeals(updatedMeals);
  };

  const handleSave = () => {
    // Filter out rows where the user didn't enter a meal description
    const filteredMeals = meals.filter(m => m.description.trim() !== '');
    addNutrition({
     
      date: new Date().toISOString(),
      meals: filteredMeals,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-12 mb-6">
          <View>
            <Text className="text-slate-400 text-sm font-medium">Today</Text>
            <Text className="text-white text-2xl font-bold">{today}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/nutrition-history')}
            className="bg-slate-800 p-3 rounded-full border border-slate-700"
          >
            <Ionicons name="journal-outline" size={24} color="#60a5fa" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-xl font-bold mb-4">Your Meals</Text>

        {/* Table Header */}
        <View className="flex-row mb-2 px-2">
          <Text className="flex-[1.5] text-slate-500 font-bold text-xs uppercase">Category</Text>
          <Text className="flex-1 text-slate-500 font-bold text-xs uppercase ml-2">Time</Text>
          <Text className="flex-[2] text-slate-500 font-bold text-xs uppercase ml-2">What did you eat?</Text>
        </View>

        {/* Meal Rows */}
        {meals.map((meal, index) => (
          <View key={index} className="flex-row items-center mb-3 bg-slate-800/50 p-2 rounded-2xl border border-slate-800">
            {/* Category Column (Read Only/Display) */}
            <View className="flex-[1.5] justify-center">
              <Text className="text-blue-400 font-semibold text-xs">{meal.category}</Text>
            </View>

            {/* Time Column */}
            <TextInput
              className="flex-1 bg-slate-800 text-white h-10 rounded-xl px-2 border border-slate-700 text-sm"
              placeholder="08:00 AM"
              placeholderTextColor="#475569"
              value={meal.time}
              onChangeText={(val) => updateMeal(index, 'time', val)}
            />

            {/* Meal Description Column */}
            <TextInput
              className="flex-[2] bg-slate-800 text-white h-10 rounded-xl px-3 border border-slate-700 ml-2 text-sm"
              placeholder="e.g. Eggs & Oats"
              placeholderTextColor="#475569"
              value={meal.description}
              onChangeText={(val) => updateMeal(index, 'description', val)}
            />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-blue-500 w-full py-4 rounded-2xl items-center mt-6 mb-10 shadow-lg shadow-blue-500/20"
        >
          <Text className="text-white text-lg font-bold">Save Nutrition Log</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}