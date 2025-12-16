import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';

export default function KnockoutStep1() {
  const router = useRouter();
  const { startDraft, updateDraft } = useKnockoutStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Team Count State
  const [teamCount, setTeamCount] = useState<number>(8); 
  const [customTeamInput, setCustomTeamInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Helper to check for Power of 2 (required for clean brackets)
  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const handleTeamCountChange = (val: string) => {
    setCustomTeamInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setTeamCount(num);
    }
  };

  const selectPreset = (val: number) => {
    setIsCustomMode(false);
    setTeamCount(val);
    setCustomTeamInput('');
  };

  const handleNext = () => {
    // 1. Basic Validation
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a tournament name.');
      return;
    }

    // 2. Team Count Validation
    if (isNaN(teamCount) || teamCount < 2) {
      Alert.alert('Invalid Teams', 'You need at least 2 teams.');
      return;
    }

    // 3. Enforce Even Number (User Requirement)
    if (teamCount % 2 !== 0) {
      Alert.alert('Invalid Number', 'The number of teams must be an even number.');
      return;
    }

    // 4. Enforce Power of 2 (System Requirement for Brackets)
    // Note: If you want to support non-power-of-2 (e.g. 6 teams), you would need 
    // to implement "Bye" logic in the store. For now, we enforce this to prevent crashes.
    if (!isPowerOfTwo(teamCount)) {
      Alert.alert(
        'Bracket Requirement', 
        `For a balanced knockout bracket, the team count must be a power of 2 (e.g., 4, 8, 16, 32, 64).\n\n${teamCount} is not a power of 2.`
      );
      return;
    }
    
    // Initialize draft
    startDraft(name);
    
    // Save configurations
    updateDraft({
      teamCount,
      settings: {
        venue: '', 
        matchDuration: 90,
        extraTime: true,
        penalties: true,
      }
    });
    
    router.push('./step2');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Create Knockout Cup</Text>
          <View className="w-6" /> 
        </View>

        {/* Progress Indicator */}
        <View className="bg-white px-4 py-3 border-b border-slate-100">
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center">
              <View className="w-8 h-8 bg-orange-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">1</Text>
              </View>
              <View className="flex-1 h-1 bg-slate-200 mx-2" />
            </View>
            <View className="flex-1 flex-row items-center">
              <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
                <Text className="text-slate-400 font-bold text-sm">2</Text>
              </View>
              <View className="flex-1 h-1 bg-slate-200 mx-2" />
            </View>
            <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-sm">3</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-2 px-1">
            <Text className="text-xs font-medium text-orange-600">Structure</Text>
            <Text className="text-xs text-slate-400">Teams</Text>
            <Text className="text-xs text-slate-400">Rules</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Tournament Name */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Tournament Name *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
              placeholder="e.g. Winter Cup 2025"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Description (Optional)</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
              placeholder="Brief details about the cup..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Bracket Size Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Number of Teams *</Text>
            <Text className="text-xs text-slate-500 mb-4">Choose a standard size or enter a custom number.</Text>
            
            {/* Presets */}
            <View className="flex-row flex-wrap gap-3 mb-4">
              {[4, 8, 16, 32].map((count) => (
                <TouchableOpacity
                  key={count}
                  onPress={() => selectPreset(count)}
                  className={`flex-1 min-w-[20%] py-3 rounded-xl border items-center ${
                    !isCustomMode && teamCount === count 
                      ? 'border-orange-600 bg-orange-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <Text className={`font-bold ${!isCustomMode && teamCount === count ? 'text-orange-700' : 'text-slate-700'}`}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Input Option */}
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => setIsCustomMode(true)}
              className={`flex-row items-center border rounded-xl px-4 py-3 ${isCustomMode ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'}`}
            >
              <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${isCustomMode ? 'border-orange-600' : 'border-slate-300'}`}>
                {isCustomMode && <View className="w-2.5 h-2.5 rounded-full bg-orange-600" />}
              </View>
              <Text className={`flex-1 font-medium ${isCustomMode ? 'text-orange-900' : 'text-slate-600'}`}>
                Custom Amount
              </Text>
              {isCustomMode && (
                <TextInput
                  className="bg-white border border-orange-200 rounded-lg px-3 py-1 w-24 text-center font-bold text-orange-900"
                  value={customTeamInput}
                  onChangeText={handleTeamCountChange}
                  keyboardType="numeric"
                  placeholder="#"
                  autoFocus
                />
              )}
            </TouchableOpacity>
            
            {isCustomMode && (
              <Text className="text-xs text-orange-600 mt-2 ml-2">
                * Must be a power of 2 (e.g. 64, 128)
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-900 mb-1">Tournament Format</Text>
              <Text className="text-sm text-blue-700 leading-5">
                Single elimination bracket. Winners advance, losers go home.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-4 bg-white border-t border-slate-200">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!name.trim()}
            className={`py-4 rounded-xl items-center shadow-sm ${
              name.trim() ? 'bg-orange-600' : 'bg-slate-300'
            }`}
          >
            <Text className="text-white font-bold text-lg">Next: Select Teams</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}