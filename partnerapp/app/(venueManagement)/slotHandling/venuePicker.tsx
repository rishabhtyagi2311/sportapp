import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'

export default function SlotManagementSelector() {
  const router = useRouter()
  const venues = useVenueStore(state => state.venues)

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Manage Slots</Text>
      </View>

      <FlatList
        data={venues}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <Text className="text-slate-500 mb-4">Select a venue to manage availability:</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: './viewSlots', params: { venueId: item.id } })}
            className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow-sm border border-slate-200"
          >
            <View className="w-12 h-12 bg-slate-100 rounded-xl items-center justify-center mr-4">
              <MaterialIcons name="stadium" size={24} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 text-lg">{item.name}</Text>
              <Text className="text-slate-500 text-xs">{item.address.city}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}