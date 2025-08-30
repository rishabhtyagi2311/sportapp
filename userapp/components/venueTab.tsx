// components/booking/VenueTab.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useBookingStore } from '@/store/venueStore';
import { Venue, VenueFilters } from './../types/booking';
import VenueCard from './VenueCard';
import FilterModal from './filterModal';
import { Ionicons } from '@expo/vector-icons';

const VenueTab: React.FC = () => {
  const { venues, searchVenues, sports, amenities } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<VenueFilters>({});

  // Filter and search venues
  const filteredVenues = useMemo(() => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      return searchVenues(searchQuery, filters);
    }
    return venues;
  }, [searchQuery, filters, venues, searchVenues]);

  const handleFilterApply = (newFilters: VenueFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleFilterClear = () => {
    setFilters({});
    setShowFilter(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.sports?.length) count++;
    if (filters.amenities?.length) count++;
    if (filters.city) count++;
    if (filters.rating) count++;
    if (filters.priceRange) count++;
    return count;
  }, [filters]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search and Filter Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-300">
        <View className="flex-row items-center space-x-3">
          {/* Search Input */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-700"
              placeholder="Search venues..."
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
                {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity onPress={handleFilterClear}>
                <Text className="text-sm text-orange-600 font-medium">Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Venues List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredVenues.length > 0 ? (
          <View className="px-4 pt-4">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="search" size={64} color="#d1d5db" />
            <Text className="text-lg font-medium text-gray-500 mt-4">No venues found</Text>
            <Text className="text-sm text-gray-400 mt-2 text-center px-8">
              {searchQuery || activeFiltersCount > 0 
                ? "Try adjusting your search or filters" 
                : "No venues available at the moment"
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
        filterType="venue"
        sports={sports}
        amenities={amenities}
      />
    </View>
  );
};

export default VenueTab;