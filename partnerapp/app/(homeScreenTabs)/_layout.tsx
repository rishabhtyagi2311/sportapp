import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={({ route }) => ({
        headerShown: false,

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

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },

        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,23,42,0.85)',
            }}
          />
        ),

        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#cbd5e1',

        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } 
          else if (route.name === 'sports') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } 
          else if (route.name === 'academy') {
            iconName = focused ? 'apps' : 'apps-outline';
          } 
          else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
   
      <Tabs.Screen
        name="index"
        options={{ title: 'Venue' }}
      />

      <Tabs.Screen
        name="academy"
        options={{ title: 'Academy' }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
