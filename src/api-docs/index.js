const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const config = require('../config');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Akwa Ibom State Health Data Collection API',
    description: 'API documentation for the Akwa Ibom State Health Data Collection and Reporting System',
    version: '1.0.0',
    contact: {
      name: 'Akwa Ibom State Health Department',
      email: 'support@akwaibomhealth.gov.ng',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.resolve(__dirname, '../api/routes/*.js'),
    path.resolve(__dirname, '../api/controllers/*.js'),
    path.resolve(__dirname, '../models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

// Load static swagger JSON if available
let staticSwagger;
try {
  staticSwagger = require('./swagger.json');
} catch (err) {
  staticSwagger = null;
}

// Use static swagger if available, otherwise use dynamically generated one
const apiDocs = staticSwagger || swaggerSpec;

// Function to setup Swagger in the Express app
const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Akwa Ibom Health Data API Docs',
  }));

  // Serve swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(apiDocs);
  });

  console.log(`Swagger docs available at ${config.env === 'production' ? 'https' : 'http'}://${config.env === 'production' ? 'your-domain.com' : 'localhost:' + config.port}/api-docs`);
};

module.exports = {
  setupSwagger,
  apiDocs,
};