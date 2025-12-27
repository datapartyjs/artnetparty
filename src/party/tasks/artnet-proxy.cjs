const debug = require('debug')('artnetparty.task.artnetproxy')

const ITask = require('@dataparty/api/src/service/itask')

const dgram = require('dgram')

const { Buffer } = require('node:buffer');

function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

class ArtNetProxyTask extends ITask {

  /**
   * 
   * @param number options.port
   * @param string options.address
   * @param string options.allowedIP
   */
  constructor(options){
    super({
      name: ArtNetProxyTask.Name,
      background: ArtNetProxyTask.Config.background,
      ...options
    })

    debug('new')

    this.client = null
    this.server = null
    this.ignoreClient = false

    this.settings = {
      port: options.context.port,
      address: options.context.address,
      allowedIP: options.context.allowedIP
    }

    this.stats = {
      rx: {
        frames: 0,
        bytes: 0
      },
      tx: {
        frames: 0,
        bytes: 0
      }
    }
  }

  static get Config(){
    return {
      background: true,
      autostart: false
    }
  }
 
  async exec(){

    this.server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    })

    this.server.on('error', this.onServerError.bind(this))
    this.server.on('listening', this.onServerListening.bind(this))
    this.server.on('message', this.onServerMessage.bind(this))

    this.server.bind(this.settings.port)

    this.client = dgram.createSocket('udp4')


    console.log('ctx args',this.context.args)

    return this.detach()
  }

  stop(){
    if(this.server != null){
      this.server.close()
    }
  }

  onServerError(err){
    console.log('socket error')
    debug(err)
  }

  

  onServerMessage(msg, rinfo){
    //debug('msg: ', msg.length, ' btyes \t', 'from: ', rinfo.address)

    if(this.context.party.state.config != null){
      if(this.context.party.state.config.allowedIP.indexOf(rinfo.address) != -1){
      
        debug('send - ', msg.length, ' btyes \t', 'from: ', rinfo.address)
        this.client.send(msg, this.settings.port, this.settings.address)

        let headerMagic = Buffer.from([65, 114, 116, 45, 78, 101, 116, 0, 0, 80, 0, 14])

        const header = msg.slice(0, 12)

        if( arraysIdentical(header, headerMagic) ){
          const [fill1, fill2, lUni, hUni, hLen, lLen, ...data] = msg.slice(12)

          const length = (hLen << 8) | lLen
          const universe = (hUni << 8) | lUni

          console.log( 'dmx-512', universe, length)
          if(this.context.party.framebuffers[universe]){
            this.context.party.framebuffers[universe].set( data )
          }

        }



      }
    }
    else {
      debug('drop', rinfo.address)
    }

    /*
    else if(rinfo.address == this.settings.allowedIP && !this.ignoreClient){
      //debug('\tsend')
      this.client.send(msg, this.settings.port, this.settings.address)
    }*/

  }

  onServerListening(){
    const address = this.server.address()
    debug(`server listening ${address.address}:${address.port}`)
  }

  static get Name(){
    return 'artnetproxy'
  }

  static get Description(){
    return 'ArtNet UDP Proxy'
  }
}


module.exports = ArtNetProxyTask