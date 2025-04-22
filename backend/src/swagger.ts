import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'

export async function swaggerSetup(app: FastifyInstance) {
  app.register(swagger, {
    swagger: {
      info: {
        title: 'Fastify API',
        description: 'API documentation with Swagger',
        version: '1.0.0',
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  })

  // Register Swagger UI (Docs UI)
  app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP:
      "default-src 'self'; connect-src 'self' http://localhost:8080; script-src 'self'; style-src 'self';",
    transformSpecificationClone: true,
  })

  app.get(
    '/ping',
    {
      schema: {
        description: 'Ping route',
        tags: ['Ping'],
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              pong: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return { pong: 'it works!' }
    }
  )
}
