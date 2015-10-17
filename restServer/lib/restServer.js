/*jslint node: true, vars: true */

//
// wrap restify with some common routines that i was using across and end
// point rest service
//

var assert = require('assert'),
    loggerFactory = require('../../logger/lib/logger'),
    loggingMD = { fileName: 'restService.js' },
    restify = require('restify'),
    util = require('util');

//
// create a service - non blocking
// props.name - the service name
// props.logger - if want to use a specific logger then pass it in
// props.logConfig - if want to service to create own one
//
function createRestService(props) {
  'use strict';

  var thisService,
      logger,
      restifyServer = null,
      serviceName,
      baseURL,
      URLversion,
      port;

  assert(props, 'createRestService requires props');
  assert(props.name, util.format('createRestService props must have a name param:%j', props));
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
  // Return logger associated with the service
  function getLogger() {
    return logger;
  }

  // start the service
  // *config
  //  **baseURL
  //  **port - the port to start on
  //  **URLversion - the version to prefix all paths with, i.e v1
  function start(props, callback) {

    logger.logJSON('info', { serviceType: serviceName, action: 'Service-Start', props:props}, loggingMD);

    assert(props.baseURL, util.format('RestServer.start No baseURL in props:%j', props));
    baseURL = props.baseURL;

    assert(props.URLversion, util.format('RestServer.start No URLversion in props:%j', props));
    URLversion = '/' + props.URLversion;

    assert(props.port, util.format('RestServer.start No port in config:%j', props));
    port = props.port;
    restifyServer = restify.createServer();

    //
    // if an unexpected errors the shut down process
    //
    restifyServer.on('uncaughtException', function(p1, p2, p3, p4) {
      if (p4 instanceof assert.AssertionError) {
        logger.logJSON('error', { serviceType: serviceName,
                action: 'Service-Crashing-assert-AssertionError', errString:p4}, loggingMD);
      } else {
        logger.logJSON('error', { serviceType: serviceName,
                action: 'Service-Crashing-Unknown-Error', errType: (typeof p4) }, loggingMD);
      }

      console.log('%s - Service-Crashing-Unknown-Error: \np1:%s, \np2:%s, \np3:%s, \np4:%s', serviceName, p1, p2, p3, p4);
      process.abort();
    });

    // add the built in plugins - if do not add this then no body
    restifyServer.use(restify.bodyParser());

    restifyServer.listen(port, function() {
      logger.logJSON('info', { serviceType: serviceName, action: 'Service-Started',
                               serverName: restifyServer.name, serverUrl:restifyServer.url,
                               baseURL: baseURL, URLversion: URLversion, port: port}, loggingMD);

      return callback(null);

    });
  }

  //
  // stop the service
  //
  function stop(callback) {
    logger.logJSON('info', { serviceType: serviceName, action: 'Service-Stop'}, loggingMD);
    return callback(null);
  }

  // logs a message - can be placed on handler chain for a path
  function loggingHandler(req, res, next, actionMsg, path) {
    logger.logJSON('info', { serviceType: serviceName, action: actionMsg, path: path, headers: req.headers}, loggingMD);
    return next();
  }

  //
  // register the handler on the specified path
  //
  function registerGETHandler(path, handler) {

    var versionedPath = baseURL + URLversion;

    // if a path passed in the append
    if (path) {
      versionedPath =  versionedPath + path;
    }

    assert(handler, 'No handler passed to registerGETHandler');
    assert(handler.get, util.format('No get method on handler:%j', handler));

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-GET-Handler', path: versionedPath}, loggingMD);

    restifyServer.get(
      versionedPath,
      function(req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'GET-on-path', versionedPath);
      },

      function(req, res, next) {
        handler.get(req, res, function(err, data) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'pnServiceService-GET-Handler-ERROR',
                            path: versionedPath, error: err}, loggingMD);
            assert(!err, util.format('pnServiceSerice - Unexpected ERROR: %j - processing GET on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {
            // send the data - expected to be json
            res.setHeader('content-type', 'application/json');
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

    var versionedPath = baseURL + URLversion + path;

    assert(handler, 'No handler passed to registerPOSTHandler');
    assert(handler.post, util.format('No post method on handler:%j', handler));

    logger.logJSON('info', { serviceType: serviceName, action: 'Registered-POST-Handler', path: versionedPath}, loggingMD);

    restifyServer.post(
      versionedPath,
      function(req, res, next) { // jshint ignore:line
        loggingHandler(req, res, next, 'Recieved-POST-on', versionedPath);
      },

      function(req, res, next) {
        handler.post(req, res, function(err) {
          if (err) {
            logger.logJSON('error', { serviceType: serviceName, action: 'pnServiceService-POST-Handler-ERROR',
                            path: versionedPath, error: err, svcRequest: req}, loggingMD);
            assert(!err, util.format('pnServiceSerice - Unexpected ERROR: %j - processing POST on: %s', err, versionedPath));
            return next((new restify.BadRequestError(err)));
          } else {
            return next();
          }
        });
      }
    );
  }

  thisService = {
    logger: getLogger,
    registerGETHandler: registerGETHandler,
    registerPOSTHandler: registerPOSTHandler,
    start: start,
    stop: stop };

  return thisService;
}

module.exports = {
  create: createRestService
};
