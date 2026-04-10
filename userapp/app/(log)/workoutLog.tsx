import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Pressable 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore, Exercise, WorkoutEntry } from '@/store/HealthLogStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLITS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Full Body'];

export default function WorkoutLogScreen() {
  const router = useRouter();
  const addWorkout = useHealthStore((state) => state.addWorkoutEntry);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  const [type, setType] = useState<'Gym' | 'Home'>('Gym');
  const [selectedSplit, setSelectedSplit] = useState('Chest');
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '' }]);

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const addExerciseField = () => {
    if (exercises.length < 10) {
      setExercises([...exercises, { name: '', sets: '', reps: '' }]);
    }
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const activeExercises = exercises.filter(ex => ex.name.trim() !== '');
    const entry: WorkoutEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      split: selectedSplit,
      exercises: activeExercises,
    };
    addWorkout(entry);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* TOP NAVIGATION */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Log Session</Text>
          <TouchableOpacity onPress={() => router.push('/workout-history')}>
            <Ionicons name="stats-chart" size={22} color="#38bdf8" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* HEADER INFO */}
          <View className="mt-4 mb-8 bg-slate-800/50 p-5 rounded-[24px] border border-slate-700">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-[2px]">Current Session</Text>
                <Text className="text-white text-2xl font-black mt-1">{today}</Text>
              </View>
              <View className="bg-cyan-500/10 p-3 rounded-2xl">
                <MaterialCommunityIcons name={type === 'Gym' ? 'dumbbell' : 'home-variant'} size={28} color="#06b6d4" />
              </View>
            </View>

            {/* LOCATION SELECTOR */}
            <View className="flex-row bg-slate-900/80 p-1 rounded-xl">
              {(['Gym', 'Home'] as const).map((t) => (
                <Pressable 
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-lg items-center ${type === t ? 'bg-slate-700 shadow-sm' : ''}`}
                >
                  <Text className={`font-bold text-sm ${type === t ? 'text-white' : 'text-slate-500'}`}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* SPLITS SCROLL */}
          <View className="mb-8">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 ml-1">Target Focus</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {SPLITS.map((split) => (
                <TouchableOpacity 
                  key={split}
                  onPress={() => setSelectedSplit(split)}
                  className={`mr-3 px-6 py-3 rounded-2xl border-2 ${selectedSplit === split ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-800 border-slate-800'}`}
                >
                  <Text className={`font-bold ${selectedSplit === split ? 'text-slate-900' : 'text-slate-400'}`}>{split}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* EXERCISE SECTION */}
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-white text-xl font-black italic">EXERCISES</Text>
            <TouchableOpacity onPress={addExerciseField}>
              <Text className="text-cyan-400 font-bold">+ Add New</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((ex, index) => (
            <View key={index} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">{index + 1}</Text>
                </View>
                <TextInput
                  className="flex-1 text-white font-bold text-base"
                  placeholder="Bench Press, Squats..."
                  placeholderTextColor="#475569"
                  value={ex.name}
                  onChangeText={(val) => updateExercise(index, 'name', val)}
                />
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(index)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1 bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-700/30">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase mb-1">Sets</Text>
                  <TextInput
                    className="text-white font-bold p-0"
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#334155"
                    value={ex.sets}
                    onChangeText={(val) => updateExercise(index, 'sets', val)}
                  />
                </View>
                <View className="flex-1 bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-700/30">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase mb-1">Reps</Text>
                  <TextInput
                    className="text-white font-bold p-0"
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#334155"
                    value={ex.reps}
                    onChangeText={(val) => updateExercise(index, 'reps', val)}
                  />
                </View>
              </View>
            </View>
          ))}

          <View className="h-20" />
        </ScrollView>

        {/* BOTTOM FIXED BUTTON */}
        <View className="px-6 py-6 bg-[#0f172a]">
          <TouchableOpacity 
            onPress={handleSave}
            activeOpacity={0.9}
            className="bg-cyan-500 w-full py-5 rounded-[20px] items-center shadow-xl shadow-cyan-500/20"
          >
            <Text className="text-slate-900 text-lg font-black uppercase tracking-widest">Complete Workout</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}