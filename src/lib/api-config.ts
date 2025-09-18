/**
 * API Configuration
 * 
 * This file manages the API base URL for different environments.
 * In production, this should be set to the production API URL.
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const config = {
  apiBaseUrl: API_BASE_URL,
  
  // API endpoints
  endpoints: {
    serpCompetitors: `${API_BASE_URL}/api/serp-competitors/`,
    seoAudit: `${API_BASE_URL}/api/seo-audit/`,
    competitorAnalysisPage: (slug: string) => `${API_BASE_URL}/api/competitor-analysis/${slug}/`,
    competitorAnalysisPages: `${API_BASE_URL}/api/competitor-analysis-pages/`,
  }
};

export default config;








