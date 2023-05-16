import request from 'supertest'
import { app } from '../src/app'

export async function createUserCookie() {
  const userSession = await request(app.server)
    .post('/foods/user')
    .send({
      name: 'teste',
    })
    .expect(201)

  const cookies = userSession.get('Set-Cookie')

  return {
    cookies
  }
}
