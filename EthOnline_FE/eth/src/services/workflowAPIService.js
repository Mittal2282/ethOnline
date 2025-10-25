// API Service for workflow execution
const API_BASE_URL = 'https://eth.devsonline.in:3000';

class WorkflowAPIService {
  async executeRules(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules_execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const workflowAPIService = new WorkflowAPIService();
