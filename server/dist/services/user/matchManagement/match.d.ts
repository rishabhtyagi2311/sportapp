type Roster = {
    startingXI: number[];
    bench: number[];
    captainId: number;
    subsUsed: number;
};
export declare class MatchService {
    static createMatch(userId: number, data: {
        homeTeamId: number;
        awayTeamId: number;
        venueName?: string;
        playersPerTeam: number;
        allowedSubs: number;
        extraTimeAllowed: boolean;
        duration: number;
        homeRoster: Roster;
        awayRoster: Roster;
        referees: string[];
    }): Promise<any>;
    static startMatch(userId: number, matchId: string): Promise<any>;
    static abandonMatch(userId: number, matchId: string, reason?: string): Promise<any>;
    static addEvent(userId: number, matchId: string, data: {
        teamId: number;
        playerId?: number;
        relatedPlayerId?: number;
        eventType: string;
        eventSubType?: string;
        minute: number;
        seconds: number;
        notes?: string;
    }): Promise<any>;
    static updatePossession(userId: number, matchId: string, data: {
        teamId: number;
        currentSeconds: number;
    }): Promise<any>;
    static endMatch(userId: number, matchId: string, data: {
        penaltyHomeScore?: number;
        penaltyAwayScore?: number;
        notes?: string;
    }): Promise<any>;
    static getMatchById(id: string): Promise<any>;
    static getMyMatches(userId: number): Promise<any[]>;
    static getTeamMatches(teamId: number): Promise<any[]>;
    static getPlayerStats(profileId: number): Promise<{
        matchesPlayed: number;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutesPlayed: number;
    }>;
}
export {};
//# sourceMappingURL=match.d.ts.map