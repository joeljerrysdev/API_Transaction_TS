import { FastifyInstance } from 'fastify'
import { string, z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExistes } from '../middlewares/check-session-id-existes'
import { checkIdExistes } from '../middlewares/check-id-existes'

// Plugin utilizado para separação das rotas
export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExistes],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      return {
        transactions,
      }
    },
  )
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExistes, checkIdExistes],
    },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const transactions = await knex('transactions')
        .where('id', id)
        .where('session_id', sessionId)
        .first()
      if (transactions === undefined) {
        return reply.status(401).send({
          error: 'Unauthozied.',
        })
      } else {
        return { transactions }
      }
    },
  )
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExistes],
    },
    async () => {
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )
  app.post('/', async (request, reply) => {
    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      console.log('Cookie')
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
  app.delete(
    '/:id',
    {
      preHandler: [checkIdExistes],
    },
    async (request, reply) => {
      const deleteTransactionBodySchema = z.object({
        id: string().uuid(),
      })
      const { id } = deleteTransactionBodySchema.parse(request.params)
      await knex('transactions').where('id', id).del()
      console.log('linha deletada com sucesso')
      return reply.send('Transaction delete')
    },
  )
}
