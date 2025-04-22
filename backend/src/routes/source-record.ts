import { FastifyInstance } from 'fastify'

import { SourceRecord } from '@prisma/client'

import prisma from '../db/db_client'
import { serializer } from './middleware/pre_serializer'
import { ApiError } from '../errors'

async function sourceRecordRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formRoutes' })

  // Save a new source record
  app.post<{
    Params: { formId: string }
    Body: {
      responses: Array<{ question: string; answer: string; type: string }>
    }
    Reply: SourceRecord
  }>('/:formId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          formId: { type: 'string' },
        },
        required: ['formId'],
      },
      body: {
        type: 'object',
        properties: {
          responses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                answer: { type: 'string' },
              },
              required: ['question', 'answer'],
            },
          },
        },
        required: ['responses'],
      },
    },

    async handler(req, reply) {
      console.log('Saving source record...')
      const { formId } = req.params
      const { responses } = req.body

      try {
        // Check if the form exists
        const form = await prisma.form.findUnique({
          where: { id: formId },
        })

        if (!form) {
          throw new ApiError('Form not found', 404)
        }

        // Validate required questions
        const requiredQuestions: Array<{
          question: string
          required: boolean
        }> = Array.isArray(form.questions)
          ? (
              form.questions as Array<{ question: string; required: boolean }>
            ).filter(q => q && q.required)
          : []

        for (const requiredQuestion of requiredQuestions) {
          if (
            !responses.some(
              r => r.question === requiredQuestion.question && r.answer
            )
          ) {
            throw new ApiError(
              `Missing answer for required question: '${requiredQuestion.question}'`,
              400
            )
          }
        }

        // Save the SourceRecord and associated SourceData
        const sourceRecord = await prisma.sourceRecord.create({
          data: {
            formId,
            sourceData: {
              create: responses.map(response => ({
                question: response.question,
                answer: response.answer,
              })),
            },
          },
          include: {
            sourceData: true, // Include the associated SourceData in the response
          },
        })

        reply.code(201).send(sourceRecord)
      } catch (error) {
        if (error instanceof ApiError) {
          // Rethrow ApiError
          throw error
        } else {
          // Log unexpected errors and throw a generic 500 error
          log.error({ error }, 'Unexpected error while saving source record')
          throw new ApiError('Failed to save record', 500)
        }
      }
    },
  })
}

export default sourceRecordRoutes
