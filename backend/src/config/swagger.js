export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rural Healthcare Management System API',
      version: '1.0.0',
      description: 'API documentation for RHMS backend services',
      contact: {
        name: 'RHMS Team',
        email: 'support@rhms.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};
