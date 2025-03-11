import { expect, it, beforeAll, describe, beforeEach, afterAll } from 'vitest'
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  
  beforeEach(() => {
    execSync('npx knex migrate:rollback --all') // apaga o banco
    execSync('npx knex -- migrate:latest') // cria novamente
  })

  // test e2e
  it(' should be able to create a new transactions', async () => {
    // Todo teste  tem 2 partes.
    // 1° Ação que será executada
    // 2° a validação do resultado esperado
    const response = await request(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit',
      
    })
    expect(response.statusCode).toEqual(201)    
  })
  // Jamais eu posso escrever um teste que depende de outro teste. Se um depende do outro, então são os mesmos testes e não precisa de outro.
  it(' should be able to list all transactions', async () => {
    const createTransactionsResponse = await request(app.server).post('/transactions').send({
      title: 'New transactions',
      amount: 5000,
      type: 'credit',
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transactions',
        amount: 5000,
      }),
    ])
    
  })
  it(' should be able to get specific transaction', async () => {
    const createTransactionsResponse = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)
    
    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
    
  })
  it(' should be able to get the summary', async () => {
    const createTransactionsResponse = await request(app.server).post('/transactions').send({
      title: 'credit transaction',
      amount: 5000,
      type: 'credit',
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
      title: 'debit transaction',
      amount: 2000,
      type: 'debit',
    })
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
    
  })
})
