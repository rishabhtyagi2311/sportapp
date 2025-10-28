// hooks/useFootballMatches.ts
import { useMemo } from 'react';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useTournamentStore } from '@/store/footballTournamentStore';

// Define a common interface for all match types to display
export interface DisplayMatch {
  id: string;
  type: 'completed' | 'live' | 'upcoming';
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: string;
  date: Date;
  venue?: string;
  tournament?: string;
}

export function useFootballMatches() {
  // Get data from stores
  const { completedMatches, liveMatches } = useMatchExecutionStore();
  const { tournaments } = useTournamentStore();
  
  // Transform completed matches to display format
  const transformedCompleted = useMemo(() => {
    if (!completedMatches || !Array.isArray(completedMatches)) return [];
    
    return completedMatches.map(match => ({
      id: match.id,
      type: 'completed' as const,
      homeTeamId: match.matchSetup.myTeam.teamId,
      awayTeamId: match.matchSetup.opponentTeam.teamId,
      homeTeamName: match.matchSetup.myTeam.teamName,
      awayTeamName: match.matchSetup.opponentTeam.teamName,
      homeTeamScore: match.homeTeamScore,
      awayTeamScore: match.awayTeamScore,
      status: match.status,
      date: new Date(match.startTime),
      venue: match.venue,
    }));
  }, [completedMatches]);
  
  // Transform live matches to display format
  const transformedLive = useMemo(() => {
    if (!liveMatches || !Array.isArray(liveMatches)) return [];
    
    return liveMatches.map(match => ({
      id: match.id,
      type: 'live' as const,
      homeTeamId: match.matchSetup.myTeam.teamId,
      awayTeamId: match.matchSetup.opponentTeam.teamId,
      homeTeamName: match.matchSetup.myTeam.teamName,
      awayTeamName: match.matchSetup.opponentTeam.teamName,
      homeTeamScore: match.homeTeamScore,
      awayTeamScore: match.awayTeamScore,
      status: match.status,
      date: new Date(match.startTime),
      venue: match.matchSetup.venue?.name || 'Unknown Venue',
    }));
  }, [liveMatches]);
  
  // Get upcoming matches from tournaments - using fixtures instead of matches
  const upcomingMatches = useMemo(() => {
    const upcoming: DisplayMatch[] = [];
    
    if (!tournaments || !Array.isArray(tournaments)) return upcoming;
    
    tournaments.forEach(tournament => {
      try {
        // Get upcoming fixtures (matches)
        if (tournament.fixtures && Array.isArray(tournament.fixtures)) {
          tournament.fixtures
            .filter(fixture => 
              fixture.status === 'upcoming' && 
              fixture.homeTeamId !== null && 
              fixture.awayTeamId !== null
            )
            .forEach(fixture => {
              upcoming.push({
                id: fixture.id,
                type: 'upcoming' as const,
                homeTeamId: fixture.homeTeamId || '',
                awayTeamId: fixture.awayTeamId || '',
                homeTeamName: fixture.homeTeamName,
                awayTeamName: fixture.awayTeamName,
                homeTeamScore: fixture.homeScore,
                awayTeamScore: fixture.awayScore,
                status: fixture.status,
                date: fixture.scheduledDate ? new Date(fixture.scheduledDate) : new Date(),
                venue: fixture.venue || 'TBD',
                tournament: `${tournament.name}${fixture.roundName ? ` - ${fixture.roundName}` : ''}`
              });
            });
        }
      } catch (error) {
        console.error('Error processing tournament fixtures:', error);
      }
    });
    
    // Sort by date (soonest first)
    return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tournaments]);
  
  return {
    completed: transformedCompleted,
    live: transformedLive,
    upcoming: upcomingMatches,
  };
}