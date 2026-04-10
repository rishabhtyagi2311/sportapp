import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore } from '@/store/HealthLogStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEAL_CATEGORIES = [
  { label: 'Early Morning', icon: 'weather-sunset-up' },
  { label: 'Breakfast', icon: 'coffee-outline' },
  { label: 'Mid Morning', icon: 'apple-icrate' },
  { label: 'Lunch', icon: 'food-variant' },
  { label: 'Tea Time', icon: 'tea-outline' },
  { label: 'Dinner', icon: 'silverware-variant' },
  { label: 'Post Dinner', icon: 'moon-waning-crescent' }
];

export default function NutritionScreen() {
  const router = useRouter();
  const addNutrition = useHealthStore((state) => state.addNutritionEntry);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  const [meals, setMeals] = useState(
    MEAL_CATEGORIES.map(cat => ({ category: cat.label, icon: cat.icon, time: '', description: '' }))
  );

  const updateMeal = (index: number, field: string, value: string) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setMeals(updatedMeals);
  };

  const handleSave = () => {
    const filteredMeals = meals.filter(m => m.description.trim() !== '');
    addNutrition({
      date: new Date().toISOString(),
      meals: filteredMeals,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* HEADER */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-black font-bold text-lg">Fuel Log</Text>
          <TouchableOpacity 
            onPress={() => router.push('/nutrition-history')}
            className="p-2 bg-emerald-500/10 rounded-full"
          >
            <Ionicons name="time-outline" size={22} color="#10b981" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* DATE DISPLAY */}
          <View className="mt-4 mb-8">
            <Text className="text-slate-900 text-xs font-bold uppercase tracking-[2px]">Daily Intake</Text>
            <Text className="text-black text-3xl font-black">{today}</Text>
          </View>

          {/* TIMELINE MEAL LIST */}
          <View>
            {meals.map((meal, index) => {
              const isFirst = index === 0;
              const isLast = index === meals.length - 1;
              const hasValue = meal.description.length > 0;

              return (
                <View key={index} className="flex-row">
                  {/* LEFT TIMELINE DECORATION */}
                  <View className="items-center mr-4">
                    <View className={`w-0.5 flex-1 ${isFirst ? 'bg-transparent' : 'bg-slate-700'}`} />
                    <View className={`w-10 h-10 rounded-full items-center justify-center border-2 
                      ${hasValue ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}>
                      <MaterialCommunityIcons 
                        name={meal.icon as any} 
                        size={18} 
                        color={hasValue ? '#064e3b' : '#94a3b8'} 
                      />
                    </View>
                    <View className={`w-0.5 flex-1 ${isLast ? 'bg-transparent' : 'bg-slate-700'}`} />
                  </View>

                  {/* MEAL CARD */}
                  <View className={`flex-1 mb-6 p-4 rounded-[24px] border 
                    ${hasValue ? 'bg-slate-800/80 border-emerald-500/30' : 'bg-slate-800/30 border-slate-800'}`}>
                    
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className={`font-black text-xs uppercase tracking-wider 
                        ${hasValue ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {meal.category}
                      </Text>
                      <TextInput
                        placeholder="Time"
                        placeholderTextColor="#475569"
                        className="text-slate-400 text-[10px] font-bold bg-slate-900/50 px-3 py-1 rounded-full"
                        value={meal.time}
                        onChangeText={(val) => updateMeal(index, 'time', val)}
                      />
                    </View>

                    <TextInput
                      multiline
                      placeholder="What's on the menu?"
                      placeholderTextColor="#475569"
                      className="text-white font-medium text-base p-0"
                      value={meal.description}
                      onChangeText={(val) => updateMeal(index, 'description', val)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
          
          <View className="h-10" />
        </ScrollView>

        {/* SAVE ACTION */}
        <View className="px-6 py-6 bg-[#0f172a] border-t border-slate-800/50">
          <TouchableOpacity 
            onPress={handleSave}
            activeOpacity={0.8}
            className="bg-emerald-500 py-5 rounded-[22px] items-center shadow-xl shadow-emerald-500/20"
          >
            <Text className="text-emerald-950 text-lg font-black uppercase tracking-widest">
              Update Journal
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}