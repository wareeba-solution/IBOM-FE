// src/config/index.js
const getApiUrl = () => {
    // Check for runtime config first (from public/config.js)
    if (window.ENV && window.ENV.API_URL) {
      return window.ENV.API_URL;
    }
  
    // Then check for environment variables
    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
  
    // Then check for current hostname to detect environment
    const hostname = window.location.hostname;
    
    // Development (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // Production - automatically use the matching backend
    // This assumes your frontend and backend use the same domain pattern
    if (hostname.includes('ibom-healthcare')) {
      return 'https://ibom-healthcare.onrender.com';
    }
    
    // Fallback for any other domains
    return 'https://ibom-healthcare.onrender.com';
  };
  
  const config = {
    // API base URL that automatically adjusts to the environment
    apiUrl: getApiUrl(),
    
    // Other configuration settings
    appName: 'Akwa Ibom Health System',
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    
    // Feature flags
    features: {
      enableNotifications: true,
      enableOfflineMode: true,
    },
    
    // Authentication settings
    auth: {
      tokenKey: 'auth_token',
      userKey: 'user_data',
      expiryKey: 'token_expiry',
    }
  };
  
  // Log the configuration when the app starts (helpful for debugging)
  if (process.env.NODE_ENV !== 'production') {
    console.log('App Configuration:', config);
    console.log('API URL:', config.apiUrl);
  }
  
  export default config;