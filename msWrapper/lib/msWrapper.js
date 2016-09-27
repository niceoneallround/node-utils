/*jslint node: true, vars: true */

//
//  Provide a set of promises to perform operations on the metadata service
//

const assert = require('assert');
const HttpStatus = require('http-status');
const requestWrapper = require('../../requestWrapper/lib/requestWrapper');
const util = require('util');

var promises = {};

// return the metadata JWT
promises.promiseMetadata = function promiseMetadata(mdId, msUrl, props) {
  'use strict';
  return new Promise(function (resolve, reject) {
    internalFetchMetadataFromMS(mdId, msUrl, props, function (err, mdR, mdJWT) {
      if (err) {
        reject(err);
      } else {
        resolve(mdR, mdJWT);
      }
    });
  });
};

// fetch the requested metadata from the metadata service
function internalFetchMetadataFromMS(mdId, msUrl, props, callback) {
  'use strict';
  assert(mdId, 'mdId param missing - used just for logging');
  assert(msUrl, 'msUrl param missing - must include domain and mdId');
  assert(props, 'props param missing');
  assert(props.logger, util.format('props.logger is mising:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is mising - used to track:%j', props));
  assert(props.logMsgPrefix, util.format('props.logMsgPrefix is mising:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));
  assert(callback, 'callback missing');

  const loggingMD = { ServiceType: props.logMsgServiceName, FileName: 'node-utils/msWrapper.js' };

  // convert the mdId into a format that can be added to a URL
  let getProps = { url: msUrl };

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: props.logMsgPrefix + '-GET-Metadata-Start',
                      getProps: getProps, mdId: mdId, id: props.loggerMsgId }, loggingMD);

  requestWrapper.getJWT(getProps, function (err, response, outputJWT) {
    if (err) {
      props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action:  props.logMsgPrefix + '-GET-Metadata-ERROR',
                  getProps: getProps, mdId: mdId, id: props.loggerMsgId, err: err }, loggingMD);
      return callback(err, null, null);
    }

    switch (response.statusCode) {
      case HttpStatus.OK: {
        props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: props.logMsgPrefix + '-GET-Metadata-Success',
                          getProps: getProps, mdId: mdId, id: props.loggerMsgId,
                          returnedStatusCode: response.statusCode, returnedHeaders: response.headers }, loggingMD);
        return callback(null, outputJWT);
      }

      case HttpStatus.NOT_FOUND: {
        props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action:  props.logMsgPrefix + '-GET-Metadata-ERROR-NOT-FOUND',
                  getProps: getProps, mdId: mdId, id: props.loggerMsgId,
                  returnedStatusCode: response.statusCode, returnedHeaders: response.headers }, loggingMD);
        return callback(HttpStatus.NOT_FOUND, null, null);
      }

      default: {
        return callback(util.format('%s-%s-GetMetadata-%s-Error-Unexpected status code:%s',
                        props.logMsgServiceName, props.logMsgPrefix, mdId, response.statusCode), null, null);
      }

    }
  });
}

module.exports = {
  promises: promises
};
