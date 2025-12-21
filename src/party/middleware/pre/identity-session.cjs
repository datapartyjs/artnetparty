const Joi = require('joi')
const Hoek = require('@hapi/hoek')
const {Identity} = require('@dataparty/crypto')
const debug = require('debug')('dataparty.middleware.pre.identity-session')

const IMiddleware = require('@dataparty/api/src/service/imiddleware')

module.exports = class IdentitySession extends IMiddleware {

  static get Name(){
    return 'identity_session'
  }

  static get Type(){
    return 'pre'
  }

  static get Description(){
    return 'Identity session'
  }

  static get ConfigSchema(){
    return Joi.boolean()
  }

  static async start(party){
    
  }

  static async run(ctx, {Config}){

    if (!Config){ return }

    if(!ctx.input_session_id){
      throw new Error('no session id')
    }

    ctx.debug('user hash -', ctx.input_session_id)
  
    /*
    let sessionKeyDoc = (await ctx.party.find()
      .type('session_key')
      .where('annoucement.sessionKey.hash')
      .equals(ctx.input_session_id)
      .exec()
    )[0]

    if(!sessionKeyDoc){
      throw new Error('invalid session')
    }

    ctx.debug('located session - ', ctx.input_session_id)

    const sessionKey = sessionKeyDoc.data.annoucement.sessionKey
    const actorKey = sessionKeyDoc.data.annoucement.actorKey

    // ensure sender is connected using session key mentioned in db
    if(sessionKey.hash == ctx.input_session_id &&
       sessionKey.public.sign == ctx.senderKey.public.sign &&
       sessionKey.public.box == ctx.senderKey.public.box
    ){

      const now = Date.now()

      if( sessionKeyDoc.data.expiry < now ){
        throw new Error('session expired!')
      }

      const actorIdentity = Identity.fromJSON({
        id: 'actor',
        key: actorKey
      })
      
      const sessionIdentity = Identity.fromJSON({
        id: 'ephemeral-session',
        key: sessionKey
      })

      ctx.debug('looking up actor - ', actorKey.hash)

      let actorDoc = (await ctx.party.find()
        .type('public_key')
        .where('hash')
        .equals(actorKey.hash)
        .exec()
      )[0]

      if(!actorDoc){
        throw new Error('failed to find actor')
      }

      ctx.setSession( sessionKeyDoc )
      ctx.setIdentity( actorIdentity )
      ctx.setActor( actorDoc )

      ctx.debug('session ready')
    } else {
      throw new Error('invalid sender key for this session')
    }
      */

  }
}