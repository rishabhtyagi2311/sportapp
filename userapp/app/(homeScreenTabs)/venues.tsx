// screens/BookingScreen.tsx

import React, { useEffect } from 'react';
import { View, StatusBar, Text, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import VenueTab from '@/components/venueTab';
import EventTab from '@/components/eventTab';
import { initializeBookingStore } from '@/utils/storeInitializer';

const Tab = createMaterialTopTabNavigator();


export default function BookingScreen() {
  useEffect(() => {
    // Initialize store with dummy data
    initializeBookingStore();
  }, []);

  return (
    <SafeAreaView className="flex-1 ">

        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#059669', // green-600
            tabBarInactiveTintColor: '#6b7280', // gray-500
            tabBarStyle: {
              backgroundColor: 'white',
              borderBottomWidth: 1,
              borderBottomColor: '#d1d5db', // gray-300
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#059669', // green-600
              height: 3,
            },
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: '600',
              textTransform: 'none',
            },
            tabBarItemStyle: {
              paddingVertical: 8,
            },
          }}
        >
          <Tab.Screen
            name="Venues"
            component={VenueTab}
            options={{
              tabBarLabel: 'Venues',
            }}
          />
          <Tab.Screen
            name="Events"
            component={EventTab}
            options={{
              tabBarLabel: 'Events',
            }}
          />
        </Tab.Navigator>
      
    </SafeAreaView>
  )
};

