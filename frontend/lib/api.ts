// API client utility for CurioSnap
const API_BASE_URL = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('curiosnap_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication endpoints
  async login(email: string, username?: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, username }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Discovery endpoints
  async analyzeImage(imageData: string) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageData }),
    });
  }

  async saveDiscovery(imageData: string, fact: string, category: string) {
    return this.request('/save', {
      method: 'POST',
      body: JSON.stringify({ imageData, fact, category }),
    });
  }

  async getDiscoveries(limit = 20, offset = 0) {
    return this.request(`/discoveries?limit=${limit}&offset=${offset}`);
  }
}

export const apiClient = new ApiClient();
