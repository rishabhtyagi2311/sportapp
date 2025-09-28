// app/(football)/startMatch/basicDetailsOne.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { dummyVenues } from '@/constants/venueData';
import { useMatchCreationStore, MatchVenue, MatchReferee } from '@/store/footballMatchCreationStore';
interface Venue {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  rating: number;
  sports: any[];
}

export default function MatchDetailsForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    initializeMatch, 
    updateMatchDetails, 
    matchData, 
    canProceedToNextStep 
  } = useMatchCreationStore();
  
  // Initialize match data from route params
  useEffect(() => {
    if (params.myTeamId && params.opponentTeamId) {
      initializeMatch(
        params.myTeamId as string,
        params.myTeamName as string || 'My Team',
        params.opponentTeamId as string,
        params.opponentTeamName as string || 'Opponent Team'
      );
    }
  }, [params, initializeMatch]);
  
  const [venueInput, setVenueInput] = useState('');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showVenueList, setShowVenueList] = useState(false);
  
  const [playersPerTeam, setPlayersPerTeam] = useState('11');
  const [refereeCount, setRefereeCount] = useState('1');
  const [refereeNames, setRefereeNames] = useState<string[]>(['']);

  useEffect(() => {
    if (venueInput.length > 0) {
      const filtered = dummyVenues.filter(venue =>
        venue.name.toLowerCase().includes(venueInput.toLowerCase())
      );
      setFilteredVenues(filtered);
      setShowVenueList(true);
    } else {
      setFilteredVenues([]);
      setShowVenueList(false);
    }
  }, [venueInput]);

  useEffect(() => {
    const count = parseInt(refereeCount) || 1;
    const newRefereeNames = Array(count).fill('').map((_, index) => 
      refereeNames[index] || ''
    );
    setRefereeNames(newRefereeNames);
  }, [refereeCount]);

  const handleVenueSelect = (venue: Venue) => {
    setFilteredVenues([]);
    setVenueInput(venue.name);
    setSelectedVenue(venue);
    setShowVenueList(false);
    
    Keyboard.dismiss();
  };

  const handleVenueInputChange = (text: string) => {
    setVenueInput(text);
    setSelectedVenue(null);
  };

  const handleRefereeNameChange = (index: number, name: string) => {
    const newNames = [...refereeNames];
    newNames[index] = name;
    setRefereeNames(newNames);
  };

  const handleProceed = () => {
    // Validation
    if (!venueInput.trim()) {
      alert('Please enter a venue');
      return;
    }
    
    const playersCount = parseInt(playersPerTeam);
    if (!playersCount || playersCount < 1) {
      alert('Please enter valid number of players per team');
      return;
    }

    const refCount = parseInt(refereeCount);
    if (!refCount || refCount < 1) {
      alert('Please enter valid number of referees');
      return;
    }

    // Prepare venue data
    const venueData: MatchVenue = selectedVenue 
      ? {
          id: selectedVenue.id,
          name: selectedVenue.name,
          address: selectedVenue.address,
          isCustom: false
        }
      : {
          name: venueInput.trim(),
          isCustom: true
        };

    // Prepare referee data
    const refereeData: MatchReferee[] = refereeNames
      .filter(name => name.trim())
      .map((name, index) => ({
        name: name.trim(),
        index: index + 1
      }));

    // Update store with match details
    updateMatchDetails(venueData, playersCount, refereeData);

    // Navigate to player selection (no params needed!)
    router.push('/(football)/startMatch/selectMyPlayers');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="bg-slate-900 px-4 py-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 w-10 h-10 bg-slate-700 rounded-xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                Match Details
              </Text>
              <Text className="text-slate-300 mt-1">
                {matchData.myTeam.teamName} vs {matchData.opponentTeam.teamName}
              </Text>
            </View>
            
            <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
              <Ionicons name="document-text" size={20} color="white" />
            </View>
          </View>
        </View>

        <KeyboardAwareScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          {/* Venue Selection */}
          <View className="mx-4 mt-6 mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">
              Match Venue
            </Text>
            
            <View className="relative">
              <View className="bg-white rounded-xl border border-slate-200 flex-row items-center px-4">
                <Ionicons name="location" size={20} color="#64748b" />
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-slate-900"
                  placeholder="Enter venue name"
                  placeholderTextColor="#94a3b8"
                  value={venueInput}
                  onChangeText={handleVenueInputChange}
                  onFocus={() => venueInput.length > 0 && setShowVenueList(true)}
                />
                {venueInput.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setVenueInput('');
                    setSelectedVenue(null);
                    setShowVenueList(false);
                  }}>
                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Venue Suggestions */}
              {showVenueList && filteredVenues.length > 0 && (
                <View className="absolute top-16 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-lg z-10 max-h-48">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredVenues.map((venue) => (
                      <TouchableOpacity
                        key={venue.id}
                        onPress={() => handleVenueSelect(venue)}
                        className="bg-white p-4 border-b border-slate-100"
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-start">
                          <View className="flex-1">
                            <Text className="text-slate-900 font-semibold text-base mb-1">
                              {venue.name}
                            </Text>
                            <Text className="text-slate-600 text-sm mb-2">
                              {venue.address.street}, {venue.address.city}
                            </Text>
                            <View className="flex-row items-center">
                              <Ionicons name="star" size={14} color="#f59e0b" />
                              <Text className="text-slate-600 text-sm ml-1">
                                {venue.rating} • {venue.sports.map(sport => sport.name).join(', ')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Players Per Team */}
          <View className="mx-4 mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">
              Players Per Team
            </Text>
            
            <View className="bg-white rounded-xl border border-slate-200 flex-row items-center px-4">
              <Ionicons name="people" size={20} color="#64748b" />
              <TextInput
                className="flex-1 py-4 px-3 text-base text-slate-900"
                placeholder="Number of players (e.g., 11)"
                placeholderTextColor="#94a3b8"
                value={playersPerTeam}
                onChangeText={setPlayersPerTeam}
                keyboardType="numeric"
              />
            </View>
            
            <Text className="text-slate-600 text-sm mt-2 px-2">
              Standard football: 11 players, Small-sided: 7 players
            </Text>
          </View>

          {/* Referee Count */}
          <View className="mx-4 mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">
              Number of Referees
            </Text>
            
            <View className="bg-white rounded-xl border border-slate-200 flex-row items-center px-4">
              <Ionicons name="flag" size={20} color="#64748b" />
              <TextInput
                className="flex-1 py-4 px-3 text-base text-slate-900"
                placeholder="Number of referees (e.g., 1)"
                placeholderTextColor="#94a3b8"
                value={refereeCount}
                onChangeText={setRefereeCount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Referee Names */}
          {refereeNames.length > 0 && (
            <View className="mx-4 mb-8">
              <Text className="text-lg font-bold text-slate-900 mb-4">
                Referee Names
              </Text>
              
              {refereeNames.map((name, index) => (
                <View key={index} className="mb-3">
                  <Text className="text-slate-700 font-medium mb-2">
                    Referee {index + 1}
                  </Text>
                  <View className="bg-white rounded-xl border border-slate-200 flex-row items-center px-4">
                    <Ionicons name="person" size={20} color="#64748b" />
                    <TextInput
                      className="flex-1 py-4 px-3 text-base text-slate-900"
                      placeholder={`Enter referee ${index + 1} name`}
                      placeholderTextColor="#94a3b8"
                      value={name}
                      onChangeText={(text) => handleRefereeNameChange(index, text)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </KeyboardAwareScrollView>

        {/* Proceed Button */}
        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleProceed}
            className="bg-slate-900 rounded-xl py-4"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-base mr-2">
                Select Players
              </Text>
              <Ionicons name="people" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}