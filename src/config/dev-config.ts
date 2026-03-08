// Development configuration for local testing
export const DEV_CONFIG = {
  // Always use Railway backend for all environments
  API_URL: 'https://clinic-backend-production-8835.up.railway.app',
    
  // Feature flags - enable user management for all environments
  FEATURES: {
    USER_MANAGEMENT: true, // Always enabled
    EMAIL_TESTING: true
  }
};