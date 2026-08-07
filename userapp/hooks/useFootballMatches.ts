// hooks/useFootballMatches.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { footballService } from '@/services/football';

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
  duration?: number;
  scheduledAt?: string | null;
  creatorId: number;
}

export function useFootballMatches() {
  // Previously a mount-only fetch that never refreshed for the lifetime of
  // the screen — refetch-on-focus (the default) plus a real staleTime means
  // this now actually picks up new/updated matches on return visits, while
  // still not spamming the network on every render.
  const { data: myMatches = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['myMatches'],
    queryFn: () => footballService.fetchMyMatches(),
    staleTime: 15_000,
  });

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
      date: new Date(match.scheduledAt ?? match.startedAt ?? match.createdAt),
      venue: match.venueName,
      duration: match.duration,
      scheduledAt: match.scheduledAt,
      creatorId: match.creatorId,
    }));
  }, [myMatches]);

  return {
    completed: transformed.filter((m) => m.type === 'completed'),
    live: transformed.filter((m) => m.type === 'live'),
    upcoming: transformed.filter((m) => m.type === 'scheduled'),
    isLoading,
    isRefetching,
    refetch,
  };
}
