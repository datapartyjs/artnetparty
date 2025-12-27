import * as DatapartySrv from '@dataparty/api/src/service/index.js'
import * as Path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);
import * as Debug from 'debug'
const debug = Debug.default('artnetparty.service')

export class ArtNetPartyService extends DatapartySrv.IService {
  constructor(opts, build){
    super(opts, build)

    let builder = new DatapartySrv.ServiceBuilder(this)

    builder.addMiddleware(DatapartySrv.middleware_paths.pre.decrypt)
    builder.addMiddleware(DatapartySrv.middleware_paths.pre.validate)

    builder.addMiddleware(DatapartySrv.middleware_paths.post.validate)
    builder.addMiddleware(DatapartySrv.middleware_paths.post.encrypt)

    builder.addEndpoint(DatapartySrv.endpoint_paths.identity)
    builder.addEndpoint(DatapartySrv.endpoint_paths.version)

    builder.addEndpoint(Path.join(__dirname, './party/endpoints/get-ip.cjs'))
    builder.addEndpoint(Path.join(__dirname, './party/endpoints/get-state.cjs'))
    builder.addEndpoint(Path.join(__dirname, './party/endpoints/set-lights-on.cjs'))
    builder.addEndpoint(Path.join(__dirname, './party/endpoints/claim-interface.cjs'))
    builder.addEndpoint(Path.join(__dirname, './party/endpoints/release-interface.cjs'))
    
    builder.addTask(Path.join(__dirname, './party/tasks/artnet-proxy.cjs'))
    
    builder.addAuth(Path.join(__dirname, './party/auth.cjs'))

  }

}
