// components/booking/EventCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Event } from './../types/booking';
import { useBookingStore } from '@/store/venueStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { getVenueById } = useBookingStore();
  const venue = getVenueById(event.venueId);
  const router = useRouter();
  
  const eventDate = new Date(event.dateTime);
  const isUpcoming = event.status === 'upcoming';
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const progressPercentage = (event.currentParticipants / event.maxParticipants) * 100;
  
 const handlePress = () => {
  if (onPress) {
    onPress();
    return;
  }

  if (event.eventType === 'footballtournament') {
    router.push({
      pathname: '/(venue)/footballEvent/eventDetails/[eventId]',
      params: { eventId: event.id },
    });
  } else {
    router.push({
      pathname: '/(venue)/EventBooking/eventDetails/[eventId]',
      params: { eventId: event.id },
    });
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-green-600 bg-green-50';
      case 'ongoing': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'text-orange-600 bg-orange-50';
      case 'league': return 'text-purple-600 bg-purple-50';
      case 'practice': return 'text-blue-600 bg-blue-50';
      case 'friendly': return 'text-green-600 bg-green-50';
      case 'training': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mt-1/2 shadow-sm border border-gray-200 mb-4"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="p-4">
        {/* Header with Event Type and Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View 
            className={`px-2 py-1 rounded-md ${getEventTypeColor(event.eventType)}`}
          >
            <Text className={`text-xs font-medium capitalize ${getEventTypeColor(event.eventType).split(' ')[0]}`}>
              {event.eventType}
            </Text>
          </View>
          
          <View 
            className={`px-2 py-1 rounded-md ${getStatusColor(event.status)}`}
          >
            <Text className={`text-xs font-medium capitalize ${getStatusColor(event.status).split(' ')[0]}`}>
              {event.status}
            </Text>
          </View>
        </View>

        {/* Event Name and Sport */}
        <Text className="text-lg font-bold text-slate-900 mb-1">
          {event.name}
        </Text>
        
        <View className="flex-row items-center mb-3">
          <View className="bg-green-100 px-2 py-1 rounded-md mr-2">
            <Text className="text-green-700 text-xs font-medium">
              {event.sport.name}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text className="text-gray-600 text-xs ml-1">
              {event.participationType === 'team' 
                ? `Team (${event.teamSize} players)` 
                : 'Individual'
              }
            </Text>
          </View>
        </View>

        {/* Venue and Location */}
        {venue && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1 flex-1">
              {venue.name}, {venue.address.city}
            </Text>
          </View>
        )}

        {/* Date and Time */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-700 text-sm ml-1 font-medium">
            {eventDate.toLocaleDateString('en-IN', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </Text>
          
          <Ionicons name="time-outline" size={16} color="#6b7280" className="ml-4" />
          <Text className="text-gray-700 text-sm ml-1 font-medium">
            {eventDate.toLocaleTimeString('en-IN', { 
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Participants Progress */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-600 text-sm">
              {event.currentParticipants}/{event.maxParticipants} joined
            </Text>
            <Text className="text-sm font-medium text-gray-700">
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View 
              className={`h-2 rounded-full ${
                progressPercentage >= 80 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </View>
        </View>

        {/* Fee and Action */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View>
            <Text className="text-orange-600 text-lg font-bold">
              ₹{event.fees.amount}
            </Text>
            <Text className="text-gray-500 text-xs">
              {event.fees.type.replace('_', ' ')}
            </Text>
          </View>
          
          <View className="items-end">
            {isUpcoming && spotsLeft > 0 ? (
              <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium text-sm">
                  {event.participationType === 'team' ? 'Register Team' : 'Join Event'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-300 px-4 py-2 rounded-lg">
                <Text className="text-gray-600 font-medium text-sm">
                  {spotsLeft === 0 ? 'Full' : 'Unavailable'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description Preview */}
        {event.description && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-gray-600 text-sm" numberOfLines={2}>
              {event.description}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;