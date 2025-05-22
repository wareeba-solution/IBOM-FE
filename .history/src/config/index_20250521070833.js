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

  // Development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production
  return 'https://ibom-healthcare.onrender.com';
};

const config = {
  apiUrl: getApiUrl(),
  appName: 'Akwa Ibom Health System',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',
};

// Log the configuration in non-production environments
if (process.env.NODE_ENV !== 'production') {
  console.log('App Configuration:', config);
  console.log('API URL:', config.apiUrl);
}

export default config;