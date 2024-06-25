import fastify from 'fastify'
import fastifyAutoJsonApi from '.'
// import { expectType } from 'tsd'

let app
try {
  app = fastify()
  void app.ready()
  void app.register(fastifyAutoJsonApi)
  // expectType<() => string>(app.exampleDecorator)
} catch (err) {
  console.error(err)
}
