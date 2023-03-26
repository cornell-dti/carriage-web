import swaggerAutogen from 'swagger-autogen';

const doc = {
  openapi: '3.0.0',
  info: {
    swagger: '2.0',
    title: 'Ride Sharing API',
    version: '1.0.0',
    description: 'API for managing ride sharing service',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const outputFile = '../api-docs.json';
const endpointsFiles = ['./index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
