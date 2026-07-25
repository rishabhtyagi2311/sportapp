// Modified EventTab.tsx with refined button design (no Events heading)
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ImageBackground, ActivityIndicator } from 'react-native';
import { useEventManagerStore } from '@/store/eventManagerStore';
import EventCard from './EventCard';
import { Ionicons } from '@expo/vector-icons';

const EventTab: React.FC = () => {
  const { events, isLoading, fetchPublicEvents } = useEventManagerStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) => e.name.toLowerCase().includes(q) || e.sportName.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  return (
    <View className="flex-1">
      <ImageBackground
        source={require('@/assets/images/bgEnhancedCoverImage.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />

      {/* Content Container */}
      <View className="flex-1">
        {/* Search Header */}
        <View className="px-4 py-3 bg-transparent">
          <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 mx-2">
            <Ionicons name="search" size={20} color="#000000" />
            <TextInput
              className="flex-1 ml-2 text-black text-xl"
              placeholder="Search events..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Events List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {isLoading && events.length === 0 ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#0f172a" />
            </View>
          ) : filteredEvents.length > 0 ? (
            <View className="px-4 pt-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="calendar" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">No events found</Text>
              <Text className="text-sm text-gray-400 mt-2 text-center px-8">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No events available at the moment"
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default EventTab;
