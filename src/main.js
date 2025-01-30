const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { program } = require('commander');

// Parse command line arguments
program
  .option('--id <id>', 'access id that is expected to sign urls for this server')
  .option('--secret <secret>', 'secret associated to the access id')
  .option('--header <headers...>', 'headers to add to proxied request when url is authentic')
  .option('--no-bytes-monitor', 'disables the bytes transferred monitoring')
  .option('--access-control-allow-origin <origin>', 'sets the Access-Control-Allow-Origin header')
  .option('--access-control-allow-methods <methods>', 'sets the Access-Control-Allow-Methods header') 
  .option('--access-control-allow-headers <headers>', 'sets the Access-Control-Allow-Headers header')
  .parse();

const options = program.opts();

// Config class to handle secret validation and response
class Config {
  constructor(id, secret, headers) {
    this.id = id;
    this.secret = secret;
    this.headers = headers;
  }

  async getSecret(id) {
    if (id !== this.id) {
      return {
        type: 'early_response',
        response: {
          status: 401,
          body: ''
        }
      };
    }
    return {
      type: 'secret',
      secret: this.secret,
      headers: this.headers
    };
  }
}

// Parse headers from command line args
const parseHeaders = (headerArgs) => {
  const headers = {};
  if (!headerArgs) return headers;
  
  for (const h of headerArgs) {
    const [key, value] = h.split(':');
    if (!key || !value) {
      throw new Error(`Invalid header '${h}'`);
    }
    headers[key.trim()] = value.trim();
  }
  return headers;
};

// Log transferred bytes info
const logInfo = (info) => {
  const { bytes, kind, id } = info;
  console.log(JSON.stringify({
    bytes,
    id,
    kind,
    message: `${id} Transferred ${bytes} Bytes ${kind}`
  }));
};

const main = async () => {
  const app = express();
  app.use(express.json());

  // Parse config
  const headers = parseHeaders(options.header);
  const config = new Config(options.id, options.secret, headers);

  // Setup CORS if configured
  if (options.accessControlAllowOrigin || 
      options.accessControlAllowMethods || 
      options.accessControlAllowHeaders) {
    
    const corsOptions = {
      origin: options.accessControlAllowOrigin,
      methods: options.accessControlAllowMethods,
      allowedHeaders: options.accessControlAllowHeaders
    };
    app.use(cors(corsOptions));
  }

  // Setup monitoring if enabled
  if (options.bytesMonitor) {
    app.use((req, res, next) => {
      const oldWrite = res.write;
      const oldEnd = res.end;
      
      let bytes = 0;

      res.write = (...args) => {
        bytes += args[0].length;
        return oldWrite.apply(res, args);
      };

      res.end = (...args) => {
        if (args[0]) {
          bytes += args[0].length;
        }
        logInfo({
          bytes,
          kind: 'response',
          id: req.ip
        });
        return oldEnd.apply(res, args);
      };

      next();
    });
  }

  // Start server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Handle CTRL+C
  process.on('SIGINT', () => {
    console.log('Shutting down server');
    process.exit(0);
  });
};

main().catch(console.error);