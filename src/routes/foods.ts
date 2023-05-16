import { z } from 'zod';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function foods(app: FastifyInstance) {
  app.post('/user', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)
    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('users').insert({
      session_id: sessionId,
      name,
    })

    return reply.status(201).send()
  })

  app.post('/', async (request, reply) => {
    const createFoodBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_healthy: z.boolean()
    })

    const { name, description, is_healthy } = createFoodBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('foods').insert({
      id: randomUUID(),
      name,
      description,
      is_healthy,
      session_id: sessionId
    })

    return reply.status(201).send()
  })

  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies
    const foods = await knex('foods').where({
      session_id: sessionId,
      is_active: true
    }).select()

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

    const food = await knex('foods').where({
      session_id: sessionId,
      id,
      is_active: true
    }).first()

    return { food }
  })

  app.get('/summary', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('foods').where({
      session_id: sessionId,
      is_active: true
    })
      .count('is_active', { as: 'totalRefeição' }).first()

    return { summary }
  })

  app.get('/summary-best-sequency', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const { sessionId } = request.cookies

    const date = new Date()
    const from = date.toISOString().split('T')[0]

    const newDate = date.setDate(date.getDate() + 1)
    const nextDay = new Date(newDate)
    const to = nextDay.toISOString().split('T')[0]

    const summary = await knex('foods')
      .whereBetween("created_at", [from.toString(), to.toString()])
      .where({
        session_id: sessionId,
        is_healthy: true,
        is_active: true,
      })
      .count('is_active', { as: 'totalRefeição' }).first()

    return { summary }
  })

  app.get('/summary-in', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('foods').where({
      session_id: sessionId,
      is_healthy: true,
      is_active: true
    }).count('is_healthy', { as: 'totalRefeição' }).first()

    return { summary }
  })

  app.get('/summary-out', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('foods').where({
      session_id: sessionId,
      is_healthy: false,
      is_active: true
    })
      .count('is_active', { as: 'totalRefeição' }).first()

    return { summary }
  })

  app.put('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getFoodParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const createFoodBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_healthy: z.boolean()
    })

    const { id } = getFoodParamsSchema.parse(request.params)
    const { name, description, is_healthy } = createFoodBodySchema.parse(request.body)
    const { sessionId } = request.cookies

    await knex('foods').update({
      name,
      description,
      is_healthy,
    }).where({
      session_id: sessionId,
      id,
      is_active: true
    })

    return reply.status(200).send()
  })

  app.delete('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getFoodParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getFoodParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    await knex('foods').update({
      is_active: false,
    }).where({
      session_id: sessionId,
      id,
      is_active: true
    })

    return reply.status(200).send()
  })
}