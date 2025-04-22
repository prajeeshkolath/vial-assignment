import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sourcedataRoutes(fastify: FastifyInstance) {
  // Schema for request validation
  const submitFormSchema = {
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
              type: {
                type: 'string',
                enum: ['text', 'textarea', 'datetime', 'dropdown'],
              }, // Enum validation
            },
            required: ['question', 'answer', 'type'],
          },
        },
      },
      required: ['responses'],
    },
  }

  // Endpoint to submit form responses
  fastify.post<{
    Params: { formId: string }
    Body: {
      responses: Array<{ question: string; answer: string; type: string }>
    }
  }>(
    '/source-record/:formId',
    { schema: submitFormSchema },
    async (request, reply) => {
      const { formId } = request.params
      const { responses } = request.body

      try {
        // Check if the form exists
        const form = await prisma.form.findUnique({
          where: { id: formId },
        })

        if (!form) {
          return reply.status(404).send({ error: 'Form not found' })
        }

        // Validate required questions
        const requiredQuestions = JSON.parse(form.questions).filter(
          (q: any) => q.required
        )
        for (const requiredQuestion of requiredQuestions) {
          if (
            !responses.some(
              r => r.question === requiredQuestion.question && r.answer
            )
          ) {
            return reply.status(400).send({
              error: `Missing answer for required question: '${requiredQuestion.question}'`,
            })
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

        return reply.status(201).send({
          message: 'Form submitted successfully',
          record: sourceRecord,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply
          .status(500)
          .send({ error: 'An error occurred while submitting the form' })
      }
    }
  )
}
