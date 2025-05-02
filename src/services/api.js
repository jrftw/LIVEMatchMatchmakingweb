import { auth } from '../firebase/config';

const API_BASE_URL = 'https://api-phf7svacba-uc.a.run.app';

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export const apiService = {
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  async getMatches() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/getMatches`, {
      headers,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }
    return response.json();
  },

  async updateMatch(userId, availability) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/updateMatch`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ userId, availability }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update match: ${response.statusText}`);
    }
    return response.json();
  },

  async getTournaments() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/getTournaments`, {
      headers,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
    }
    return response.json();
  },

  async createTournament(data) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/createTournament`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create tournament: ${response.statusText}`);
    }
    return response.json();
  },

  async joinTournament(tournamentId, userId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/joinTournament`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ tournamentId, userId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to join tournament: ${response.statusText}`);
    }
    return response.json();
  },
}; 