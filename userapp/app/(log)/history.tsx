import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHealthStore, HealthEntry } from '@/store/HealthLogStore';

export default function HealthHistoryScreen() {
  const router = useRouter();
  const { history, isLoading, fetchHealthHistory } = useHealthStore();

  useEffect(() => {
    fetchHealthHistory();
  }, []);

  const renderItem = ({ item }: { item: HealthEntry }) => {
    const date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
      <View className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white font-bold text-base">{date}</Text>
          {!!item.photoUrl && (
            <Image source={{ uri: item.photoUrl }} className="w-12 h-12 rounded-xl" resizeMode="cover" />
          )}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {!!item.weight && <StatChip icon="scale-outline" label={`${item.weight} kg`} />}
          {!!item.steps && <StatChip icon="walk-outline" label={`${item.steps} steps`} />}
          {!!item.water && <StatChip icon="water-outline" label={`${item.water} L`} />}
          <StatChip icon="moon-outline" label={`${item.sleep} hrs sleep`} />
          <StatChip icon="flash-outline" label={`${item.energy} energy`} />
          <StatChip icon="rocket-outline" label={`${item.motivation} motivation`} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Health History</Text>
        <View className="w-9" />
      </View>

      {isLoading && history.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="heart-outline" size={40} color="#475569" />
              <Text className="text-slate-500 mt-3">No health logs yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function StatChip({ icon, label }: { icon: any; label: string }) {
  return (
    <View className="flex-row items-center bg-slate-900/60 border border-slate-700 rounded-full px-3 py-1.5">
      <Ionicons name={icon} size={13} color="#60a5fa" />
      <Text className="text-slate-300 text-xs font-semibold ml-1.5">{label}</Text>
    </View>
  );
}
