import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutSelectSubstitutesScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();
  
  const { getTournament, activeMatch, updateMatchRoster } = useKnockoutStore();
  const { getTeamPlayers } = useFootballStore();
  
  const [homeSubs, setHomeSubs] = useState<string[]>([]);
  const [awaySubs, setAwaySubs] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  
  const tournament = getTournament(tournamentId);
  const maxSubs = tournament?.settings.numberOfSubstitutes || 5;

  // Filter out players who are already starters
  const homePool = useMemo(() => {
    if (!activeMatch) return [];
    return getTeamPlayers(activeMatch.homeTeamId).filter(p => !activeMatch.homeTeamPlayers.includes(p.id));
  }, [activeMatch]);

  const awayPool = useMemo(() => {
    if (!activeMatch) return [];
    return getTeamPlayers(activeMatch.awayTeamId).filter(p => !activeMatch.awayTeamPlayers.includes(p.id));
  }, [activeMatch]);

  const currentPool = currentTeam === 'home' ? homePool : awayPool;
  const currentSelected = currentTeam === 'home' ? homeSubs : awaySubs;

  const toggleSub = (id: string) => {
    const setter = currentTeam === 'home' ? setHomeSubs : setAwaySubs;
    const list = currentTeam === 'home' ? homeSubs : awaySubs;

    if (list.includes(id)) {
      setter(list.filter(pid => pid !== id));
    } else {
      if (list.length >= maxSubs) {
        Alert.alert('Bench Full', `Max ${maxSubs} substitutes allowed.`);
        return;
      }
      setter([...list, id]);
    }
  };

  const handleContinue = () => {
    if (currentTeam === 'home') {
      setCurrentTeam('away');
    } else {
      // Save full roster now (Starters + Subs)
      if (activeMatch) {
        updateMatchRoster(
          activeMatch.homeTeamPlayers, 
          activeMatch.awayTeamPlayers,
          homeSubs, 
          awaySubs
        );
      }
      
      router.push({
        pathname: `/(football)/startKnockOutTournament/${tournamentId}/enterReferee`,
        params: { fixtureId }
      });
    }
  };

  if (!activeMatch) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => currentTeam === 'away' ? setCurrentTeam('home') : router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Bench</Text>
          <View className="w-6" />
        </View>
        
        <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <Text className="text-sm text-amber-700 mb-1 font-semibold">Substitutes for</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-amber-900">
              {currentTeam === 'home' ? activeMatch.homeTeamName : activeMatch.awayTeamName}
            </Text>
            <View className="bg-amber-200 px-3 py-1 rounded-full">
              <Text className="text-amber-900 font-bold">{currentSelected.length} / {maxSubs}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {currentPool.length === 0 ? (
          <Text className="text-center text-slate-400 mt-10">No players available for bench.</Text>
        ) : (
          currentPool.map(player => {
            const isSelected = currentSelected.includes(player.id);
            return (
              <TouchableOpacity 
                key={player.id} 
                onPress={() => toggleSub(player.id)}
                className={`p-4 mb-2 rounded-xl border flex-row items-center justify-between ${
                  isSelected ? 'bg-amber-500 border-amber-600' : 'bg-white border-slate-200'
                }`}
              >
                <View>
                  <Text className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {player.name}
                  </Text>
                  <Text className={`text-xs ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                    {player.position}
                  </Text>
                </View>
                {isSelected && <Ionicons name="people" size={24} color="white" />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            {currentTeam === 'home' ? 'Next: Away Subs' : 'Next: Officials'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}