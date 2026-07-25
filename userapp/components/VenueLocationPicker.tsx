// components/VenueLocationPicker.tsx
// Toggle between picking a real listed Venue or entering a freeform custom address.
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { venueApiService } from '@/services/venue/venue';
import { Venue } from '@/types/booking';
import CurrentLocationButton from '@/components/CurrentLocationButton';

export interface VenueLocationValue {
  venueId?: string;
  venueName?: string;
  locationName?: string;
}

interface VenueLocationPickerProps {
  value: VenueLocationValue;
  onChange: (value: VenueLocationValue) => void;
}

export default function VenueLocationPicker({ value, onChange }: VenueLocationPickerProps) {
  const [mode, setMode] = useState<'venue' | 'custom'>(value.venueId ? 'venue' : 'custom');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(value.venueName ?? '');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (mode !== 'venue' || venues.length > 0) return;
    setLoading(true);
    venueApiService
      .getVenues()
      .then((res) => setVenues(res.data || []))
      .finally(() => setLoading(false));
  }, [mode]);

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectMode = (next: 'venue' | 'custom') => {
    setMode(next);
    setShowResults(false);
    if (next === 'venue') {
      setSearch('');
      onChange({ venueId: undefined, venueName: undefined, locationName: undefined });
    } else {
      onChange({ venueId: undefined, venueName: undefined, locationName: value.locationName ?? '' });
    }
  };

  return (
    <View>
      <View className="flex-row mb-3">
        <TouchableOpacity
          onPress={() => selectMode('venue')}
          className={`flex-1 rounded-lg py-3 px-2 mr-2 border ${
            mode === 'venue' ? 'bg-green-600 border-green-500' : 'bg-sky-100 border-gray-300'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center text-sm ${
              mode === 'venue' ? 'text-white font-semibold' : 'text-gray-700'
            }`}
          >
            Choose Venue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => selectMode('custom')}
          className={`flex-1 rounded-lg py-3 px-2 border ${
            mode === 'custom' ? 'bg-green-600 border-green-500' : 'bg-sky-100 border-gray-300'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center text-sm ${
              mode === 'custom' ? 'text-white font-semibold' : 'text-gray-700'
            }`}
          >
            Custom Location
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'venue' ? (
        <View>
          <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
            <Ionicons name="search-outline" size={20} color="#374151" />
            <TextInput
              className="flex-1 text-black py-4 px-3 text-base"
              placeholder="Search venues..."
              placeholderTextColor="#6b7280"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setShowResults(true);
                if (value.venueId) onChange({ venueId: undefined, venueName: undefined });
              }}
              onFocus={() => setShowResults(true)}
            />
          </View>

          {value.venueId && !showResults && (
            <View className="mt-2 bg-slate-800 rounded-xl px-4 py-3 flex-row items-center">
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text className="text-white ml-2">{value.venueName}</Text>
            </View>
          )}

          {showResults &&
            (loading ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="white" />
              </View>
            ) : filteredVenues.length === 0 ? (
              <Text className="text-gray-400 text-sm mt-2">No venues found</Text>
            ) : (
              <View className="mt-2">
                {filteredVenues.slice(0, 8).map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => {
                      onChange({ venueId: v.id, venueName: v.name, locationName: undefined });
                      setSearch(v.name);
                      setShowResults(false);
                    }}
                    className="bg-sky-100 rounded-lg px-4 py-3 mb-2"
                  >
                    <Text className="text-black font-semibold">{v.name}</Text>
                    {!!v.address?.city && (
                      <Text className="text-gray-600 text-xs">{v.address.city}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
        </View>
      ) : (
        <View>
          <CurrentLocationButton
            className="flex-row items-center justify-center bg-green-600 rounded-lg py-3 mb-3"
            onDetected={({ address, city }) =>
              onChange({
                locationName: [address, city].filter(Boolean).join(', '),
                venueId: undefined,
                venueName: undefined,
              })
            }
          />
          <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
            <Ionicons name="location-outline" size={20} color="#374151" />
            <TextInput
              className="flex-1 text-black py-4 px-3 text-base"
              placeholder="Enter custom address"
              placeholderTextColor="#6b7280"
              value={value.locationName ?? ''}
              onChangeText={(text) =>
                onChange({ locationName: text, venueId: undefined, venueName: undefined })
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}
