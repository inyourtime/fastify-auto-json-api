import { FastifyContextConfig, FastifyPluginCallback } from 'fastify'

type FastifyAutoJsonApiPlugin =
  FastifyPluginCallback<fastifyAutoJsonApi.FastifyAutoJsonApiOptions>

declare namespace fastifyAutoJsonApi {
  export interface FastifyAutoJsonApiOptions {
    fileDirectory?: string
    prefix?: string
    config?: FastifyContextConfig
  }

  export const fastifyAutoJsonApi: FastifyAutoJsonApiPlugin

  export { fastifyAutoJsonApi as default }
}

declare function fastifyAutoJsonApi (
  ...params: Parameters<FastifyAutoJsonApiPlugin>
): ReturnType<FastifyAutoJsonApiPlugin>

export = fastifyAutoJsonApi
