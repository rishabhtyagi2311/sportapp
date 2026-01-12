// app/(homeScreenTabs)/sports.tsx
import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SportsScreen() {
  
  const navigateToSport = (sport: string) => {
    console.log(`🎯 Navigating to ${sport}...`);
    if (sport === 'football') {
      router.push('/(football)/createFootballProfile');
    } else if (sport === 'cricket') {
      router.push('/(cricket)/createCricketProfile');
    } else if (sport === 'tennis') {
      router.push('/(tennis)/createTennisProfile');
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
        {/* Overlay for better visibility of icons */}
        <View className="absolute inset-0 bg-black/20" />

        {/* Sports Icons Container - Center - Vertical */}
        <View className="flex-1 justify-center items-center">
          <View className="gap-10">
            {sportIcons.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                onPress={() => navigateToSport(sport.id)}
                className="items-center"
                activeOpacity={0.7}
              >
                {/* Icon with shadow and background */}
                <View className="rounded-full bg-white p-4 shadow-lg">
                  <Image
                    source={sport.icon}
                    className="w-12 h-12"
                    resizeMode="contain"
                  />
                </View>
                
                {/* Sport Name */}
                <Text className="text-white font-bold text-lg mt-3 text-center font-sans">
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