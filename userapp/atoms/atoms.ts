import { atom } from "recoil";

export const authState  = atom({
    key:"authState",
    default : false
})
export interface TeamFormState {
    name: string;
    location: string;
    customCity?: string;
    maxPlayers?: number;
    playerIds: number[];
  }
  export interface FootballMatchBaseData {
    location: string;
    playersPerTeam: number;
    numberOfReferees: number;
    referees: string[];
  };
  
export interface footballTeamWithRelations {
  id: number;
  name: string;
  location: string;
  maxPlayers: number;
  createdBy: {
    id: number;
    nickname: string;
  };
  members: {
    footballProfile: {
      id: number;
      nickname: string;
    };
  }[];
}
export interface signUpModel{
  firstname:string;
  lastname: string;
  email:string;
  contact:string;
  dob : string;
  city:string;
}

export const signUpAtom = atom<signUpModel>({
  key: 'signUpAtom',
  default : {
    firstname :'',
    lastname: '',
    email :'',
    contact:'',
    dob :'',
    city :''
  }

})

export const footballteamAtom = atom<TeamFormState>({
  key: 'teamFormAtom',
  default: {
    name: '',
    location: '',
    customCity: '',
    maxPlayers: undefined,
    playerIds: [],
  },
});

export const createdTeamsAtom = atom<footballTeamWithRelations[] | null>({
  key: 'createdTeamsAtom',
  default: null,
});

export const joinedTeamsAtom = atom<footballTeamWithRelations[] | null>({
  key: 'joinedTeamsAtom',
  default: null,
});



export const footballMatchAtom = atom<FootballMatchBaseData>({
  key: 'footballMatchAtom',
  default: {
    location: '',
    playersPerTeam: 11,
    numberOfReferees: 1,
    referees: [''],
  },
});


export interface footballPlayer {
  id : number,
  nickname: string;
  role: string;
  experience: string;
}

export interface footballTeam {
  id: number;
  teamName: string;
  maxPlayers: number;
  players: footballPlayer[]; // Array of players (not required at this stage but will be used later)
}

export const allTeamsDataAtom = atom<footballTeam[]>({
  key: 'allTeamsDataAtom',  // Unique identifier for this atom
  default: [],  // Initially, it's an empty array until we fetch the data
});

export const myTeamDataAtom = atom({
  key: 'myTeamDataAtom',  
  default: {
    teamId: null as number | null,
    teamName: '',
    maxPlayers: 0,
    players: [] as footballPlayer[], // This will hold players once selected
  },
});

export const opponentTeamDataAtom = atom({
  key: 'opponentTeamDataAtom',  
  default: {
    teamId: null as number | null,
    teamName: '',
    maxPlayers: 0,
    players: [] as footballPlayer[], // This will hold players once selected
  },
});

export interface MatchSetupDetails {
  myTeamCaptain: string;
  opponentTeamCaptain: string;
  substitutionsAllowed: number;
  extraTimeAllowed: boolean;
  scorers: string[]; // just names for now
}

export const matchSetupDetailsAtom = atom<MatchSetupDetails>({
  key: 'matchSetupDetailsAtom',
  default: {
    myTeamCaptain: '',
    opponentTeamCaptain: '',
    substitutionsAllowed: 3,
    extraTimeAllowed: false,
    scorers: [],
  },
});


export const eventLogAtom = atom({
  key: 'eventLogAtom',
  default: [] as {
    type: string;
    subType: string;
    playerName: string;
    time: string;
  }[],
});