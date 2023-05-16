import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
import { createUserCookie } from './create-and-authenticate-user'


describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('Should be able create a new user', async () => {
    await request(app.server)
      .post('/foods/user')
      .send({
        name: 'teste',
      })
      .expect(201)
  })

  it('Should be able create a new food', async () => {
    const { cookies } = await createUserCookie()

    await request(app.server)
      .post('/foods')
      .send({
        name: 'teste',
        description: 'test',
        is_healthy: true,
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('Should be able list all foods by the user', async () => {
    const { cookies } = await createUserCookie()

    const createFoodResponse = await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: false,
      })
      .set('Cookie', cookies)

    const listOfFoodsResponse = await request(app.server)
      .get('/foods')
      .set('Cookie', cookies)
      .expect(200)

    expect(listOfFoodsResponse.body.foods).toEqual([
      expect.objectContaining({
        name: 'test',
        description: 'test',
        is_healthy: 0,//0 = False and 1 = True
      })
    ])
  })

  it('Should be able find a especific foods', async () => {
    const { cookies } = await createUserCookie()

    const createFoodResponse = await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: false,
      })
      .set('Cookie', cookies)

    const listOfFoodsResponse = await request(app.server)
      .get('/foods')
      .set('Cookie', cookies)
      .expect(200)

    const foodId = listOfFoodsResponse.body.foods[0].id

    const getFoodResponse = await request(app.server)
      .get(`/foods/${foodId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getFoodResponse.body.food).toEqual(
      expect.objectContaining({
        name: 'test',
        description: 'test',
        is_healthy: 0,//0 = False and 1 = True
      })
    )
  })

  it('Should be able count of meals in diet with a especific user', async () => {
    const { cookies } = await createUserCookie()

    await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: true,
      })
      .set('Cookie', cookies)

    await request(app.server)
      .post('/foods')
      .set('Cookie', cookies)
      .send({
        name: 'test 2',
        description: 'test 2',
        is_healthy: true,
      })

    const summaryResponse = await request(app.server)
      .get('/foods/summary-in')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ totalRefeição: 2 })
  })

  it('Should be able count of meals out of the diet with a especific user', async () => {
    const { cookies } = await createUserCookie()
    await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: false,
      })
      .set('Cookie', cookies)

    await request(app.server)
      .post('/foods')
      .set('Cookie', cookies)
      .send({
        name: 'test 2',
        description: 'test 2',
        is_healthy: false,
      })

    const summaryResponse = await request(app.server)
      .get('/foods/summary-out')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ totalRefeição: 2 })
  })

  it('Should be able count all meals of especific user', async () => {
    const { cookies } = await createUserCookie()
    await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: true,
      })
      .set('Cookie', cookies)

    await request(app.server)
      .post('/foods')
      .set('Cookie', cookies)
      .send({
        name: 'test 2',
        description: 'test 2',
        is_healthy: false,
      })

    const summaryResponse = await request(app.server)
      .get('/foods/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ totalRefeição: 2 })
  })

  it('Should be able count all meals of especific user', async () => {
    const { cookies } = await createUserCookie()
    await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: true,
      })
      .set('Cookie', cookies)

    await request(app.server)
      .post('/foods')
      .set('Cookie', cookies)
      .send({
        name: 'test 2',
        description: 'test 2',
        is_healthy: true,
      })

    const summaryResponse = await request(app.server)
      .get('/foods/summary-best-sequency')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ totalRefeição: 2 })
  })

  it('Should be able update a food', async () => {
    const { cookies } = await createUserCookie()
    await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: false,
      })
      .set('Cookie', cookies)

    const listOfFoodsResponse = await request(app.server)
      .get('/foods')
      .set('Cookie', cookies)
      .expect(200)

    const foodId = listOfFoodsResponse.body.foods[0].id

    await request(app.server)
      .put(`/foods/${foodId}`)
      .send({
        name: 'test 01',
        description: 'test 01',
        is_healthy: true,
      })
      .set('Cookie', cookies)

    const getFoodResponse = await request(app.server)
      .get(`/foods/${foodId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getFoodResponse.body.food).toEqual(
      expect.objectContaining({
        name: 'test 01',
        description: 'test 01',
        is_healthy: 1,//0 = False and 1 = True
      })
    )
  })

  it('Should be able delete a food', async () => {
    const { cookies } = await createUserCookie()
    const createFoodResponse = await request(app.server)
      .post('/foods')
      .send({
        name: 'test',
        description: 'test',
        is_healthy: false,
      })
      .set('Cookie', cookies)

    const listOfFoodsResponse = await request(app.server)
      .get('/foods')
      .set('Cookie', cookies)
      .expect(200)

    const foodId = listOfFoodsResponse.body.foods[0].id

    await request(app.server)
      .delete(`/foods/${foodId}`)
      .set('Cookie', cookies)

    await request(app.server)
      .get(`/foods/${foodId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

})