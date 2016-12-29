/*jslint node: true, vars: true */

//
// wrap restify with some common routines that i was using across and end
// point rest service
//

const assert = require('assert');
const fs = require('fs');
const loggerFactory = require('../../logger/lib/logger');
const loggingMD = { fileName: 'node-utils/restServer.js' };
const HttpStatus = require('http-status');
const restify = require('restify');
const util = require('util');

//
// create a service - non blocking
// props.name - the service name
// props.logger - if want to use a specific logger then pass it in
// props.logConfig - if want to service to create own one
// props.host - override default host of 0.0.0.0 passed to .listen()
// props.serviceVersionNumber - optional if exists added to status message
//      on '/' - not used for url versioning
//
// Internal API controls - if enabled each GET or POST must contain the header key and api key
// props.internalAPIKey.enabled - '1' or 'O'
//  - can be overridden by process.env.INTERNAL_API_KEY_ENABLED
// props.internalAPIKey.name - the name of header property, if not supplied default is 'x-pn-hard-coded-api-key'
//  - can be overriden by process.env.INTERNAL_API_KEY_NAME
// props.internalAPIKey.key - the api key value
//  - can be override by process.env.INTERNAL_API_KEY
//
// TLS controls
// Can be turned off with process.env.TLS_DISABLED: '1' - by default enabled
// props.certficate: the file holding the certificate
// props.key: the file holding the key
//

function createRestService(props) {
  'use strict';

  var thisService,
      logger,
      restifyServer = null,
      serviceName,
      baseURL = null,
      URLversion,
      port,
      host = '0.0.0.0', // for docker bind to this can overide with props.host
      internalApiKey = {};

  assert(props, 'createRestService requires props');
  assert(props.name, util.format('createRestService props must have a name param:%j', props));
  console.log('createRestService invoked with props:%j', props);
  serviceName = props.name;
  loggingMD.ServiceType = props.name;

  // if passed in a logger then use that over the one we have
  //
  if (props.logger) {
    logger = props.logger;
  } else {
    // logger can handle a null logConfig
    logger = loggerFactory.create(props.logConfig);
  }

  //
  // create the underlying RestServer and install any middleware it needs before
  // installing others - was running into issues with Promises and next being
  // ignored if installed afterwards
  //

  //
  // Determine if using TLS
  //
  if ((process.env.TLS_ENABLED === '1') || (props.TLSEnabled === '1')) {
    assert(props.certificate, util.format('TLS enabled and no props.certificate passed in:%j', props));
    assert(props.key, util.format('TLS enabled and no props.key passed in:%j', props));

    logger.logJSON('info',
          { serviceType: serviceName, action: 'RestServer-TLS-ENABLED',
            certificate: props.certificate, key: props.key }, loggingMD);

    restifyServer = restify.createServer({
      certificate: fs.readFileSync(props.certificate),
      key: fs.readFileSync(props.key)
    });

  } else {

    logger.logJSON('info',
          { serviceType: serviceName, action: 'RestServer-TLS-DISABLED' }, loggingMD);

    restifyServer = restify.createServer();
  }

  console.log('createRestService - created server - adding: bodyParser; queryParser');

  // add the built in plugins - if do not add this then no body
  restifyServer.use(restify.bodyParser());
  restifyServer.use(restify.queryParser());

  // check properties needed for paths
  assert(props.baseURL, util.format('RestServer.start No baseURL in props:%j', props));

  // if just slash then do set to null as resify adds a slash
  if (props.baseURL !== '/') {
    baseURL = props.baseURL;
  } else {
    baseURL = null;
  }

  assert(props.URLversion, util.format('RestServer.start No URLversion in props:%j', props));
  URLversion = '/' + props.URLversion;

  assert(props.port, util.format('RestServer.start No port in config:%j', props));
  port = props.port;

  if (props.host) {
    host = props.host;
  }

  //
  // Check if any of the internal API key are enabled - these are controlled by
  // - INTERNAL_API_KEY_NAME the header field name
  // - INTERNAL_API_KEY the api key
  // - INTERNAL_API_KEY_ENABLED 1 or 0
  //
  internalApiKey.enabled = process.env.INTERNAL_API_KEY_ENABLED;
  if ((internalApiKey.enabled) && (internalApiKey.enabled === '1')) {
    internalApiKey.key = process.env.INTERNAL_API_KEY;
    internalApiKey.name = process.env.INTERNAL_API_KEY_NAME;
    if (!internalApiKey.name) {
      internalApiKey.name = 'x-pn-hard-coded-api-key';
    }

    logger.logJSON('info', { serviceType: serviceName, action: 'RestServer-Internal-API-Key-Enabled',
          internalApiKey: internalApiKey }, loggingMD);
  } else {
    if (props.internalApiKey) {
      internalApiKey = props.internalApiKey;

      logger.logJSON('info', { serviceType: serviceName, action: 'RestServer-Internal-API-Key-Enabled-Via-Props-Override',
            internalApiKey: internalApiKey }, loggingMD);
    }
  }

  // check API key if all good continue with next otherwise return forbidden
  function checkInternalApiKey(req) {
    var value;
    if ((internalApiKey.enabled) && (internalApiKey.enabled === '1')) {
      if (req.headers) {
        value = req.headers[internalApiKey.name];
        if (value === internalApiKey.key) {
          return HttpStatus.OK;
        } else {
          return HttpStatus.FORBIDDEN;
        }
      }
    } else {
      return HttpStatus.OK;
    }
  }

  //
  // Return logger associated with the service
  function getLogger() {
    return logger;
  }

  // start the service
  function start(startedCallback) {

    assert(startedCallback, 'start - no callback passed in');

    logger.logJSON('info', { serviceType: serviceName, action: 'RestServer-Start-Invoked',
      baseURL: baseURL, URLversion: URLversion, port: port, host: host }, loggingMD);

    //
    // if an unexpected errors the shut down process
    //
    restifyServer.on('uncaughtException', function (p1, p2, p3, p4) {
      if (p4 instanceof assert.AssertionError) {
        logger.logJSON('error', { serviceType: serviceName,
                action: 'RestServer-Crashing-assert-AssertionError', errString: p4 }, loggingMD);
      } else {
        logger.logJSON('error', { serviceType: serviceName,
                action: 'RestServer-Crashing-Unknown-Error',
                errorMsg: util.format('p1:%s, p2:%s, p3:%s, p4:%s', serviceName, p1, p2, p3, p4) }, loggingMD);
      }

      console.log('%s - console-log-RestServer-Crashing-Unknown-Error: \np1:%s, \np2:%s, \np3:%s, \np4:%s', serviceName, p1, p2, p3, p4);
      console.log('STACK:%s', p4.stack);
      process.abort();
    });

    restifyServer.listen(port, host, function (err) {
      assert(!err, util.format('Error restifyServer.listen;%j', err));

      //
      // add a log request at '/'
      //
      restifyServer.get('/', function (req, res, next) { // jshint ignore:line
        var statusMsg = {};
        loggingHandler(req, res, next, 'GET-on-path', '/');
        res.statusCode = HttpStatus.OK;
        res.setHeader('content-type', 'application/json');
        statusMsg.statusCode = HttpStatus.OK;
        statusMsg.serviceName = serviceName;
        statusMsg.version = props.serviceVersionNumber;
        res.send(statusMsg);
      });

      logger.logJSON('info',
        { serviceType: serviceName, action: 'RestServer-Started',
          address: restifyServer.address(),
          serverName: restifyServer.name, restifyServerUrl: restifyServer.url,
          baseURL: baseURL, URLversion: URLversion, port: port,
          serviceName: serviceName, serviceVersion: props.serviceVersionNumber }, loggingMD);

      return startedCallback(null);

    });
  }

  //
  // stop the service
  //
  function stop(callback) {
    logger.logJSON('info', { serviceType: serviceName, action: 'Service-Stop' }, loggingMD);
    restifyServer.close();
    return callback(null);
  }

  // logs a message - can be placed on handler chain for a path
  function loggingHandler(req, res, next, actionMsg, path) {
    logger.logJSON('info', { serviceType: serviceName, action: actionMsg, path: path, headers: req.headers }, loggingMD);
    return next();
  }

  //
  // register the handler on the specified path
  //
  function registerGETHandler(path, handler) {

    var versionedPath;

    if (baseURL) {
      versionedPath = baseURL + URLversion;
    } else {
      versionedPath = URLversion;
    }

    // if a path passed in the append
    if (path) {
      versionedPath =  versionedPath + path;
    }

    assert(handler, 'No handler passed to registerGETHandler');
    assert(handler.get, util.format('No get method on handler:%j', handler));

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-GET-Handler', path: versionedPath }, loggingMD);

    restifyServer.get(
      versionedPath,
      function (req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'GET-on-path', versionedPath);
      },

      function (req, res, next) {
        var s = checkInternalApiKey(req);
        if (s !== HttpStatus.OK) {

          logger.logJSON('info', { serviceType: serviceName,
                                  action: 'Get-on-path-FORBIDDEN', path: versionedPath,
                                  headers: req.headers }, loggingMD);

          res.statusCode = s;
          res.setHeader('content-type', 'text/plain');
          res.send('FORBIDDEN');
          return next();
        }

        handler.get(req, res, function (err, data) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'GET-Handler-ERROR',
                            path: versionedPath, error: err }, loggingMD);
            assert.fail(util.format('Unexpected ERROR: %j - processing GET on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {
            // if not set then default to json
            if ((!res.getHeader('content-type')) && (!res.getHeader('Content-type'))) {
              res.setHeader('content-type', 'application/json');
            }

            if (!res.statusCode) {
              res.statusCode = HttpStatus.OK;
            }

            res.send(data);
            return next();
          }
        });
      }
    );
  }

  function registerGETJWTHandler(path, handler) {

    var versionedPath;

    if (baseURL) {
      versionedPath = baseURL + URLversion;
    } else {
      versionedPath = URLversion;
    }

    // if a path passed in the append
    if (path) {
      versionedPath =  versionedPath + path;
    }

    assert(handler, 'No handler passed to registerGETJWTHandler');
    assert(handler.get, util.format('No get method on handler:%j', handler));

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-GETJWT-Handler', path: versionedPath }, loggingMD);

    restifyServer.get(
      versionedPath,
      function (req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'GET-on-path', versionedPath);
      },

      function (req, res, next) {
        var s = checkInternalApiKey(req);
        if (s !== HttpStatus.OK) {

          logger.logJSON('info', { serviceType: serviceName,
                                  action: 'GetJWT-on-path-FORBIDDEN', path: versionedPath,
                                  headers: req.headers }, loggingMD);

          res.statusCode = s;
          res.setHeader('content-type', 'text/plain');
          res.send('FORBIDDEN');
          return next();
        }

        handler.get(req, res, function (err, data) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'GETJWT-Handler-ERROR',
                            path: versionedPath, error: err }, loggingMD);
            assert.fail(util.format('Unexpected ERROR: %j - processing GETJWt on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {
            // if not set then default to json
            if ((!res.getHeader('content-type')) && (!res.getHeader('Content-type'))) {
              res.setHeader('content-type', 'text/plain');
            }

            if (!res.statusCode) {
              res.statusCode = HttpStatus.OK;
            }

            res.send(data);
            return next();
          }
        });
      }
    );
  }

  //
  // register the handler on the specified path
  //
  function registerPOSTHandler(path, handler) {

    var versionedPath;

    assert(handler, 'No handler passed to registerPOSTHandler');
    assert(handler.post, util.format('No post method on handler:%j', handler));

    if (baseURL) {
      versionedPath = baseURL + URLversion + path;
    } else {
      versionedPath = URLversion + path;
    }

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-POST-Handler', path: versionedPath }, loggingMD);

    restifyServer.post(
      versionedPath,
      function (req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'Recieved-POST-on', versionedPath);
      },

      function (req, res, next) {
        let s = checkInternalApiKey(req);
        if (s !== HttpStatus.OK) {

          logger.logJSON('info', { serviceType: serviceName,
                                  action: 'POST-on-path-FORBIDDEN', path: versionedPath,
                                  headers: req.headers }, loggingMD);

          res.statusCode = s;
          res.setHeader('content-type', 'text/plain');
          res.send('FORBIDDEN');
          return next();
        }

        handler.post(req, res, function (err, data, props) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'POST-Handler-ERROR',
                            path: versionedPath, error: err, svcRequest: req }, loggingMD);
            assert(!err, util.format('Unexpected ERROR: %j - processing POST on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {

            if (props) {
              assert.fail(
                'Code no longer pass props to set the status code or header, set directly if want to overide default:%s', props);
            }

            if (!res.statusCode) {
              logger.logJSON('error', { serviceType: serviceName, action: 'POST-Handler-Setting-Status-Code-to-Default-OK',
                              path: versionedPath, svcRequestId: req['@id'] }, loggingMD);
              res.statusCode = HttpStatus.OK;
            }

            if ((!res.getHeader('content-type')) && (!res.getHeader('Content-type'))) {
              logger.logJSON('info', { serviceType: serviceName, action: 'POST-Handler-Setting-Response-Content-Type-to-application-json-as-not-set',
                              path: versionedPath }, loggingMD);
              res.setHeader('content-type', 'application/json');
            }

            if (!data) {
              res.send();
            } else {
              res.send(data);
            }

            return next();
          }
        });
      }
    );
  }

  function registerPOSTJWTHandler(path, handler) {

    var versionedPath;

    assert(handler, 'No handler passed to registerPOSTJWTHandler');
    assert(handler.post, util.format('No post method on handler:%j', handler));

    if (baseURL) {
      versionedPath = baseURL + URLversion + path;
    } else {
      versionedPath = URLversion + path;
    }

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-POST-JWT-Handler', path: versionedPath }, loggingMD);

    restifyServer.post(
      versionedPath,
      function (req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'Recieved-POST-on', versionedPath);
      },

      function (req, res, next) {
        var s = checkInternalApiKey(req);
        if (s !== HttpStatus.OK) {

          logger.logJSON('info', { serviceType: serviceName,
                                  action: 'POSTJWT-on-path-FORBIDDEN', path: versionedPath,
                                  headers: req.headers }, loggingMD);

          res.statusCode = s;
          res.setHeader('content-type', 'text/plain');
          res.send('FORBIDDEN');
          return next();
        }

        handler.post(req, res, function (err, data) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'POST-JWT-Handler-ERROR',
                            path: versionedPath, error: err, svcRequest: req }, loggingMD);
            assert(!err, util.format('Unexpected ERROR: %j - processing POSTJWT on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {

            if (!res.statusCode) {
              logger.logJSON('error', { serviceType: serviceName, action: 'POST-JWT-Handler-Setting-Status-Code-to-Default-OK',
                              path: versionedPath, svcRequestId: req['@id'] }, loggingMD);
              res.statusCode = HttpStatus.OK;
            }

            // if the content-header has not been set then set to default of returning
            // a jwt.
            if ((!res.getHeader('content-type')) && (!res.getHeader('Content-type'))) {
              res.setHeader('content-type', 'text/plain');
            }

            if (!data) {
              res.send();
            } else {
              res.send(data);
            }

            return next();
          }
        });
      }
    );
  }

  thisService = {
    logger: getLogger,
    registerGETHandler: registerGETHandler,
    registerGETJWTHandler: registerGETJWTHandler,
    registerPOSTHandler: registerPOSTHandler,
    registerPOSTJWTHandler: registerPOSTJWTHandler,
    start: start,
    stop: stop };

  return thisService;
}

module.exports = {
  create: createRestService
};
