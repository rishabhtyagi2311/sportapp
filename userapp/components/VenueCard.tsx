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
        {venue.images.length > 0 ? (
          <Image
            source={{ uri: venue.images[0] }}
            className="w-full h-48 rounded-t-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 rounded-t-xl items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
          </View>
        )}
        
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

        {/* Sports */}
        <View className="flex-row flex-wrap mb-3">
          {venue.sports.slice(0, 3).map((sport, index) => (
            <View
              key={sport.id}
              className="bg-green-100 px-2 py-1 rounded-md mr-2 mb-1"
            >
              <Text className="text-green-700 text-xs font-medium">
                {sport.name}
              </Text>
            </View>
          ))}
          {venue.sports.length > 3 && (
            <View className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1">
              <Text className="text-gray-600 text-xs font-medium">
                +{venue.sports.length - 3} more
              </Text>
            </View>
          )}
        </View>

        {/* Amenities Preview */}
        <View className="flex-row items-center mb-3">
          <Text className="text-gray-500 text-sm mr-2">Amenities:</Text>
          <View className="flex-row flex-1">
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <Text key={amenity.id} className="text-xs mr-1">
                {amenity.icon}
              </Text>
            ))}
            {venue.amenities.length > 3 && (
              <Text className="text-gray-500 text-xs">
                +{venue.amenities.length - 3}
              </Text>
            )}
          </View>
        </View>

        {/* Price and Reviews */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-orange-600 text-lg font-bold">
              ₹{minPrice}{minPrice !== maxPrice && `-${maxPrice}`}
            </Text>
            <Text className="text-gray-500 text-xs">per hour</Text>
          </View>
          
          <View className="items-end">
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-gray-700 text-sm ml-1 font-medium">
                {venue.rating}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs">
              {venue.reviewCount} reviews
            </Text>
          </View>
        </View>

        {/* Operating Status */}
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className={`w-2 h-2 rounded-full mr-2 ${
                  venue.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`} 
              />
              <Text className={`text-sm ${venue.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {venue.isActive ? 'Open Now' : 'Closed'}
              </Text>
            </View>
            
            <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-medium text-sm">Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VenueCard;