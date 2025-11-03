// Modified EventTab.tsx with refined button design (no Events heading)

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useBookingStore } from '@/store/venueStore';
import { Event, EventFilters } from './../types/booking';
import EventCard from './EventCard';
import FilterModal from './filterModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const EventTab: React.FC = () => {
  const { events, searchEvents, sports } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});

  // Filter and search events
  const filteredEvents = useMemo(() => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      return searchEvents(searchQuery, filters);
    }
    return events;
  }, [searchQuery, filters, events, searchEvents]);

  const handleFilterApply = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleFilterClear = () => {
    setFilters({});
    setShowFilter(false);
  };

  const navigateToEventManager = () => {
    router.navigate('/(venue)/eventManaging');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.sports?.length) count++;
    if (filters.eventType?.length) count++;
    if (filters.participationType) count++;
    if (filters.city) count++;
    if (filters.dateRange) count++;
    if (filters.feeRange) count++;
    return count;
  }, [filters]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Event Manager Header */}
      <View className="bg-sky-100 px-4 py-3 ">
        <View className="flex-row justify-end items-center">
          <TouchableOpacity 
            onPress={navigateToEventManager}
            className="flex-row items-center bg-slate-900 px-4 py-2 rounded-lg"
          >
            <Ionicons name="calendar-outline" size={18} color="white" />
            <Text className="text-white font-medium ml-4 my-1">My Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter Header */}
      <View className="bg-sky-100 px-4 py-3 ">
        <View className="flex-row items-center space-x-3">
          {/* Search Input */}
          <View className="flex-1 flex-row items-center bg-slate-900 rounded-lg px-3 py-2 mx-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-white text-xl"
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
          
          {/* Filter Button */}
          <TouchableOpacity
            className={`p-2 rounded-lg border-2 ${
              activeFiltersCount > 0 
                ? 'bg-green-50 border-green-500' 
                : 'bg-white border-gray-300'
            }`}
            onPress={() => setShowFilter(true)}
          >
            <View className="relative">
              <Ionicons 
                name="filter" 
                size={20} 
                color={activeFiltersCount > 0 ? '#059669' : '#6b7280'} 
              />
              {activeFiltersCount > 0 && (
                <View className="absolute -top-2 -right-2 bg-orange-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity onPress={handleFilterClear}>
                <Text className="text-sm text-orange-600 font-medium">Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        
      </View>

      {/* Events List */}
      <ScrollView 
        className="flex-1 bg-sky-100"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredEvents.length > 0 ? (
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
              {searchQuery || activeFiltersCount > 0 
                ? "Try adjusting your search or filters" 
                : "No events available at the moment"
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        currentFilters={filters}
        filterType="event"
        sports={sports}
      />
    </View>
  );
};

export default EventTab;