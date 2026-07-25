// hooks/useFootballMatches.ts
import { useEffect, useMemo } from 'react';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';

// Common interface for match types to display in lists
export interface DisplayMatch {
  id: string;
  type: 'completed' | 'live' | 'scheduled';
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: string;
  date: Date;
  venue?: string;
  duration: number;
}

export function useFootballMatches() {
  const { myMatches, isLoading, fetchMyMatches } = useMatchExecutionStore();

  useEffect(() => {
    fetchMyMatches();
  }, []);

  const transformed = useMemo<DisplayMatch[]>(() => {
    return myMatches.map((match) => ({
      id: match.id,
      type: match.status === 'completed' ? 'completed' : match.status === 'live' ? 'live' : 'scheduled',
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeamName: match.homeTeam?.name ?? 'Home',
      awayTeamName: match.awayTeam?.name ?? 'Away',
      homeTeamScore: match.homeScore,
      awayTeamScore: match.awayScore,
      status: match.status,
      date: new Date(match.startedAt ?? match.createdAt),
      venue: match.venueName,
      duration: match.duration,
    }));
  }, [myMatches]);

  return {
    completed: transformed.filter((m) => m.type === 'completed'),
    live: transformed.filter((m) => m.type === 'live'),
    upcoming: transformed.filter((m) => m.type === 'scheduled'),
    isLoading,
  };
}
