/*jslint node: true, vars: true */

//
// Provides util routines to http access the Privacy Broker - mainly encapsualtes the paths
// later may add more
//

var assert = require('assert'),
    loggingMD = { fileName: 'apigwRequestWrapper.js' },
    requestWrapper = require('../../requestWrapper/lib/requestWrapper'),
    util = require('util'),
    callbacks = {},
    promises = {},
    utils = {},
    APIGW_DOMAIN_PATH = '/v1/domains',
    APIGW_PP_PATH = '/privacy_pipe';

//
// expose the path as used in testing for nocks
//
utils.generateCreatePipePathUrl = function generateCreatePipePathUrl(domainIdParam) {
  'use strict';
  return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_PP_PATH;
};

//
// props.domainIdParam
//
promises.postCreatePrivacyPipeJWT  = function postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//
// props.domainIdParam
//
callbacks.postCreatePrivacyPipeJWT = function postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT, callback) {
  'use strict';
  assert(ppJWT, 'postCreatePrivacyPipe ppJWT param is missing');
  assert(apigwUrl, 'postCreatePrivacyPipe apigwUrl param is missing');
  assert(props.domainIdParam, util.format('props.domainIdParam is missing: %j', props));

  var postUrl = apigwUrl + utils.generateCreatePipePathUrl(props.domainIdParam);

  return callbacks.postJWT(props, postUrl, ppJWT, callback);
};

//
// Post JWT to the apigw and pass result to the callback
//
callbacks.postJWT = function postJWT(props, postUrl, sendJWT, callback) {
  'use strict';

  assert(props.logger, util.format('props.logger is mising:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is missing - used to track:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  var postProps = {};
  postProps.jwt = sendJWT;
  postProps.url = postUrl;

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-API-GATEWAY',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: postProps.url, jwt: sendJWT }, loggingMD);

  requestWrapper.postJWT(postProps, function (err, response, returnJWT) {
    return callback(err, response, returnJWT);
  });
};

module.exports = {
  callbacks: callbacks,
  promises: promises,
  utils: utils
};
