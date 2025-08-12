// app/(homeScreenTabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#1f2937', // Header: slate-800
        },
        headerTitleStyle: {
          color: '#f1f5f9', // Light text
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,23,42,0.85)', // navy-ish blue for contrast
            }}
          />
        ),
        tabBarActiveTintColor: '#60a5fa', // sky-400
        tabBarInactiveTintColor: '#cbd5e1', // slate-300
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'sports') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Book') {
            iconName = focused ? 'calendar' : 'calendar-clear-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="sports"
        options={{
          title: 'Sports & Activities',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Book"
        options={{
          title: 'Venue',
        }}
      />
    </Tabs>
  );
}
