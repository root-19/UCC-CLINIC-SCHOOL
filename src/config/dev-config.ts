// Development configuration for local testing
export const DEV_CONFIG = {
  // Always use Railway backend for all environments
  API_URL: 'https://clinic-backend-production-8835.up.railway.app',
    
  // Feature flags - enable user management for localhost development
  FEATURES: {
    USER_MANAGEMENT: import.meta.env.DEV, // Available in localhost development
    EMAIL_TESTING: true
  }
};