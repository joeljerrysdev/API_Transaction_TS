import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionsRoutes } from './routes/transactions'
export const app = fastify()
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions', // o Prefixo, determina que sempre que eu chamar esse plugins, as rotas terão o prefixo transactions. /transactios...
})
// O App fica separado do server, devido a facilidade durante os testes. COm eles separados, não preciso iniciar o servidor quando realizo os testes.
