const BASE_URL = 'http://3.108.9.140:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getDeployment(userAddress) {
    return this.request(`/deployment/${userAddress}`);
  }

  async deployContract(userAddress) {
    return this.request('/deploy/', {
      method: 'POST',
      body: JSON.stringify({ userAddress }),
    });
  }
}

export const apiService = new ApiService();
