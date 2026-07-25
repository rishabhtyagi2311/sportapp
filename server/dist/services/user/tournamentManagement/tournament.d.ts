export declare class TournamentService {
    static createTournament(userId: number, data: {
        name: string;
        description?: string;
        format: "league" | "knockout";
        teamIds: number[];
        matchesPerPair?: number;
        extraTimeAllowed: boolean;
        playersPerTeam: number;
        allowedSubs: number;
        venueName?: string;
    }): Promise<any>;
    static startTournament(userId: number, tournamentId: string): Promise<any>;
    static startFixtureMatch(userId: number, tournamentId: string, fixtureId: string, data: {
        duration: number;
        homeRoster: any;
        awayRoster: any;
        referees: string[];
    }): Promise<any>;
    static getTournamentById(id: string): Promise<any>;
    static getMyTournaments(userId: number): Promise<any[]>;
    static deleteTournament(userId: number, id: string): Promise<void>;
}
//# sourceMappingURL=tournament.d.ts.map