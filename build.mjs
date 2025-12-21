import * as Path from 'path'

import { fileURLToPath } from 'url';

import * as Debug from 'debug'
const debug = Debug.default('rfpartyd.build')
import * as DatapartyLib from '@dataparty/api/src/index.js'

const Dataparty=DatapartyLib.default

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

import  Pkg from './package.json' with { type: 'json'}
import { ArtNetPartyService } from './src/artnet-service.mjs'


async function main(){

  const service = new ArtNetPartyService({ name: Pkg.name, version: Pkg.version })
  const builder = new Dataparty.ServiceBuilder(service)
  const build = await builder.compile(Path.join(__dirname,'/dataparty'), true)

  debug('compiled')
}

main().catch(err=>{
  console.error('CRASH')
  console.error(err)
})
