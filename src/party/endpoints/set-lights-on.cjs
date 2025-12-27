const Joi = require('joi')
const debug = require('debug')('artnetparty.endpoint.set-dmx')
const IEndpoint = require('@dataparty/api/src/service/iendpoint')

const ArtNet = require('artnet')

module.exports = class SetDmxEndpoint extends IEndpoint {

  static get Name(){
    return 'set-lights-on'
  }


  static get Description(){
    return 'set lights on or off'
  }

  static get MiddlewareConfig(){
    return {
      pre: {
        decrypt: false,
        validate: Joi.object().keys({
          data: {
            state: Joi.boolean().required(),
            value: Joi.number().integer().min(0).max(255),
            fixture: Joi.string()
          }
        })
      },
      post: {
        encrypt: false,
        validate: Joi.object().keys(null).description('any output allowed')
      }
    }
  }

  static async run(ctx, {Package}){


    debug('run')
    ctx.debug('run')
    debug('ctx.input', ctx.input)
    debug('ctx.req.params', ctx.req.params)
    debug('ctx.req.query', ctx.req.query)
    debug('ctx.req.params.state', ctx.req.params.state)


    var ip = ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress 

    debug('remote ip -', ip)

  let artnet = ArtNet({
    host: '10.20.254.110'
  })

  ctx.party.artnetTask.settings.ignoreClient = true

  const value = ctx.input.data.state == true ? (ctx.input.data.value) : 0
  artnet.set(0, 1, Array(512).fill( value ))
  artnet.set(1, 1, Array(512).fill( value ))
//  artnet.set(2, 1, Array(512).fill( value ))
  artnet.set(3, 1, Array(512).fill( value ))
  artnet.set(4, 1, Array(512).fill( value ))

  let artnetWait = new Promise((resolve,reject)=>{

    setTimeout(resolve, 2000)

  })

    await artnetWait


    ctx.party.artnetTask.settings.ignoreClient = false

    artnet.close()



    return {"lights": "ok"}
  }
}
