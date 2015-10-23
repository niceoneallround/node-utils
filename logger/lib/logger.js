/*jslint node: true, vars: true */

// logger - provides a wrapper for logging, longer term will
// push to a shared device or service so can analyze
//

var assert = require('assert'),
    winston = require('winston'),
    logentries2 = require('winston-logentries'), //jshint ignore:line
    logentries1 = require('node-logentries'), //jshint ignore:line
    util = require('util'),
    PROPERTIES = null;

PROPERTIES = {
  leToken: 'leToken',
  useLogEntries: 'useLogEntries'
};

//
// create an instance of a logger based on configuration options
// props.useLogEntries
// props.leToken - the log entries token
//
function create(props) {
  'use strict';

  var useLogEntries = false,
      consoleOptions = {},
      loggerInstance,
      thisLogger;

  winston.level = 'debug';
  consoleOptions.timestamp = true;

  if ((props) && (props[PROPERTIES.useLogEntries])) {
    useLogEntries = true;
    assert(props[PROPERTIES.leToken], util.format('Using log entries but no log entry token:%j', props));
  }

  if (!useLogEntries) {
    console.log('Creating log NOT using log entries...%s', useLogEntries);
    loggerInstance = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(consoleOptions),
        new (winston.transports.File)({filename: 'workpnservice.log',
                                        maxSize: 20000, maxFiles: 5})
      ]
    });

    log('info', 'Logger NOT using logEntries', [], {filename: 'logger/utils.js'});
  } else {
    console.log('Creating log using log entries...%s', useLogEntries);
    loggerInstance = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(consoleOptions),
        new (winston.transports.File)({filename: 'workpnservice.log',
                                        maxSize: 20000, maxFiles: 5}),
        new (winston.transports.Logentries)(props[PROPERTIES.leToken])
      ]
    });

    log('info', 'Logger using logEntries', null, {filename: 'logger/utils.js'});
  }

  function getLogger() {
    return loggerInstance;
  }

  //
  // Basic logging mechanism
  //
  // *level string
  // *message printf string
  // *array of params for message, can be null
  // *md - json md written to output
  //
  function log(level, message, params, md) {

    //buddy ignore:start
    if ((!params) || (params.length === 0)) {
      getLogger().log(level, message, md);
    } else if (params.length === 1) {
      getLogger().log(level, message, params[0], md);
    } else if (params.length === 2) {
      getLogger().log(level, message, params[0], params[1], md);
    } else if (params.length === 3) {
      getLogger().log(level, message, params[0], params[1], params[2], md);
    } else if (params.length === 4) {
      getLogger().log(level, message, params[0], params[1], params[2], params[3], md);
    } else if (params.length === 5) {
      getLogger().log(level, message, params[0], params[1], params[2], params[3], params[4], md);
    } else if (params.length === 6) {
      getLogger().log(level, message,
                        params[0], params[1], params[2], params[3], params[4], params[5], md);
    } else if (params.length === 7) {
      getLogger().log(level, message,
                        params[0], params[1], params[2], params[3], params[4], params[5], params[6], md);
    } else {
      assert(false, util.format('To many parameters max is 7 passed:%s', params.length));
    }

    //buddy ignore:end
  }

  //
  // Log json format message
  // *level - the level
  // *json - the message
  // *md - md written to output
  //
  // examples are
  // - logJSON('info', { serviceType: 'PNode', action: 'Obfuscate-Start', svcMsg: svcMessage}, loggingMD);
  // - logJSON('info', { serviceType: 'PNode', action: 'Obfuscate-End', svcRequest: svcMessage}, loggingMD);
  // - logJSON('info', { serviceType: 'PNode', action: 'Obfuscate-Start', svcResponse: svcMessage}, loggingMD);
  // - logJSON('info', { serviceType: 'PNode', action: 'Obfuscate-Start', data: svcRequest[API_P.datasets]}, loggingMD);
  // - logJSON('info', { serviceType: 'PNode', action: 'Obfuscate-Process', description: policy: pp}, loggingMD);
  // - logJSON('info', { serviceType: 'PB', action: 'Create-SIM', metadata: sim}, loggingMD);
  // - logJSON('error',{ serviceType: '', action: '', error: {err: '', errMsg: ''}}, loggingMD)
  //
  function logJSON(level, json, md) {
    var id, msg;

    //
    // If the json contains a service message then pretty it up and print it
    //
    if (json.svcMsg) {
      msg = json.svcMsg;
    } else if (json.svcRequest) {
      msg = json.svcRequest;
    } else if (json.svcResponse) {
      msg = json.SvcResponse;
    }

    if (msg) {
      id = msg['@id'];
      log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE: %s', [JSON.stringify(msg, null, 2)], md);
    } else {
      // just log what was passed in
      getLogger().log(level, 'message: %j', json, md);
    }

    //
    // if contains a policy then pretty it up and print
    //
    if (json.policy) {
      if (msg) {
        log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE_ID:%s POLICY: %s',
                [id, JSON.stringify(json.policy, null, 2)], md);
      } else {
        log(level, '\nPOLICY: %s', [JSON.stringify(json.policy, null, 2)], md);
      }
    }

    //
    // if contains an error then pretty it up and print
    //
    if (json.error) {
      if (msg) {
        log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE_ID:%s ERROR: %s',
                [id, JSON.stringify(json.error, null, 2)], md);
      } else {
        log(level, '\nERROR: %s', [JSON.stringify(json.error, null, 2)], md);
      }
    }

    //
    // if contains metadata  then pretty it up and print
    //
    if (json.metadata) {
      if (msg) {
        log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE_ID:%s METADATA: %s',
                [id, JSON.stringify(json.metadata, null, 2)], md);
      } else {
        log(level, '\nMETADATA: %s', [JSON.stringify(json.metadata, null, 2)], md);
      }
    }

    //
    // if contains data then pretty it up and print
    //
    if (json.data) {
      if (msg) {
        log(level, json.serviceType + '-' + json.action + 'SVC_MESSAGE_ID:%s \nDATA: %s',
                [id, JSON.stringify(json.data, null, 2)], md);
      } else {
        log(level, '\nDATA: %s', [JSON.stringify(json.data, null, 2)], md);
      }
    }
  }

  thisLogger = {
    log: log,
    logJSON: logJSON };

  return thisLogger;
}

module.exports = {
  create: create,
  PROPERTIES: PROPERTIES
};
