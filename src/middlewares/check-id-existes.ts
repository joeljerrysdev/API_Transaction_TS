import { FastifyReply, FastifyRequest } from 'fastify'

import { string, z } from 'zod'
import { knex } from '../database'

export async function checkIdExistes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getTransactionParamsSchema = z.object({
    id: string().uuid(),
  })
  const { id } = getTransactionParamsSchema.parse(request.params)
  const transaction = await knex('transactions').where('id', id).first()
  if (transaction === undefined) {
    return reply.status(404).send({
      error: 'transactions Not Found.',
    })
  }
}
