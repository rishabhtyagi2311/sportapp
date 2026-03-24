import React, { useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, Platform } from 'react-native';
import ActionModal from './actionModal'; 

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalVisible, setModalVisible] = useState(false);

  const isHome = pathname === '/';

  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#60a5fa',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            position: 'absolute',
            height: 85,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            // --- THE KEY FIXES ---
            overflow: 'visible', // Allows the icon to "break out" of the bar
          },
          tabBarBackground: () => (
            <BlurView 
              tint="dark" 
              intensity={80} 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              className="bg-slate-900/85" 
            />
          ),
        }}
      >
        <Tabs.Screen 
            name="venues" 
            options={{ 
                title: 'Venues',
                tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> 
            }} 
        />
        
        <Tabs.Screen
          name="sports"
          options={{
            title: 'Sports',
            tabBarIcon: ({ color }) => <Ionicons name="trophy-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="index"
          listeners={{
            tabPress: (e) => {
              if (isHome) {
                e.preventDefault();
                setModalVisible(true);
              } else {
                // If not home, the default behavior will take them home
              }
            },
          }}
          options={{
            title: isHome ? 'Add' : 'Home',
            tabBarIcon: ({ focused, color }) => (
              <View style={{
                // Lift the button up
                top: isHome ? -15 : 0,
                height: isHome ? 60 : 'auto',
                width: isHome ? 60 : 'auto',
                backgroundColor: isHome ? '#1e293b' : 'transparent', // Matches slate-900
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                // Shadow for depth
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }}> 
                <Ionicons 
                  name={isHome ? 'add-circle' : (focused ? 'home' : 'home-outline')} 
                  size={isHome ? 54 : 24} 
                  color={isHome ? "#60a5fa" : color} 
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen name="academy" options={{ title: 'Academy', tabBarIcon: ({ color }) => <Ionicons name="apps-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} />
      </Tabs>

      <ActionModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}