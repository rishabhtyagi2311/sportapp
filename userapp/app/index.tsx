// app/index.tsx
import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
        AsyncStorage.clear()
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        router.replace("/(homeScreenTabs)");
      } else {
        router.replace("/(onboardingStack)/basicInfoRegisterOne");
      }
    };
    checkAuth();
  }, []);

  return null;
}
