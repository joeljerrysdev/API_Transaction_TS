import { app } from './app'
import { env } from './env'

// Chama o plugin das rotas.
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
