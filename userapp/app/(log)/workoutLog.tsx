import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore, Exercise, WorkoutEntry } from '@/store/HealthLogStore';

const SPLITS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps/Triceps', 'Cardio', 'Full Body', 'Abs'];

export default function WorkoutLogScreen() {
  const router = useRouter();
  const addWorkout = useHealthStore((state) => state.addWorkoutEntry);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const [type, setType] = useState<'Gym' | 'Home'>('Gym');
  const [selectedSplit, setSelectedSplit] = useState('Chest');
  const [exercises, setExercises] = useState<Exercise[]>(
    Array(7).fill({ name: '', sets: '', reps: '' })
  );

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-slate-900"
    >
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mt-12 mb-8">
          <View>
            <Text className="text-slate-400 text-sm font-medium">Today</Text>
            <Text className="text-white text-2xl font-bold">{today}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/workout-history')}
            className="bg-slate-800 p-3 rounded-full border border-slate-700"
          >
            <Ionicons name="barbell-outline" size={24} color="#60a5fa" />
          </TouchableOpacity>
        </View>

        {/* Workout Type Selector */}
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Location</Text>
        <View className="flex-row bg-slate-800 p-1 rounded-2xl mb-8">
          {(['Gym', 'Home'] as const).map((t) => (
            <TouchableOpacity 
              key={t}
              onPress={() => setType(t)}
              className={`flex-1 py-3 rounded-xl items-center ${type === t ? 'bg-blue-500' : ''}`}
            >
              <Text className={`font-bold ${type === t ? 'text-white' : 'text-slate-400'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Split Selector */}
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Focus Area</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {SPLITS.map((split) => (
            <TouchableOpacity 
              key={split}
              onPress={() => setSelectedSplit(split)}
              className={`px-4 py-2 rounded-full border ${selectedSplit === split ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <Text className={`${selectedSplit === split ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>{split}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercise List */}
        <Text className="text-white text-xl font-bold mb-4">Exercises (Max 7)</Text>
        <View className="flex-row mb-2 px-1">
          <Text className="flex-[3] text-slate-500 text-[10px] uppercase font-bold">Exercise Name</Text>
          <Text className="flex-1 text-slate-500 text-[10px] uppercase font-bold text-center">Sets</Text>
          <Text className="flex-1 text-slate-500 text-[10px] uppercase font-bold text-center">Reps</Text>
        </View>

        {exercises.map((ex, index) => (
          <View key={index} className="flex-row items-center mb-3">
            <TextInput
              className="flex-[3] bg-slate-800 h-12 rounded-xl px-4 text-white border border-slate-700"
              placeholder={`Exercise ${index + 1}`}
              placeholderTextColor="#475569"
              value={ex.name}
              onChangeText={(val) => updateExercise(index, 'name', val)}
            />
            <TextInput
              className="flex-1 bg-slate-800 h-12 rounded-xl mx-2 text-center text-white border border-slate-700"
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#475569"
              value={ex.sets}
              onChangeText={(val) => updateExercise(index, 'sets', val)}
            />
            <TextInput
              className="flex-1 bg-slate-800 h-12 rounded-xl text-center text-white border border-slate-700"
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#475569"
              value={ex.reps}
              onChangeText={(val) => updateExercise(index, 'reps', val)}
            />
          </View>
        ))}

        <TouchableOpacity 
          onPress={handleSave}
          className="bg-blue-500 w-full py-4 rounded-2xl items-center mt-6 mb-12 shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white text-lg font-bold">Finish Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}