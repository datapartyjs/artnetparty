const Joi = require('joi')
const debug = require('debug')('artnetparty.endpoint.claim-interface')
const IEndpoint = require('@dataparty/api/src/service/iendpoint')

module.exports = class ClaimInterfaceEndpoint extends IEndpoint {

  static get Name(){
    return 'claim-interface'
  }


  static get Description(){
    return 'Claim ArtNet interface'
  }

  static get MiddlewareConfig(){
    return {
      pre: {
        decrypt: true,
        validate: Joi.object().keys({
          node: Joi.string().max(120).description('ArtNet node').default('dma-artnet01'),
          mode: Joi.string().allow('ha', 'ola', 'artnetproxy', 'api').required().description('mode to put system into'),
          allowedIP: Joi.array().items(
            Joi.string().max(20)
          ),
          allowedActor: Joi.array().items(
            Joi.string()
          ),
          expiry: Joi.number(),
          allowInterrupt: Joi.boolean().default(true)
        }).description('secure invitation')
      },
      post: {
        encrypt: true,
        validate: Joi.object().keys(null).description('any output allowed')
      }
    }
  }

  static async run(ctx, {Package}){


    debug('run')
    ctx.debug('run')
    debug('ctx.input', ctx.input)

    var ip = ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress 

    debug('remote ip -', ip)

    if(!ctx.party.state.claimedBy){

      ctx.party.state.claimedBy = ctx.senderKey.public.sign

      ctx.party.state.claimedAt = Date.now()

      ctx.party.state.config = {
        node: ctx.input.node,
        mode: ctx.input.mode,
        allowedIP: ctx.input.allowedIP,
        allowedActor: ctx.input.allowedActor,
        allowInterrupt: ctx.input.allowInterrupt,
        expiry: ctx.input.expiry
      }

    }

    return {state: ctx.party.state}
  }
}