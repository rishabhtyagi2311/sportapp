// app/(homeScreenTabs)/sports.tsx

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SportsScreen() {
  return (
    <ScrollView className="bg-sky-100 px-5 py-6 flex-1">
      {/* FOOTBALL */}
      <TouchableOpacity
        onPress={() => router.navigate('./../(footballStack)')}
        className="bg-blue-900 rounded-xl p-5 mb-4 flex-row justify-between items-center shadow-md"
      >
        <Text className="text-slate-50 text-lg font-semibold">
          Football
        </Text>
        <Ionicons name="football" size={28} color="#f8fafc" />
      </TouchableOpacity>

      {/* CRICKET */}
      <TouchableOpacity
        onPress={() => router.push('./(cricketStack)')}
        className="bg-blue-900 rounded-xl p-5 mb-4 flex-row justify-between items-center shadow-md"
      >
        <Text className="text-slate-50 text-lg font-semibold">
          Cricket
        </Text>
        <Ionicons name="tennisball-outline" size={28} color="#f8fafc" />
      </TouchableOpacity>

      {/* Add more sports below */}
    </ScrollView>
  );
}
