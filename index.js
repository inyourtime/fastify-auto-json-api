'use strict'

const fp = require('fastify-plugin')
const path = require('path')
const fs = require('fs')

/** @type {import('fastify').FastifyPluginCallback} */
const fastifyAutoJsonApi = async function autoJsonApi (fastify, opts) {
  const { fileDirectory, prefix, config } = opts

  const fd = fileDirectory || 'data'

  const jsonFolder = path.resolve(__dirname, fd.replace(/\\/g, '/'))
  const folderName = path.basename(jsonFolder)

  const apiPrefix = prefix ? `/${prefix}/${folderName}` : `/${folderName}`

  if (!fs.existsSync(jsonFolder)) {
    throw new Error(`File directory ${jsonFolder} does not exist`)
  }

  for (const file of fs.readdirSync(jsonFolder)) {
    if (path.extname(file) !== '.json') return
    const fileName = path.basename(file, path.extname(file))
    const jsonFile = path.join(jsonFolder, file)
    try {
      const jsonData = require(jsonFile)
      fastify.route({
        method: 'GET',
        url: `${apiPrefix}/${fileName}`,
        config: { ...config },
        handler: async () => jsonData
      })
    } catch (error) {
      throw new Error(`Failed to parse ${jsonFile}: ${error.message}`)
    }
  }
}

module.exports = fp(fastifyAutoJsonApi, { fastify: '^4.x' })
module.exports.default = fastifyAutoJsonApi
module.exports.fastifyAutoJsonApi = fastifyAutoJsonApi
