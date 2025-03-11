import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExistes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Aqui temos um interceptador, onde será realizado uma verificação antes da execução do handler
  const sessionId = request.cookies.sessionId
  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthozied.',
    })
  }
}
