const API_BASE = '/api';

export class ApiClient {
  static async getRandomPhrase(category = null) {
    const url = category 
      ? `${API_BASE}/phrases/random?category=${encodeURIComponent(category)}`
      : `${API_BASE}/phrases/random`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async recordGuessResult(phraseId, wasCorrect) {
    const response = await fetch(`${API_BASE}/phrases/guess-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phraseId,
        wasCorrect
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async resetSession() {
    const response = await fetch(`${API_BASE}/session/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}