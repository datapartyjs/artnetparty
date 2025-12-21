const Joi = require('joi')
const debug = require('debug')('artnetparty.endpoint.get-state')
const IEndpoint = require('@dataparty/api/src/service/iendpoint')

module.exports = class GetStateEndpoint extends IEndpoint {

  static get Name(){
    return 'get-state'
  }


  static get Description(){
    return 'Get service state'
  }

  static get MiddlewareConfig(){
    return {
      pre: {
        decrypt: true,
        validate: Joi.object().keys({
        }).description('no iput')
      },
      post: {
        encrypt: true,
        validate: Joi.object().keys({
          state: {
            claimedBy: Joi.string().allow(null),
            claimedAt: Joi.number().allow(null),
            config: Joi.object().keys({
              node: Joi.string().max(120).description('ArtNet node').allow(null),
              mode: Joi.string().allow('ha', 'ola', 'artnetproxy', 'api').description('mode to put system into').allow(null),
              allowedIP: Joi.array().items(
                Joi.string().max(20)
              ),
              allowedActor: Joi.array().items(
                Joi.string()
              ),
              expiry: Joi.number(),
              allowInterrupt: Joi.boolean()
            }).allow(null)
          }
        }).description('any output allowed')
      }
    }
  }

  static async run(ctx, {Package}){



    return {state: ctx.party.state}
  }
}