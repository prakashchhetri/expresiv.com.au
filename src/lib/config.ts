// Production API Configuration
export const API_CONFIG = {
  // Production API Base URL
  BASE_URL: 'https://serp-analysis.expresiv.com.au',
  
  // API Endpoints
  ENDPOINTS: {
    SERP_COMPETITORS: '/api/serp-competitors/',
    SEO_AUDIT: '/api/seo-audit/',
    API_SCHEMA: '/api/schema/'
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: keyof typeof API_CONFIG.ENDPOINTS): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
}

// Development vs Production detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;









