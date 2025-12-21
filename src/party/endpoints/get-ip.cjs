const Joi = require('joi')
const debug = require('debug')('artnetparty.endpoint.get-ip')
const IEndpoint = require('@dataparty/api/src/service/iendpoint')

module.exports = class GetIpEndpoint extends IEndpoint {

  static get Name(){
    return 'get-ip'
  }


  static get Description(){
    return 'get ip address'
  }

  static get MiddlewareConfig(){
    return {
      pre: {
        decrypt: true,
        validate: Joi.object().keys({
        }).description('blanks')
      },
      post: {
        encrypt: true,
        validate: Joi.object().keys(null).description('any output allowed')
      }
    }
  }

  static async run(ctx, {Package}){


    var ip = ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress 

    debug('remote ip -', ip)

    return { ip }
  }
}