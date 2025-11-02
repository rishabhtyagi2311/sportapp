// app/(venue)/eventManager/profile.tsx

import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useBookingStore } from '@/store/venueStore';
import { Event } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CURRENT_USER } from './usercontext';

export default function EventManagerScreen() {
  const { events, deleteEvent } = useBookingStore();
  
  // Filter events created by the current user using creatorId
  const myEvents = useMemo(() => {
    return events.filter(event => event.creatorId === CURRENT_USER.id);
  }, [events]);

  const handleCreateEvent = () => {
    router.push('/eventManager/createEvent');
  };

  const handleEditEvent = (eventId: string) => {
    router.push({
      pathname: '/eventManager/editEvent/[id]',
      params: { id: eventId }
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteEvent(eventId),
          style: "destructive"
        }
      ]
    );
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.dateTime);
    
    return (
      <View className="bg-white rounded-xl my-2 shadow-sm border border-gray-200 overflow-hidden">
        <View className="p-4">
          {/* Event Name and Type */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-slate-900 flex-1 mr-2">
              {item.name}
            </Text>
            <View className="flex-row">
              <TouchableOpacity 
                onPress={() => handleEditEvent(item.id)}
                className="bg-sky-100 p-2 rounded-full mr-2"
              >
                <Ionicons name="create-outline" size={18} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteEvent(item.id)}
                className="bg-red-100 p-2 rounded-full"
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Event Type and Status */}
          <View className="flex-row mb-3">
            <View className="bg-orange-100 px-2 py-1 rounded mr-2">
              <Text className="text-orange-700 text-xs font-medium capitalize">
                {item.eventType}
              </Text>
            </View>
            <View className={
              `px-2 py-1 rounded ${
                item.status === 'upcoming' ? 'bg-green-100' :
                item.status === 'ongoing' ? 'bg-blue-100' :
                item.status === 'completed' ? 'bg-gray-100' : 'bg-red-100'
              }`
            }>
              <Text className={
                `text-xs font-medium capitalize ${
                  item.status === 'upcoming' ? 'text-green-700' :
                  item.status === 'ongoing' ? 'text-blue-700' :
                  item.status === 'completed' ? 'text-gray-700' : 'text-red-700'
                }`
              }>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Date, Time and Participants */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-700 text-sm ml-1 font-medium">
              {eventDate.toLocaleDateString('en-IN', { 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
            <Ionicons name="time-outline" size={16} color="#6b7280" className="ml-3" />
            <Text className="text-gray-700 text-sm ml-1 font-medium">
              {eventDate.toLocaleTimeString('en-IN', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text className="text-gray-700 text-sm ml-1">
              {item.currentParticipants}/{item.maxParticipants} participants
            </Text>
          </View>

          {/* Sport and Fees */}
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <View className="bg-green-100 px-2 py-1 rounded-md">
              <Text className="text-green-700 text-xs font-medium">
                {item.sport.name}
              </Text>
            </View>
            <Text className="text-orange-600 font-bold">
              ₹{item.fees.amount} ({item.fees.type.replace('_', ' ')})
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 py-2">
      {myEvents.length > 0 ? (
        <FlatList
          data={myEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="calendar-outline" size={80} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-500 mt-4">No Events Created</Text>
          <Text className="text-gray-400 text-center mt-2 px-10">
            You haven't created any events yet. Tap the plus button below to create your first event.
          </Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateEvent}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#059669',
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
});