const Joi = require('joi')
const debug = require('debug')('artnetparty.endpoint.release-interface')
const IEndpoint = require('@dataparty/api/src/service/iendpoint')

module.exports = class ReleaseInterfaceEndpoint extends IEndpoint {

  static get Name(){
    return 'release-interface'
  }


  static get Description(){
    return 'Release ArtNet interface'
  }

  static get MiddlewareConfig(){
    return {
      pre: {
        decrypt: true,
        validate: Joi.object().keys(null).description('nothing')
      },
      post: {
        encrypt: true,
        validate: Joi.object().keys(null).description('any output allowed')
      }
    }
  }

  static async run(ctx, {Package}){


    debug('run')


    if(ctx.party.state.claimedBy && ctx.party.state.claimedBy == ctx.senderKey.public.sign){

      ctx.party.state.claimedBy = null

      ctx.party.state.claimedAt = null

      ctx.party.state.config = null
    }

    return {
      state: ctx.party.state
    }
  }
}