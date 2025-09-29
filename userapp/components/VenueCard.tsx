// components/booking/VenueCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Venue } from '../types/booking';
import { Ionicons } from '@expo/vector-icons';

interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress }) => {
  const router = useRouter();
  const minPrice = Math.min(...venue.timeSlots.map((slot) => slot.price));
  const maxPrice = Math.max(...venue.timeSlots.map((slot) => slot.price));
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/(venue)/VenueBooking/venueDetails/[venueId]',
        params: { venueId: venue.id }
      });
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Image Section */}
      <View className="relative">
        <View className="w-full h-48 bg-gray-300 rounded-t-xl items-center justify-center">
          <Ionicons name="image-outline" size={48} color="#6b7280" />
          <Text className="text-gray-600 text-sm mt-2">No photos uploaded yet</Text>
        </View>
        
        {/* Rating Badge */}
        <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex-row items-center">
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text className="text-sm font-semibold text-gray-800 ml-1">
            {venue.rating}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-4">
        {/* Venue Name and Location */}
        <Text className="text-lg font-bold text-slate-900 mb-1">
          {venue.name}
        </Text>
        
        <View className="flex-row items-center mb-3">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-1 flex-1">
            {venue.address.city}, {venue.address.state}
          </Text>
        </View>

        {/* Price */}
        <View>
          <Text className="text-orange-600 text-lg font-bold">
            ₹{minPrice}{minPrice !== maxPrice && `-${maxPrice}`}
          </Text>
          <Text className="text-gray-500 text-xs">per hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VenueCard;