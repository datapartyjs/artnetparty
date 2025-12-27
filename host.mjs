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
import DmxField from './src/dmx/field.cjs'
import DmxDevice from './src/dmx/device.cjs'
import DmxDeviceTemplate from './src/dmx/device-template.cjs'

const BlinderSmallTemplate = new DmxDeviceTemplate({
  fields: [
    { name: 'fun', offset: 0, bytes: 1, defaultVal: 255},
    { name: 'color', offset: 1, length: 1, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'color-col1', offset: 4, length: 1, bytes: 3, format: 'rgb'},
    { name: 'color-col2', offset: 7, length: 1, bytes: 3, format: 'rgb'},
    { name: 'color-col3', offset: 10, length: 1, bytes: 3, format:'rgb'}
  ]
})

const PTZMoverTemplate = new DmxDeviceTemplate({
  fields: [
    { name: 'pan', offset: 2, bytes: 2},
    { name: 'tilt', offset: 4, bytes: 2},
    { name: 'mode', offset: 0, bytes: 1, defaultVal: 255},
    { name: 'intensity', offset: 1, bytes: 1},
    { name: 'zoom', offset: 13, bytes: 1},
    { name: 'wheel', offset: 7, bytes: 1},
    { name: 'color', offset: 8, length: 1, bytes: 3, format: 'rgb'},
    { name: 'white', offset: 11, bytes: 1}
  ]
})

const Matrix15x3x2 = new DmxDeviceTemplate({
  fields: [
    { name: 'color-row1', offset: 0, length: 15, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'color-row2', offset: 3*15, length: 15, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'color-row3', offset: 6*15, length: 15, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'white-row1', offset: 9*15+0*15, length: 15, bytes: 1, defaultVal: 0},
    { name: 'white-row2', offset: 9*15+1*15, length: 15, bytes: 1, defaultVal: 0},
  ]
})

const Matrix16x2x2 = new DmxDeviceTemplate({
  fields: [
    { name: 'color-row1', offset: 0, length: 16, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'color-row2', offset: 3*16, length: 16, bytes: 3, defaultVal: 0, format: 'rgb'},
    { name: 'white-row1', offset: 6*16+0*15, length: 16, bytes: 1, defaultVal: 0},
    { name: 'white-row2', offset: 6*16+1*15, length: 16, bytes: 1, defaultVal: 0},
    { name: 'amber-row1', offset: 6*16+2*15, length: 16, bytes: 1, defaultVal: 0},
    { name: 'amber-row2', offset: 6*16+3*15, length: 16, bytes: 1, defaultVal: 0},
  ]
})


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

  party.framebuffers = {
    0: new Uint8Array(512),
    1: new Uint8Array(512),
    2: new Uint8Array(512),
    3: new Uint8Array(512),
    4: new Uint8Array(512),
    5: new Uint8Array(512),
    6: new Uint8Array(512),
    7: new Uint8Array(512)
  }



  party.dmx = {
    devices: {

    }
  }

  let artnetTask = await runner.spawnTask('artnetproxy', {
    port: 6454,
    address: '10.20.254.110',
    allowedIP: ''
  })

  party.artnetTask = artnetTask

  let artnet = ArtNet.default({
    host: '10.20.254.110'
  })

  artnetTask.settings.ignoreClient = true

  const value = 0
  artnet.set(0, 1, Array(512).fill( value ))
  artnet.set(1, 1, Array(512).fill( value ))
  artnet.set(2, 1, Array(512).fill( value ))
  artnet.set(3, 1, Array(512).fill( value ))
  artnet.set(4, 1, Array(512).fill( value ))

  

  let artnetWait = new Promise((resolve,reject)=>{

    setTimeout(resolve, 3000)

  })

  await artnetWait


  artnetTask.settings.ignoreClient = false

  artnet.close()



 // console.log(artnetTask)

  console.log('started')
  
  //process.exit()
}



main().catch(err=>{
  console.error(err)
})




