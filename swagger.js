const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.1.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API Documentation',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server',
        },
    ],
};

const options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./swaggerDocs.js'],
};

const swaggerSpec = swaggerJSDoc(options);
exports.swaggerSpec = swaggerSpec;
