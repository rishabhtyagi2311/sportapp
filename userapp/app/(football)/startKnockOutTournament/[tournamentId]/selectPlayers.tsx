import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutSelectPlayersScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();
  
  const { 
    getTournament,
    activeMatch, 
    initializeMatch,
    updateMatchRoster
  } = useKnockoutStore();
  
  const { getTeamPlayers } = useFootballStore();
  
  const [homeSelected, setHomeSelected] = useState<string[]>([]);
  const [awaySelected, setAwaySelected] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  
  const tournament = getTournament(tournamentId);
  const requiredPlayers = tournament?.settings.numberOfPlayers || 11; // Standard is 11
  
  // Initialize if needed
  useEffect(() => {
    if (!activeMatch && tournamentId && fixtureId) {
      initializeMatch(tournamentId, fixtureId);
    }
  }, [tournamentId, fixtureId]);

  // Load available players from football store
  const homePool = useMemo(() => activeMatch ? getTeamPlayers(activeMatch.homeTeamId) : [], [activeMatch]);
  const awayPool = useMemo(() => activeMatch ? getTeamPlayers(activeMatch.awayTeamId) : [], [activeMatch]);
  
  const currentPool = currentTeam === 'home' ? homePool : awayPool;
  const currentSelected = currentTeam === 'home' ? homeSelected : awaySelected;

  const togglePlayer = (id: string) => {
    const setter = currentTeam === 'home' ? setHomeSelected : setAwaySelected;
    const list = currentTeam === 'home' ? homeSelected : awaySelected;

    if (list.includes(id)) {
      setter(list.filter(pid => pid !== id));
    } else {
      if (list.length >= requiredPlayers) {
        Alert.alert('Full', `You can only select ${requiredPlayers} starters.`);
        return;
      }
      setter([...list, id]);
    }
  };

  const handleContinue = () => {
    if (currentTeam === 'home') {
      if (homeSelected.length !== requiredPlayers) {
        Alert.alert('Invalid Lineup', `Please select exactly ${requiredPlayers} starters for Home team.`);
        return;
      }
      setCurrentTeam('away');
    } else {
      if (awaySelected.length !== requiredPlayers) {
        Alert.alert('Invalid Lineup', `Please select exactly ${requiredPlayers} starters for Away team.`);
        return;
      }
      
      // Save to store (partial update, subs come next)
      // We pass empty arrays for subs for now
      updateMatchRoster(homeSelected, awaySelected, [], []); 
      
      router.push({
        pathname: '/(football)/startKnockOutTournament/selectSubstitution',
        params: { tournamentId, fixtureId }
      });
    }
  };

  if (!activeMatch) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => currentTeam === 'away' ? setCurrentTeam('home') : router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Starters</Text>
          <View className="w-6" />
        </View>
        
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <Text className="text-sm text-blue-600 mb-1 font-semibold">Picking XI for</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-blue-900">
              {currentTeam === 'home' ? activeMatch.homeTeamName : activeMatch.awayTeamName}
            </Text>
            <View className="bg-blue-200 px-3 py-1 rounded-full">
              <Text className="text-blue-800 font-bold">{currentSelected.length} / {requiredPlayers}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {currentPool.map(player => {
          const isSelected = currentSelected.includes(player.id);
          return (
            <TouchableOpacity 
              key={player.id} 
              onPress={() => togglePlayer(player.id)}
              className={`p-4 mb-2 rounded-xl border flex-row items-center justify-between ${
                isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
              }`}
            >
              <View>
                <Text className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {player.name}
                </Text>
                <Text className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {player.position}
                </Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color="white" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity 
          onPress={handleContinue}
          className={`py-4 rounded-xl items-center ${
            currentSelected.length === requiredPlayers ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          disabled={currentSelected.length !== requiredPlayers}
        >
          <Text className="text-white font-bold text-lg">
            {currentTeam === 'home' ? 'Next: Away Team' : 'Next: Substitutes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}