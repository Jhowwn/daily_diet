import fastify from "fastify"
import cookie from '@fastify/cookie'

import { foods } from "./routes/foods"

export const app = fastify()

app.register(cookie)

app.register(foods, {
  prefix: 'foods'
})