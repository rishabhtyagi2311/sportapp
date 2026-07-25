import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Tournament, TournamentFixture } from '@/types/football';

interface Props {
  tournament: Tournament;
  onPressMatch: (fixture: TournamentFixture) => void;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 90;
const GAP_HEIGHT = 20;

export default function KnockoutBracket({ tournament, onPressMatch }: Props) {
  const totalRounds = Math.log2(tournament.teamCount);
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  const getRoundName = (round: number) => {
    const diff = totalRounds - round;
    if (diff === 0) return 'Final';
    if (diff === 1) return 'Semi-Final';
    if (diff === 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  const renderMatchCard = (fixture: TournamentFixture, roundIndex: number, indexInRound: number) => {
    const isCompleted = fixture.status === 'completed';

    return (
      <TouchableOpacity
        key={fixture.id}
        activeOpacity={0.9}
        onPress={() => onPressMatch(fixture)}
        style={[
          styles.matchCard,
          { marginTop: roundIndex === 0 ? GAP_HEIGHT : 0 },
          { marginBottom: GAP_HEIGHT * Math.pow(2, roundIndex) }
        ]}
      >
        {isCompleted && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>DONE</Text>
          </View>
        )}

        {/* Home Team */}
        <View style={styles.teamRow}>
          <Text numberOfLines={1} style={[styles.teamName, !fixture.homeTeamId && styles.tbdText]}>
            {fixture.homeTeam?.name || 'TBD'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Away Team */}
        <View style={styles.teamRow}>
          <Text numberOfLines={1} style={[styles.teamName, !fixture.awayTeamId && styles.tbdText]}>
            {fixture.awayTeam?.name || 'TBD'}
          </Text>
        </View>

        {/* Connector Line */}
        {roundIndex < totalRounds - 1 && (
          <View style={[
            styles.connector,
            {
              height: (CARD_HEIGHT + (GAP_HEIGHT * Math.pow(2, roundIndex))) / 2,
              top: indexInRound % 2 === 0 ? '50%' : 'auto',
              bottom: indexInRound % 2 !== 0 ? '50%' : 'auto',
              borderTopWidth: indexInRound % 2 === 0 ? 2 : 0,
              borderBottomWidth: indexInRound % 2 !== 0 ? 2 : 0,
            }
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {rounds.map((round, rIndex) => {
        const roundFixtures = tournament.fixtures.filter((f) => f.round === round);

        return (
          <View key={round} style={styles.roundColumn}>
            <Text style={styles.roundTitle}>{getRoundName(round)}</Text>
            <View style={{ justifyContent: 'space-around', flex: 1 }}>
              {roundFixtures.map((fixture, idx) => renderMatchCard(fixture, rIndex, idx))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  roundColumn: { width: CARD_WIDTH + 40, alignItems: 'flex-start' },
  roundTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 16, marginLeft: 4, textTransform: 'uppercase' },
  matchCard: {
    width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: 'white', borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    position: 'relative', marginRight: 40,
  },
  matchBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#bbf7d0' },
  matchBadgeText: { fontSize: 10, color: '#15803d', fontWeight: 'bold' },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  teamName: { fontSize: 13, fontWeight: '500', color: '#334155', flex: 1, marginRight: 8 },
  tbdText: { color: '#cbd5e1', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 6 },
  connector: { position: 'absolute', right: -20, width: 20, borderColor: '#cbd5e1', borderRightWidth: 2 },
});
