import React, { useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useVenueStore } from '@/store/venueStore' // Adjust path to your store
import { Venue } from '@/types/venue'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useResponsive } from '@/hooks/useResponsive'
import FadeInView from '@/components/animated/FadeInView'
import AnimatedPressable from '@/components/animated/AnimatedPressable'

export default function ManageVenuesScreen() {
  const router = useRouter()
  const { isTablet } = useResponsive()
  // Fetch venues from the store
  const { venues, isLoading, fetchMyVenues, deleteVenue } = useVenueStore()

  // Refetch every time the dashboard comes into focus (e.g. after creating/editing a venue)
  useFocusEffect(
    useCallback(() => {
      fetchMyVenues()
    }, [fetchMyVenues])
  )

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center mt-20 px-8">
      <View className="w-32 h-32 bg-slate-100 rounded-full items-center justify-center mb-6">
        <MaterialIcons name="storefront" size={64} color="#94a3b8" />
      </View>
      <Text className="text-slate-900 font-bold text-xl mb-2 text-center">
        No Venues Listed Yet
      </Text>
      <Text className="text-slate-500 text-center leading-6 mb-8">
        You haven't added any sports venues yet. Start by listing your first property to manage bookings.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-1')}
        activeOpacity={0.8}
        className="bg-slate-900 px-8 py-4 rounded-xl flex-row items-center shadow-lg shadow-slate-300"
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text className="text-white font-bold ml-2">Add First Venue</Text>
      </TouchableOpacity>
    </View>
  )

  const VenueCard = ({ venue, delay = 0 }: { venue: Venue; delay?: number }) => (
    <FadeInView delay={delay} className={isTablet ? 'w-[48%]' : 'w-full'}>
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/(venueManagement)/venueHandling/editVenue' as any,
          params: { venueId: venue.id },
        })
      }
      className="bg-white rounded-2xl mb-5 shadow-sm border border-slate-200 overflow-hidden"
    >
      {/* Image Section */}
      <View className="h-40 bg-slate-200 relative">
        {venue.images && venue.images.length > 0 ? (
          <Image
            source={{ uri: venue.images[0] }}
            className="w-full h-full object-cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-slate-100">
            <MaterialIcons name="image-not-supported" size={40} color="#cbd5e1" />
          </View>
        )}

        {/* Status Badge */}
        <View className={`absolute top-3 right-3 px-3 py-1 rounded-full ${venue.isActive ? 'bg-green-100' : 'bg-slate-100'}`}>
          <Text className={`text-[10px] font-bold uppercase ${venue.isActive ? 'text-green-700' : 'text-slate-500'}`}>
            {venue.isActive ? 'Active' : 'Draft'}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-slate-900 font-bold text-lg flex-1 mr-2" numberOfLines={1}>
            {venue.name}
          </Text>
          <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-md">
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text className="text-amber-700 font-bold text-xs ml-1">
              {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <MaterialIcons name="location-on" size={14} color="#64748b" />
          <Text className="text-slate-500 text-sm ml-1 flex-1" numberOfLines={1}>
            {venue.address.street}, {venue.address.city}
          </Text>
        </View>

        <View className="h-[1px] bg-slate-100 my-2" />

        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-slate-400 text-xs font-medium">
            {venue.sports.length} Sports • {venue.timeSlotCount ?? venue.timeSlots.length} Slots
          </Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Delete Venue', `Remove "${venue.name}"? This cannot be undone.`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    deleteVenue(venue.id).catch((err: any) =>
                      Alert.alert('Error', err.message || 'Could not delete venue')
                    )
                  },
                },
              ])
            }}
            className="p-2 -mr-2"
          >
            <MaterialIcons name="more-horiz" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedPressable>
    </FadeInView>
  )


  return (
    <>
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="px-6 py-4 bg-slate-900 border-b border-slate-100 flex-row items-center  sticky top-0 z-10">
          <TouchableOpacity
            onPress={() => router.navigate("/(homeScreenTabs)")}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg mx-8">My Venues</Text>

        </View>

        {/* List Area */}
        <FlatList
          key={isTablet ? 'grid' : 'list'}
          data={venues}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? { justifyContent: 'space-between' } : undefined}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <VenueCard venue={item} delay={Math.min(index, 6) * 60} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100, flexGrow: 1 }}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchMyVenues} />
          }
        />



      </SafeAreaView>


    {venues.length > 0 && (
        <View
          className="absolute bottom-10 right-6"
          style={{ zIndex: 100, elevation: 5 }}
        >
          <AnimatedPressable
            onPress={() => {
              router.push('/(venueManagement)/venueHandling/createVenue/step-1');
            }}
            className="bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-slate-400"
          >
            <MaterialIcons name="add" size={32} color="white" />
          </AnimatedPressable>
        </View>
      )}
    </>
  )
}

