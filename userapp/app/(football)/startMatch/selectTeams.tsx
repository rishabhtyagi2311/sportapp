// app/(football)/matches/createMatch.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';

interface Team {
  id: string;
  teamName: string;
  city: string;
  memberPlayerIds: string[];
  maxPlayers: number;
  status: string;
}

// Safe navigation utility with fallback
const createSafeNavigation = () => {
  const navigate = (action: () => void, fallback?: () => void) => {
    try {
      action();
    } catch (error) {
      console.warn('Primary navigation failed:', error);
      if (fallback) {
        try {
          fallback();
        } catch (fallbackError) {
          console.error('Fallback navigation failed:', fallbackError);
          Alert.alert(
            'Navigation Error',
            'Unable to navigate. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  return {
    push: (href: string, options?: any) => {
      navigate(
        () => router.push(href, options),
        () => {
          // Retry with delay as fallback
          setTimeout(() => router.push(href, options), 100);
        }
      );
    },
    back: () => {
      navigate(
        () => router.back(),
        () => router.replace('/(football)/matches')
      );
    },
    replace: (href: string, options?: any) => {
      navigate(
        () => router.replace(href, options),
        () => {
          setTimeout(() => router.replace(href, options), 100);
        }
      );
    }
  };
};

export default function SelectTeamsScreen() {
  // State management
  const { teams } = useFootballStore();
  const [selectedMyTeam, setSelectedMyTeam] = useState<Team | null>(null);
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<Team | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  
  // Router instances - hybrid approach for maximum reliability
  const contextRouter = useRouter();
  const safeNav = useMemo(() => createSafeNavigation(), []);

  // Ensure navigation context is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Debug logging
  useEffect(() => {
    
  }, [navigationReady, contextRouter]);

  // Safe team selection handlers
  const handleMyTeamSelection = useCallback((team: Team) => {
    try {
      console.log('Selecting my team:', team.teamName);
      setSelectedMyTeam(team);
      
      // Clear opponent if same team selected
      if (selectedOpponentTeam && selectedOpponentTeam.id === team.id) {
        setSelectedOpponentTeam(null);
      }
    } catch (error) {
      console.error('Error selecting my team:', error);
      Alert.alert('Selection Error', 'Failed to select team. Please try again.');
    }
  }, [selectedOpponentTeam]);

  const handleOpponentTeamSelection = useCallback((team: Team) => {
    try {
      console.log('Selecting opponent team:', team.teamName);
      setSelectedOpponentTeam(team);
      
      // Clear my team if same team selected
      if (selectedMyTeam && selectedMyTeam.id === team.id) {
        setSelectedMyTeam(null);
      }
    } catch (error) {
      console.error('Error selecting opponent team:', error);
      Alert.alert('Selection Error', 'Failed to select team. Please try again.');
    }
  }, [selectedMyTeam]);

  // Safe navigation handlers
  const handleGoBack = useCallback(() => {
    if (!navigationReady) {
      console.warn('Navigation not ready, delaying back action');
      setTimeout(handleGoBack, 100);
      return;
    }

    try {
      console.log('Navigating back');
      safeNav.back();
    } catch (error) {
      console.error('Back navigation failed:', error);
    }
  }, [navigationReady, safeNav]);

  const handleProceed = useCallback(async () => {
    if (!navigationReady) {
      console.warn('Navigation not ready');
      Alert.alert('Please Wait', 'Navigation is not ready. Please try again in a moment.');
      return;
    }

    if (!selectedMyTeam || !selectedOpponentTeam) {
      Alert.alert('Selection Required', 'Please select both teams before proceeding.');
      return;
    }

    if (selectedMyTeam.id === selectedOpponentTeam.id) {
      Alert.alert('Invalid Selection', 'My team and opponent team must be different.');
      return;
    }

    try {
      setIsNavigating(true);
      console.log('Proceeding to match setup with teams:', {
        myTeam: selectedMyTeam.teamName,
        opponent: selectedOpponentTeam.teamName
      });

      const url = `/startMatch/basicDetailsOne?myTeamId=${selectedMyTeam.id}&opponentTeamId=${selectedOpponentTeam.id}`;
      
      // Use context router first, fallback to global
      try {
        contextRouter.push(url);
      } catch (contextError) {
        console.warn('Context router failed, using safe navigation:', contextError);
        safeNav.push(url);
      }

    } catch (error) {
      console.error('Proceed navigation failed:', error);
      Alert.alert(
        'Navigation Error',
        'Failed to proceed to next step. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Reset navigation state after delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  }, [
    navigationReady,
    selectedMyTeam,
    selectedOpponentTeam,
    contextRouter,
    safeNav
  ]);

  // Memoized team card renderer
  const renderTeamCard = useCallback((
    team: Team,
    isSelected: boolean,
    onSelect: () => void,
    teamType: 'my' | 'opponent'
  ) => (
    <TouchableOpacity
      key={team.id}
      onPress={() => {
        console.log(`Team card clicked: ${team.teamName} (${teamType})`);
        try {
          onSelect();
        } catch (error) {
          console.error('Team selection error:', error);
        }
      }}
      activeOpacity={0.7}
      disabled={isNavigating}
      className={`rounded-2xl p-4 mb-3 border-2 ${
        isSelected 
          ? teamType === 'my' 
            ? 'bg-green-50 border-green-300' 
            : 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      } ${isNavigating ? 'opacity-50' : ''}`}
      style={{
        elevation: isSelected ? 3 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.15 : 0.05,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className={`text-lg font-bold ${
              isSelected 
                ? teamType === 'my' ? 'text-green-800' : 'text-blue-800'
                : 'text-gray-900'
            }`}>
              {team.teamName}
            </Text>
            {team.status === 'active' && (
              <View className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name="location-outline" 
              size={14} 
              color={isSelected ? (teamType === 'my' ? '#166534' : '#1e40af') : '#6b7280'} 
            />
            <Text className={`text-sm ml-1 ${
              isSelected 
                ? teamType === 'my' ? 'text-green-700' : 'text-blue-700'
                : 'text-gray-600'
            }`}>
              {team.city}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons 
              name="people-outline" 
              size={14} 
              color={isSelected ? (teamType === 'my' ? '#166534' : '#1e40af') : '#6b7280'} 
            />
            <Text className={`text-sm ml-1 ${
              isSelected 
                ? teamType === 'my' ? 'text-green-700' : 'text-blue-700'
                : 'text-gray-600'
            }`}>
              {team.memberPlayerIds.length}/{team.maxPlayers} Players
            </Text>
          </View>
        </View>
        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          isSelected 
            ? teamType === 'my'
              ? 'bg-green-500 border-green-500'
              : 'bg-blue-500 border-blue-500'
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [isNavigating]);

  // Computed values
  const canProceed = useMemo(() => 
    selectedMyTeam && 
    selectedOpponentTeam && 
    selectedMyTeam.id !== selectedOpponentTeam.id &&
    navigationReady &&
    !isNavigating
  , [selectedMyTeam, selectedOpponentTeam, navigationReady, isNavigating]);

  const availableOpponentTeams = useMemo(() => 
    teams.filter(team => team.id !== selectedMyTeam?.id)
  , [teams, selectedMyTeam]);

  // Error state handling
  if (!teams || teams.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <View className="items-center">
          <Ionicons name="alert-circle-outline" size={48} color="#6b7280" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            No Teams Available
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            You need to create teams before setting up a match.
          </Text>
          <TouchableOpacity
            onPress={handleGoBack}
            className="bg-gray-900 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-900 px-4 py-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            disabled={isNavigating}
            className={`mr-4 w-10 h-10 bg-gray-700 rounded-xl items-center justify-center ${
              isNavigating ? 'opacity-50' : ''
            }`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              Setup Match
            </Text>
            <Text className="text-gray-300 mt-1">
              Choose your team and opponent
            </Text>
          </View>
          
          <View className="w-10 h-10 bg-gray-700 rounded-xl items-center justify-center">
            {isNavigating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="football" size={20} color="white" />
            )}
          </View>
        </View>
      </View>

      {/* Match Preview */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-200 shadow-sm">
        <View className="flex-row items-center justify-between">
          {/* My Team */}
          <View className="flex-1 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-2">
              <Ionicons 
                name="shield" 
                size={24} 
                color={selectedMyTeam ? "#16a34a" : "#9ca3af"} 
              />
            </View>
            <Text className="text-xs text-green-600 font-semibold mb-1">MY TEAM</Text>
            <Text className="text-sm font-bold text-gray-900 text-center" numberOfLines={1}>
              {selectedMyTeam ? selectedMyTeam.teamName : 'Select Team'}
            </Text>
          </View>
          
          {/* VS Divider */}
          <View className="mx-4 items-center">
            <View className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">VS</Text>
            </View>
          </View>
          
          {/* Opponent Team */}
          <View className="flex-1 items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-2">
              <Ionicons 
                name="flag" 
                size={24} 
                color={selectedOpponentTeam ? "#2563eb" : "#9ca3af"} 
              />
            </View>
            <Text className="text-xs text-blue-600 font-semibold mb-1">OPPONENT</Text>
            <Text className="text-sm font-bold text-gray-900 text-center" numberOfLines={1}>
              {selectedOpponentTeam ? selectedOpponentTeam.teamName : 'Select Team'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 pt-6" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={!isNavigating}
      >
        {/* My Team Selection */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="shield" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Select My Team</Text>
          </View>
          {teams.map(team => 
            renderTeamCard(
              team,
              selectedMyTeam?.id === team.id,
              () => handleMyTeamSelection(team),
              'my'
            )
          )}
        </View>

        {/* Opponent Team Selection */}
        <View className="mx-4">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="flag" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Select Opponent Team</Text>
          </View>
          {availableOpponentTeams.map(team => 
            renderTeamCard(
              team,
              selectedOpponentTeam?.id === team.id,
              () => handleOpponentTeamSelection(team),
              'opponent'
            )
          )}
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!canProceed}
          className={`rounded-2xl py-4 flex-row items-center justify-center ${
            canProceed ? 'bg-gray-900' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          style={canProceed ? { 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 3 }, 
            shadowOpacity: 0.2, 
            shadowRadius: 6, 
            elevation: 4 
          } : {}}
        >
          {isNavigating ? (
            <>
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="font-bold text-lg text-white">
                Setting up match...
              </Text>
            </>
          ) : (
            <>
              <Text className={`font-bold text-lg mr-2 ${
                canProceed ? 'text-white' : 'text-gray-500'
              }`}>
                Proceed to Match Setup
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={canProceed ? 'white' : '#6b7280'} 
              />
            </>
          )}
        </TouchableOpacity>
        
        {/* Error Messages */}
        {!navigationReady && (
          <Text className="text-orange-500 text-sm text-center mt-2">
            Preparing navigation...
          </Text>
        )}
        {selectedMyTeam && selectedOpponentTeam && selectedMyTeam.id === selectedOpponentTeam.id && (
          <Text className="text-red-500 text-sm text-center mt-2">
            My team and opponent team must be different
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}