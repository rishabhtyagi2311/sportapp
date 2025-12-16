import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// IMPORTS
import { useKnockoutStore, KnockoutFixture } from '@/store/knockoutTournamentStore';
import KnockoutBracket from '@/components/tournament/KnockOutBracket';

type TabKey = 'bracket' | 'matches' | 'teams';

export default function KnockoutDashboard() {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  
  // Store Actions
  const { getTournament, initializeMatch, deleteKnockoutTournament } = useKnockoutStore();
  const tournament = getTournament(tournamentId);

  const [activeTab, setActiveTab] = useState<TabKey>('bracket');

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Tournament not found</Text>
        <TouchableOpacity onPress={() => router.back()}><Text className="text-blue-500 mt-4">Go Back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- NAVIGATION LOGIC ---
  const handleMatchPress = (fixture: KnockoutFixture) => {
    // 1. Validation: Are teams decided?
    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      Alert.alert('Upcoming Match', 'The matchup is not set yet. Waiting for previous rounds to complete.');
      return;
    }

    // 2. Validation: Is match over?
    if (fixture.status === 'completed') {
      Alert.alert('Completed', `Final Score: ${fixture.homeTeamName} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayTeamName}`);
      return;
    }

    // 3. Initialize Staging in Store
    initializeMatch(tournament.id, fixture.id);

    // 4. ROUTER NAVIGATION
    if (fixture.status === 'in_progress') {
      
    } else {
      // Match is new -> Go to Setup (Select Players)
      router.push({
        pathname: '/(football)/startKnockOutTournament/selectPlayers',
        params: { tournamentId: tournament.id, fixtureId: fixture.id }
      });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteKnockoutTournament(tournament.id);
          router.replace('/(organizer)/tournament/formatSelection');
      }}
    ]);
  };

  // --- RENDER HELPERS ---
  const renderMatchesList = () => (
    <FlatList
      data={tournament.fixtures}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => handleMatchPress(item)}
          className="bg-white p-4 mb-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-xs text-slate-400 font-bold uppercase mb-1">M{item.matchNumber} • {item.stage.replace('_', ' ')}</Text>
            <Text className="font-bold text-slate-900">{item.homeTeamName || 'TBD'} vs {item.awayTeamName || 'TBD'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      )}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-slate-200 flex-row justify-between items-center">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <View className="ml-4">
                <Text className="text-xl font-bold text-slate-900">{tournament.name}</Text>
                <Text className="text-slate-500 text-xs">{tournament.totalRounds} Rounds • Knockout</Text>
            </View>
        </View>
        <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-slate-200">
        {(['bracket', 'matches', 'teams'] as TabKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === key ? 'border-blue-600' : 'border-transparent'}`}
          >
            <Text className={`font-semibold capitalize ${activeTab === key ? 'text-blue-600' : 'text-slate-500'}`}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'bracket' && (
          <KnockoutBracket 
            tournament={tournament} 
            onPressMatch={handleMatchPress} // <--- Passing the function here!
          />
        )}
        {activeTab === 'matches' && renderMatchesList()}
        {activeTab === 'teams' && (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {tournament.teams.map((t, i) => (
                    <View key={t.id} className="bg-white p-4 mb-2 rounded-lg border border-slate-200">
                        <Text className="font-bold">{i+1}. {t.teamName}</Text>
                    </View>
                ))}
            </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}