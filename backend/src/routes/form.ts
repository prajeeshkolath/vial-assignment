import { FastifyInstance } from 'fastify'

import { Form } from '@prisma/client'

import prisma from '../db/db_client'
import { serializer } from './middleware/pre_serializer'
import { IEntityId } from './schemas/common'
import { ApiError } from '../errors'

async function formRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formRoutes' })

  app.get<{
    Params: IEntityId
    Reply: Form
  }>('/:id', {
    async handler(req, reply) {
      const { params } = req
      const { id } = params
      log.debug('get form by id')
      try {
        const form = await prisma.form.findUniqueOrThrow({ where: { id } })
        reply.send(form)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('failed to fetch form', 400)
      }
    },
  })

  // Get all forms
  app.get<{
    Reply: Form[]
  }>('', {
    schema: {
      description: 'Fetch all forms',
      tags: ['Forms'], // Swagger tag
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async handler(req, reply) {
      log.debug('fetching all forms')
      try {
        const forms = await prisma.form.findMany()
        reply.send(forms)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('failed to fetch forms', 500)
      }
    },
  })

  // Save a new form
  app.post<{
    Body: { name: string; questions: Record<string, any> }
    Reply: Form
  }>('', {
    schema: {
      description: 'Save a new form',
      tags: ['Forms'], // Swagger tag
      body: {
        type: 'object',
        required: ['name', 'questions'], // Validation: 'name' and 'questions' are required
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          questions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['text', 'textarea', 'datetime', 'dropdown'], // Allowed values for type
                  description: 'Type of the field',
                  minLength: 1, // Ensure non-empty string
                },
                question: {
                  type: 'string',
                  minLength: 2, // Ensure non-empty string
                  description: 'The question text',
                },
                required: { type: 'boolean' },
              },
              required: ['type', 'question'],
            },
          }, // Fields must be an object
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            questions: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async handler(req, reply) {
      console.log('req.body', req.body)

      const { body } = req
      const { name, questions } = body
      log.debug('saving a new form')
      try {
        // Check if a form with the same name already exists
        const existingForm = await prisma.form.findFirst({
          where: { name },
        })

        if (existingForm) {
          log.warn(`Form with name "${name}" already exists`)
          throw new ApiError(`A form with the name ${name} already exists`, 400)
        }

        const newForm = await prisma.form.create({
          data: { name, questions },
        })
        reply.code(201).send(newForm)
      } catch (err: any) {
        if (err instanceof ApiError) {
          throw new ApiError(err.message, 409)
        } else {
          // Handle generic errors
          throw new ApiError('failed to save form', 500)
        }
      }
    },
  })

  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      // Change only the message for validation errors
      log.error({ error }, 'Validation error')
      error.message = 'Validation failed. Please check your input.'
    }

    reply.send(error)
  })
}

export default formRoutes
