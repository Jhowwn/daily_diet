import { z } from 'zod';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from "../middlewares/check-user-id-exists";

export async function users(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      password: z.string(),
    })

    const { name, password } = createUserBodySchema.parse(request.body)

    await knex('user').insert({
      id: randomUUID(),
      name,
      password,
    })

    return reply.status(201).send()
  })

  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies
    const foods = await knex('foods').where('session_id', sessionId).select()

    return { foods }
  })

  app.get('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const getFoodParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = getFoodParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    const foods = await knex('foods').where({
      sessionId: sessionId,
      id
    }).first()

    return { foods }
  })
}

// export async function transactionRoutes(app: FastifyInstance) {
//   app.get('/summary', {
//     preHandler: [checkSessionIdExists]
//   }, async (request) => {
//     const { sessionId } = request.cookies
//     const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: 'amount' }).first()

//     return { summary }
//   })

//   app.post('/', async (request, reply) => {
//     const createTransactionBodySchema = z.object({
//       title: z.string(),
//       amount: z.number(),
//       type: z.enum(['credit', 'debit'])
//     })

//     const { title, amount, type } = createTransactionBodySchema.parse(request.body)

//     let sessionId = request.cookies.sessionId

//     if (!sessionId) {
//       sessionId = randomUUID()

//       reply.cookie('sessionId', sessionId, {
//         path: '/',
//         maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
//       })
//     }

//     await knex('transactions').insert({
//       id: randomUUID(),
//       title,
//       amount: type === 'credit' ? amount : amount * -1,
//       session_id: sessionId
//     })

//     return reply.status(201).send()
//   })
// }