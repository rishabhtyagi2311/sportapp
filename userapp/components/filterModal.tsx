// components/booking/FilterModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { VenueFilters, EventFilters, Sport, Amenity } from './../types/booking';
import { Ionicons } from '@expo/vector-icons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: VenueFilters | EventFilters) => void;
  onClear: () => void;
  currentFilters: VenueFilters | EventFilters;
  filterType: 'venue' | 'event';
  sports: Sport[];
  amenities?: Amenity[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters,
  filterType,
  sports,
  amenities = []
}) => {
  const [localFilters, setLocalFilters] = useState<VenueFilters | EventFilters>(currentFilters);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedParticipationType, setSelectedParticipationType] = useState<'individual' | 'team' | undefined>();
  const [cityFilter, setCityFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>();

  const eventTypes = ['tournament', 'league', 'practice', 'friendly', 'training'];

  useEffect(() => {
    if (visible) {
      // Initialize form with current filters
      if (filterType === 'venue') {
        const vFilters = currentFilters as VenueFilters;
        setSelectedSports(vFilters.sports || []);
        setSelectedAmenities(vFilters.amenities || []);
        setCityFilter(vFilters.city || '');
        setMinPrice(vFilters.priceRange?.min.toString() || '');
        setMaxPrice(vFilters.priceRange?.max.toString() || '');
        setMinRating(vFilters.rating);
      } else {
        const eFilters = currentFilters as EventFilters;
        setSelectedSports(eFilters.sports || []);
        setSelectedEventTypes(eFilters.eventType || []);
        setSelectedParticipationType(eFilters.participationType);
        setCityFilter(eFilters.city || '');
        setMinPrice(eFilters.feeRange?.min.toString() || '');
        setMaxPrice(eFilters.feeRange?.max.toString() || '');
      }
    }
  }, [visible, currentFilters, filterType]);

  const handleSportToggle = (sportId: string) => {
    setSelectedSports(prev => 
      prev.includes(sportId) 
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleApply = () => {
    let filters: VenueFilters | EventFilters;

    if (filterType === 'venue') {
      filters = {
        sports: selectedSports.length > 0 ? selectedSports : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        city: cityFilter.trim() || undefined,
        rating: minRating,
        priceRange: minPrice || maxPrice ? {
          min: parseInt(minPrice) || 0,
          max: parseInt(maxPrice) || 10000
        } : undefined
      } as VenueFilters;
    } else {
      filters = {
        sports: selectedSports.length > 0 ? selectedSports : undefined,
        eventType: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
        participationType: selectedParticipationType,
        city: cityFilter.trim() || undefined,
        feeRange: minPrice || maxPrice ? {
          min: parseInt(minPrice) || 0,
          max: parseInt(maxPrice) || 10000
        } : undefined
      } as EventFilters;
    }

    onApply(filters);
  };

  const handleClearAll = () => {
    setSelectedSports([]);
    setSelectedAmenities([]);
    setSelectedEventTypes([]);
    setSelectedParticipationType(undefined);
    setCityFilter('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(undefined);
    onClear();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-300">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-slate-900">
            Filter {filterType === 'venue' ? 'Venues' : 'Events'}
          </Text>
          
          <TouchableOpacity onPress={handleClearAll}>
            <Text className="text-orange-600 font-medium">Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Sports Filter */}
          <View className="px-4 py-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-slate-900 mb-3">Sports</Text>
            <View className="flex-row flex-wrap">
              {sports.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    selectedSports.includes(sport.id)
                      ? 'bg-green-600 border-green-600'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => handleSportToggle(sport.id)}
                >
                  <Text className={`text-sm font-medium ${
                    selectedSports.includes(sport.id) ? 'text-white' : 'text-gray-700'
                  }`}>
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Venue-specific filters */}
          {filterType === 'venue' && (
            <>
              {/* Amenities Filter */}
              <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-base font-semibold text-slate-900 mb-3">Amenities</Text>
                <View className="flex-row flex-wrap">
                  {amenities.map((amenity) => (
                    <TouchableOpacity
                      key={amenity.id}
                      className={`mr-2 mb-2 px-3 py-2 rounded-lg border flex-row items-center ${
                        selectedAmenities.includes(amenity.id)
                          ? 'bg-green-600 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => handleAmenityToggle(amenity.id)}
                    >
                      {amenity.icon && (
                        <Text className="mr-1">{amenity.icon}</Text>
                      )}
                      <Text className={`text-sm font-medium ${
                        selectedAmenities.includes(amenity.id) ? 'text-white' : 'text-gray-700'
                      }`}>
                        {amenity.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating Filter */}
              <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-base font-semibold text-slate-900 mb-3">Minimum Rating</Text>
                <View className="flex-row">
                  {[3, 3.5, 4, 4.5, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      className={`mr-3 px-3 py-2 rounded-lg border flex-row items-center ${
                        minRating === rating
                          ? 'bg-green-600 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => setMinRating(rating)}
                    >
                      <Ionicons 
                        name="star" 
                        size={16} 
                        color={minRating === rating ? 'white' : '#f59e0b'} 
                      />
                      <Text className={`text-sm font-medium ml-1 ${
                        minRating === rating ? 'text-white' : 'text-gray-700'
                      }`}>
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Event-specific filters */}
          {filterType === 'event' && (
            <>
              {/* Event Type Filter */}
              <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-base font-semibold text-slate-900 mb-3">Event Type</Text>
                <View className="flex-row flex-wrap">
                  {eventTypes.map((eventType) => (
                    <TouchableOpacity
                      key={eventType}
                      className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                        selectedEventTypes.includes(eventType)
                          ? 'bg-green-600 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => handleEventTypeToggle(eventType)}
                    >
                      <Text className={`text-sm font-medium capitalize ${
                        selectedEventTypes.includes(eventType) ? 'text-white' : 'text-gray-700'
                      }`}>
                        {eventType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Participation Type Filter */}
              <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-base font-semibold text-slate-900 mb-3">Participation</Text>
                <View className="flex-row">
                  {(['individual', 'team'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`mr-3 px-4 py-2 rounded-lg border ${
                        selectedParticipationType === type
                          ? 'bg-green-600 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => setSelectedParticipationType(
                        selectedParticipationType === type ? undefined : type
                      )}
                    >
                      <Text className={`text-sm font-medium capitalize ${
                        selectedParticipationType === type ? 'text-white' : 'text-gray-700'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* City Filter */}
          <View className="px-4 py-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-slate-900 mb-3">City</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-700"
              placeholder="Enter city name"
              placeholderTextColor="#9ca3af"
              value={cityFilter}
              onChangeText={setCityFilter}
            />
          </View>

          {/* Price Range Filter */}
          <View className="px-4 py-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-slate-900 mb-3">
              {filterType === 'venue' ? 'Price Range (per hour)' : 'Fee Range'}
            </Text>
            <View className="flex-row items-center space-x-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Min</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-700"
                  placeholder="₹0"
                  placeholderTextColor="#9ca3af"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
              
              <Text className="text-gray-400 mt-6">-</Text>
              
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Max</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-700"
                  placeholder="₹10000"
                  placeholderTextColor="#9ca3af"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="px-4 py-3 border-t border-gray-300">
          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center"
            onPress={handleApply}
          >
            <Text className="text-white font-bold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;