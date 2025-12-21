import {homedir} from 'os'
import * as Path from 'path'
import * as Debug from 'debug'
const debug = Debug.default('ArtNetParty.host')
import * as DatapartyLib from '@dataparty/api/src/index.js'

import * as fs from 'fs'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

import ArtNetPartyServiceSchema from './dataparty/artnet-party.dataparty-schema.json' with { type: 'json'}
import ArtNetPartySrv from './dataparty/artnet-party.dataparty-service.json' with { type: 'json'}


import * as ArtNet from 'artnet'

const Dataparty=DatapartyLib.default

async function main(){

  const path = Path.join(homedir(), '.artnet-party')

  debug('party location', path)

  let party = new Dataparty.TingoParty({
    path: path+'/db',
    model: ArtNetPartyServiceSchema,
    config: new Dataparty.Config.JsonFileConfig({
      basePath: path+'/config',

    }),
    noCache: false
  })

  const service = new Dataparty.IService(ArtNetPartyServiceSchema.package, ArtNetPartySrv)

  party.topics = new Dataparty.LocalTopicHost()

  debug('partying')

  const runner = new Dataparty.ServiceRunnerNode({
    party, service,
    sendFullErrors: true,
    useNative: false
  })


  const ssl_key  = fs.readFileSync( Path.join(__dirname,'key.pem'), 'utf8')
  const ssl_cert = fs.readFileSync( Path.join(__dirname,'cert.pem'), 'utf8')
  
  const host = new Dataparty.ServiceHost({
    runner,
    trust_proxy: false,
    ssl_key, ssl_cert,
    staticPath: './public',
    staticPrefix: '/',
    listenUri: 'https://0.0.0.0:3000'
  })

  await party.start()
  await runner.start()
  await host.start()

  party.state = {
    claimedBy: null,
    claimedAt: null,
    config: null
  }

  let artnetTask = await runner.spawnTask('artnetproxy', {
    port: 6454,
    address: '10.20.110.125',
    allowedIP: '10.88.200.1'
  })


  let artnet = ArtNet.default({
    host: '10.20.110.125'
  })

  artnetTask.settings.ignoreClient = true

  const value = 0
  artnet.set(0, 1, Array(512).fill( value ))
  artnet.set(1, 1, Array(512).fill( value ))
  artnet.set(2, 1, Array(512).fill( value ))
  artnet.set(3, 1, Array(512).fill( value ))

  artnetTask.settings.ignoreClient = false

  artnet.close()



  console.log(artnetTask)

  console.log('started')
  
  //process.exit()
}



main().catch(err=>{
  console.error(err)
})
