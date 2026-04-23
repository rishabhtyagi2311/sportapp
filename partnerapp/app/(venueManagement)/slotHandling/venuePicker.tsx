import React, { useEffect } from 'react'
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'

export default function SlotManagementSelector() {
  const router = useRouter()
  
  // Destructure state and actions from the venue store
  const { venues, fetchMyVenues, isLoading, error } = useVenueStore()

  // Fetch venues on component mount
  useEffect(() => {
    fetchMyVenues()
  }, [])

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center pt-20">
      <View className="bg-slate-100 p-6 rounded-full mb-4">
        <MaterialIcons name="inventory" size={48} color="#94a3b8" />
      </View>
      <Text className="text-slate-900 font-bold text-lg">No Venues Found</Text>
      <Text className="text-slate-500 text-center px-10 mt-2">
        You haven't added any venues to your partner account yet.
      </Text>
      <TouchableOpacity 
        onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-1')}
        className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
      >
        <Text className="text-white font-bold">Add Your First Venue</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* HEADER */}
      <View className="px-5 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Manage Slots</Text>
        </View>
        
        {isLoading && <ActivityIndicator color="#2563eb" size="small" />}
      </View>

      {/* ERROR MESSAGE */}
      {error && (
        <View className="bg-red-50 p-3 flex-row items-center justify-center">
          <MaterialIcons name="error-outline" size={16} color="#ef4444" />
          <Text className="text-red-600 text-xs font-bold ml-2">{error}</Text>
        </View>
      )}

      {/* VENUE LIST */}
      <FlatList
        data={venues}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMyVenues} />
        }
        ListHeaderComponent={
          venues.length > 0 ? (
            <Text className="text-slate-500 font-medium mb-4 uppercase text-[10px] tracking-widest">
              Your Registered Venues
            </Text>
          ) : null
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ 
              pathname: "/(venueManagement)/slotHandling/viewSlots", 
              params: { venueId: item.id, venueName: item.name } 
            })}
            activeOpacity={0.7}
            className="bg-white p-5 rounded-[30px] mb-4 flex-row items-center shadow-sm border border-slate-100"
          >
            <View className="w-14 h-14 bg-blue-50 rounded-[20px] items-center justify-center mr-4">
              <MaterialIcons name="stadium" size={28} color="#2563eb" />
            </View>
            
            <View className="flex-1">
              <Text className="font-black text-slate-900 text-lg" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-sharp" size={12} color="#94a3b8" />
                <Text className="text-slate-400 text-xs font-bold ml-1">
                  {item.address.city}, {item.address.state}
                </Text>
              </View>
            </View>
            
            <View className="bg-slate-50 p-2 rounded-full">
              <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}