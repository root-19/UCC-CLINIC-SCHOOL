// Development configuration for local testing
export const DEV_CONFIG = {
  // Use local server for development, production for other features
  API_URL: import.meta.env.DEV 
    ? 'http://localhost:3000' 
    : 'https://clinic-backend-production-8835.up.railway.app',
    
  // Feature flags - enable user management for localhost development
  FEATURES: {
    USER_MANAGEMENT: import.meta.env.DEV, // Available in localhost development
    EMAIL_TESTING: true
  }
};