export declare class FootballTeamService {
    static createTeam(userId: number, data: {
        name: string;
        location: string;
        maxPlayers: number;
        playerIds: number[];
    }): Promise<({
        createdBy: {
            user: {
                id: number;
                city: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dob: string;
                contact: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            experience: string;
            nickname: string;
            role: string;
        };
        members: ({
            footballProfile: {
                user: {
                    id: number;
                    city: string;
                    createdAt: Date;
                    updatedAt: Date;
                    password: string;
                    email: string;
                    dob: string;
                    contact: string;
                    firstname: string;
                    lastname: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                experience: string;
                nickname: string;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            footballTeamId: number;
            footballProfileId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        location: string;
        maxPlayers: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        matchesDrawn: number;
    }) | null>;
    static getMyTeams(userId: number): Promise<({
        createdBy: {
            user: {
                id: number;
                city: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dob: string;
                contact: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            experience: string;
            nickname: string;
            role: string;
        };
        members: ({
            footballProfile: {
                user: {
                    id: number;
                    city: string;
                    createdAt: Date;
                    updatedAt: Date;
                    password: string;
                    email: string;
                    dob: string;
                    contact: string;
                    firstname: string;
                    lastname: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                experience: string;
                nickname: string;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            footballTeamId: number;
            footballProfileId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        location: string;
        maxPlayers: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        matchesDrawn: number;
    })[]>;
    static getAllPlayers(): Promise<{
        id: number;
        userId: number;
        experience: string;
        nickname: string;
        role: string;
    }[]>;
    static getAllTeams(): Promise<({
        createdBy: {
            user: {
                id: number;
                city: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dob: string;
                contact: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            experience: string;
            nickname: string;
            role: string;
        };
        members: ({
            footballProfile: {
                user: {
                    id: number;
                    city: string;
                    createdAt: Date;
                    updatedAt: Date;
                    password: string;
                    email: string;
                    dob: string;
                    contact: string;
                    firstname: string;
                    lastname: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                experience: string;
                nickname: string;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            footballTeamId: number;
            footballProfileId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        location: string;
        maxPlayers: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        matchesDrawn: number;
    })[]>;
    static getTeamById(teamId: number): Promise<({
        createdBy: {
            user: {
                id: number;
                city: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dob: string;
                contact: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            experience: string;
            nickname: string;
            role: string;
        };
        members: ({
            footballProfile: {
                user: {
                    id: number;
                    city: string;
                    createdAt: Date;
                    updatedAt: Date;
                    password: string;
                    email: string;
                    dob: string;
                    contact: string;
                    firstname: string;
                    lastname: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                experience: string;
                nickname: string;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            footballTeamId: number;
            footballProfileId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        location: string;
        maxPlayers: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        matchesDrawn: number;
    }) | null>;
    static addMember(userId: number, teamId: number, playerId: number): Promise<({
        createdBy: {
            user: {
                id: number;
                city: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dob: string;
                contact: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            experience: string;
            nickname: string;
            role: string;
        };
        members: ({
            footballProfile: {
                user: {
                    id: number;
                    city: string;
                    createdAt: Date;
                    updatedAt: Date;
                    password: string;
                    email: string;
                    dob: string;
                    contact: string;
                    firstname: string;
                    lastname: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                experience: string;
                nickname: string;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            footballTeamId: number;
            footballProfileId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        location: string;
        maxPlayers: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        matchesDrawn: number;
    }) | null>;
}
//# sourceMappingURL=team.d.ts.map