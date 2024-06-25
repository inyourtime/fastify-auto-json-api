'use strict'

const t = require('tap')

t.test('should register the correct route', async (t) => {
  t.plan(10)

  const app = require('fastify')()

  app.register(require('..'), {
    fileDirectory: 'test/fixtures'
  })

  await app.ready()

  const responses = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      app.inject({
        method: 'GET',
        url: `/fixtures/data${i + 1}`
      })
    )
  )

  responses.forEach((response, i) => {
    t.equal(response.statusCode, 200)
    t.matchOnlyStrict(
      JSON.parse(response.payload),
      require(`./fixtures/data${i + 1}.json`)
    )
  })
})

t.test('should throw an error if file directory does not exist', async (t) => {
  t.plan(1)

  const app = require('fastify')()

  app.register(require('..'), {
    fileDirectory: 'test/fixtures/does-not-exist'
  })

  try {
    await app.ready()
    t.fail('should not resolve')
  } catch (e) {
    t.pass(e.message)
  }
})

t.test('should register the correct route with prefix', async (t) => {
  t.plan(10)

  const app = require('fastify')()

  app.register(require('..'), {
    fileDirectory: 'test/fixtures',
    prefix: 'api'
  })

  await app.ready()

  const responses = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      app.inject({
        method: 'GET',
        url: `/api/fixtures/data${i + 1}`
      })
    )
  )

  responses.forEach((response, i) => {
    t.equal(response.statusCode, 200)
    t.matchOnlyStrict(
      JSON.parse(response.payload),
      require(`./fixtures/data${i + 1}.json`)
    )
  })
})

t.test('should work with default file directory', async (t) => {
  // create new default file directory (data/...)
  const fs = require('fs')

  await fs.promises.mkdir('data', { recursive: true })
  await fs.promises.writeFile(
    'data/data1.json',
    JSON.stringify({ foo: 'bar' })
  )

  t.teardown(async () => {
    await fs.promises.rm('data', { recursive: true, force: true })
  })

  const app = require('fastify')()

  app.register(require('..'))

  try {
    await app.ready()
    const response = await app.inject({
      method: 'GET',
      url: '/data/data1'
    })

    t.equal(response.statusCode, 200)
    t.matchOnlyStrict(JSON.parse(response.payload), { foo: 'bar' })
  } catch (e) {
    t.fail(e.message)
  }
})

t.test(
  'should register the correct route with prefix and default file directory',
  async (t) => {
    // create new default file directory (data/...)
    const fs = require('fs')

    await fs.promises.mkdir('data', { recursive: true })
    await fs.promises.writeFile(
      'data/data1.json',
      JSON.stringify({ foo: 'bar' })
    )

    t.teardown(async () => {
      await fs.promises.rm('data', { recursive: true, force: true })
    })

    const app = require('fastify')()

    app.register(require('..'), { prefix: 'api' })

    try {
      await app.ready()
      const response = await app.inject({
        method: 'GET',
        url: '/api/data/data1'
      })

      t.equal(response.statusCode, 200)
      t.matchOnlyStrict(JSON.parse(response.payload), { foo: 'bar' })
    } catch (e) {
      t.fail(e.message)
    }
  }
)

t.test('should register the correct route with config', async (t) => {
  t.plan(2)

  const app = require('fastify')()

  app.register(require('..'), {
    fileDirectory: 'test/fixtures',
    config: {
      foo: 'bar'
    }
  })

  app.addHook('onRequest', async (req, reply) => {
    return reply.send(req.routeOptions.config.foo)
  })

  await app.ready()

  const response = await app.inject({
    method: 'GET',
    url: '/fixtures/data1'
  })

  t.equal(response.statusCode, 200)
  t.equal(response.payload, 'bar')
})

t.test('should error when json file is invalid', async (t) => {
  t.plan(1)

  const fs = require('fs')

  await fs.promises.mkdir('data', { recursive: true })
  await fs.promises.writeFile(
    'data/invalid.json',
    "{ foo: 'bar', baz: 123, 'qux': true, missingQuotes: true, }"
  )

  t.teardown(
    async () => await fs.promises.rm('data', { recursive: true, force: true })
  )

  const app = require('fastify')()

  app.register(require('..'))

  try {
    await app.ready()
    t.fail('should not resolve')
  } catch (e) {
    t.pass(e.message)
  }
})

t.test('should ignore non json files', async (t) => {
  t.plan(1)

  const fs = require('fs')

  await fs.promises.mkdir('data', { recursive: true })
  await fs.promises.writeFile('data/invalid.txt', 'foo')

  t.teardown(
    async () => await fs.promises.rm('data', { recursive: true, force: true })
  )

  const app = require('fastify')()

  app.register(require('..'))

  const response = await app.inject({
    method: 'GET',
    url: '/data/invalid'
  })

  t.equal(response.statusCode, 404)
})
