// components/booking/VenueCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Venue } from './../types/booking';
import { Ionicons } from '@expo/vector-icons';

interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress }) => {
  const minPrice = Math.min(...venue.timeSlots.map((slot) => slot.price));
  const maxPrice = Math.max(...venue.timeSlots.map((slot) => slot.price));
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default navigation logic - you can implement navigation here
      console.log('Navigate to venue details:', venue.id);
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
        <View className="w-full h-48 bg-gray-400 rounded-t-xl items-center justify-center">
          <Ionicons name="image-outline" size={48} color="black" />
          <Text className="text-black text-sm mt-2">No photos uploaded yet</Text>
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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-orange-600 text-lg font-bold">
              ₹{minPrice}{minPrice !== maxPrice && `-${maxPrice}`}
            </Text>
            <Text className="text-gray-500 text-xs">per hour</Text>
          </View>
          
          <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium text-sm">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VenueCard;