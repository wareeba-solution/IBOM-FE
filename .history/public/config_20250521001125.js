// public/config.js

/**
 * Runtime environment configuration
 * This allows changing API endpoints without rebuilding the application
 */
window.ENV = {
    // PRODUCTION CONFIGURATION
    // Uncomment this line when deploying to production:
    API_URL: "https://ibom-healthcare.onrender.com",
    
    // DEVELOPMENT CONFIGURATION
    // Uncomment this line for local development:
    // API_URL: "http://localhost:5000",
    
    // Application version
    VERSION: "1.0.0",
    
    // Enable/disable debug features
    DEBUG: false
  };
  
  // Log the configuration that will be used
  console.log('Runtime configuration loaded:', window.ENV);