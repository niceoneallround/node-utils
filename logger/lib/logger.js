/*jslint node: true, vars: true */

// logger - provides a wrapper for logging, longer term will
// push to a shared device or service so can analyze
//

const assert = require('assert');
const winston = require('winston');
const logentries2 = require('winston-logentries'); //jshint ignore:line
const logentries1 = require('node-logentries'); //jshint ignore:line
const util = require('util');

//
// create an instance of a logger based on configuration options
// props.useLogEntries
// props.leToken - the log entries token
//
function create(props) {
  'use strict';

  // holds onto the winston logger that is created
  let loggerInstance;

  //winston.level = 'debug';

  let consoleOptions = {
    timestamp: true,
  };

  console.log('Configuring log file with props:%j', props);

  if (!props || !props.LOG_ENTRIES) {
    console.log('Creating log NOT using log entries...%j', props);
    loggerInstance = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(consoleOptions),
        new (winston.transports.File)({ filename: 'workpnservice.log',
                                        maxSize: 20000, maxFiles: 5 })
      ]
    });

    log('info', 'Logger NOT using logEntries', [], { filename: 'logger/utils.js' });
  } else {
    console.log('Creating log using log entries...%j', props);
    assert(props.LOG_ENTRIES_TOKEN, util.format('Cannot use log entries unless a token is passed in:%j', props));
    loggerInstance = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(consoleOptions),
        new (winston.transports.File)({ filename: 'workpnservice.log',
                                        maxSize: 20000, maxFiles: 5 }),
        new (winston.transports.Logentries)(props.LOG_ENTRIES_TOKEN)
      ]
    });

    log('info', 'Logger using logEntries', null, { filename: 'node-utils/logger/utils.js' });
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
  // Used to log a progress message
  //
  function logProgress(msg) {
    console.log('***************');
    console.log('********** %s', msg);
    console.log('***************');
  }

  /**
    Used to log a string message
    @param level - log level
    @param info - json object containing any information to display with the message
    @param msg - the string message
    @param md - json metadata
  */
  function logStrings(level, info, strings, md) {
    assert(level, 'logString level param is missing');
    assert(info, 'logString info param is missing');
    assert(strings, 'logString msg param is missing');
    assert(md, 'logString md param is missing');

    let format = '%j';

    getLogger().log(level, format, [info], md);

    for (let i = 0; i < strings.length; i++) {
      getLogger().log(level, '  %s', [strings[i]]);
    }
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
    var id, msg, str;

    // log message if any pretty stuff then print that afterwards
    //log(level, '%j', [json], md);

    //
    // If the json contains a service message then pretty it up and print it
    //
    if (json.svcMsg) {
      msg = json.svcMsg;
    } else if (json.svcRequest) {
      msg = json.svcRequest;
    } else if (json.svcResponse) {
      msg = json.svcResponse;
    }

    // find bits of message want to print
    if (msg) {
      id = msg['@id'];
      log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE: %s', [JSON.stringify(msg, null, 2)], md);
    } else {
      // just log what was passed in
      getLogger().log(level, '%j', [json], md);
    }

    //
    // if contains a policy then pretty it up and print
    //
    if (json.policy) {
      if (msg) {
        log(level, json.serviceType + '-' + json.action + 'MESSAGE_ID:%s \nPOLICY: %s',
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
        log(level, json.serviceType + '-' + json.action + 'SVC_MESSAGE_ID:%s \nERROR: %s',
            [id, JSON.stringify(json.error, null, 2)], md);
      } else {
        log(level, '\nERROR: %s', [JSON.stringify(json.error, null, 2)], md);
      }
    }

    //
    // if contains metadata  then pretty it up and print
    //
    if (json.metadata) {
      str = JSON.stringify(json.metadata, null, 2);
      if (msg) {
        log(level, json.serviceType + '-' + json.action + '\nSVC_MESSAGE_ID:%s METADATA: %s',
                [id, str], md);
      } else {
        log(level, '\nMETADATA: %s', [str], md);
      }
    }

    //
    // if contains data then pretty it up and print
    //
    if (json.data) {
      str = JSON.stringify(json.data, null, 2);
      if (msg) {
        log(level, json.serviceType + '-' + json.action + 'SVC_MESSAGE_ID:%s \nDATA: %s',
                [id, str], md);
      } else {
        log(level, '\nDATA: %s', [str], md);

        //console.log(json.data); // ADD MORE
      }
    }
  }

  let thisLogger = {
    log: log,
    logProgress: logProgress,
    logStrings: logStrings,
    logJSON: logJSON };

  return thisLogger;
}

module.exports = {
  create: create
};
