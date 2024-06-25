import fastify from 'fastify'
import { fastifyAutoJsonApi } from '.'

const app = fastify()

void app.register(fastifyAutoJsonApi)
