// app/(homeScreenTabs)/sports.tsx

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ✅ Football store
import { useFootballStore } from '@/store/footballTeamStore';

export default function SportsScreen() {
  const { profile, fetchProfile } = useFootballStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const navigateToSport = (sport: string) => {
    if (sport === 'football') {
      if (profile) {
        // ✅ Player already has football profile
        router.push('/(football)/landingScreen/matches');
      } else {
        // ❌ No profile yet → create one
        router.push('/(football)/createFootballProfile');
      }
      return;
    }

    if (sport === 'cricket' || sport === 'tennis') {
      Alert.alert('Coming Soon', `${sport.charAt(0).toUpperCase() + sport.slice(1)} support is on the way.`);
      return;
    }
  };

  const sportIcons = [
    {
      id: 'football',
      name: 'Football',
      icon: require('@/assets/images/footballIcon.png'),
    },
    {
      id: 'cricket',
      name: 'Cricket',
      icon: require('@/assets/images/cricketIcon.png'),
    },
    {
      id: 'tennis',
      name: 'Tennis',
      icon: require('@/assets/images/tennisIcon.png'),
    },
  ];

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={require('@/assets/images/coverImageNew.png')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Overlay */}
        <View className="absolute inset-0 bg-black/20" />

        {/* Sports Icons */}
        <View className="flex-1 justify-center items-center">
          <View className="gap-10">
            {sportIcons.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                onPress={() => navigateToSport(sport.id)}
                className="items-center"
                activeOpacity={0.7}
              >
                <View className="rounded-full bg-white p-4 shadow-lg">
                  <Image
                    source={sport.icon}
                    className="w-12 h-12"
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-white font-bold text-lg mt-3 text-center">
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
