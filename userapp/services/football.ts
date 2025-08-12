
import axios from "axios";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  throw new Error("EXPO_PUBLIC_BACKEND_URL is not set in .env");
}

interface FootballProfileData {
  userId: number;
  role: string;
  nickname: string;
  experience: string;
}

interface CreateTeamPayload {
  name: string;
  location: string;
  maxPlayers: number;
  createdByUserId: number;
  playerIds: number[];
}

class FootballService {
  
    async profileRegister(data: FootballProfileData) {
      try {
        const response = await axios.post(`${backendUrl}/api/v1/football/profileRegister`, data);
        return response?.data ?? null;
      } catch (e) {
        console.error("Error in profileRegister:", e);
        return null;
      }
    }
    
    async profileCheck(userId: number)
    {
        try{
          const response = await axios.get(`${backendUrl}/api/v1/football/profileCheck/${userId}`)
          console.log(response);
          
          return response?.data ?? null;
        }
        catch(e)
        {
          console.error("Error in profile check:", e);
          return null;
        }
    }
    async createTeam(payload: CreateTeamPayload) {
      try {
        const response = await axios.post(`${backendUrl}/api/v1/football/createTeam`, payload);
        return response?.data ?? null;
      } catch (e) {
        console.error("Error in createTeam:", e);
        return null;
      }
    }

    async fetchAllPlayers() {
      try {
        const response = await axios.get(`${backendUrl}/api/v1/football/fetchPlayers`);
        return response?.data?.players ?? [];
      } catch (e) {
        console.error("Error in fetchAllPlayers:", e);
        return [];
      }
    }

    async fetchMyTeams(userId: number) {
      try {
        const response = await axios.get(`${backendUrl}/api/v1/football/myTeams`, {
          params: { userId }
        });
        return response?.data?.teams ?? [];
      } catch (e) {
        console.error("Error in fetchMyTeams:", e);
        return [];
      }
    }

    async fetchAllTeamsWithPlayers() {
      try {
        const response = await axios.get(`${backendUrl}/api/v1/football/allTeams`);
        console.log(response.data);
        
        return response?.data ?? [];
      } catch (e) {
        console.error("Error in fetchAllTeamsWithPlayers:", e);
        return [];
      }
    }

}

export const footballService = new FootballService();
