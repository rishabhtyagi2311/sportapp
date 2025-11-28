// app/index.tsx
import 'react-native-gesture-handler';

import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './splashScreen';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  console.log('[Index] render. ready =', ready, 'initialRoute =', initialRoute);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Index] checkAuth: starting AsyncStorage.getItem("user_id")');
        const userId = await AsyncStorage.getItem('user_id');
        console.log('[Index] checkAuth: userId =', userId);

        if (userId) {
          setInitialRoute('/(homeScreenTabs)');
        } else {
          // later you can change this to your onboarding route if needed
          setInitialRoute('/(homeScreenTabs)');
        }
      } catch (error) {
        console.log('[Index] checkAuth error:', error);
        setInitialRoute('/(homeScreenTabs)');
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, []);

  // While we're still deciding the route, just let native splash stay
  if (!ready || !initialRoute) {
    console.log('[Index] not ready yet, returning null to keep native splash');
    return null;
  }

  console.log('[Index] ready, rendering SplashScreen that will navigate to', initialRoute);

  return (
    <SplashScreen
      
    />
  );
}
