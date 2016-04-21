/*jslint node: true, vars: true */

//
//  Provide a set of promises to perform operations on the metadata service
//

var assert = require('assert'),
    loggingMD = { fileName: 'pbWrapper.js' },
    requestWrapper = require('../../requestWrapper/lib/requestWrapper'),
    util = require('util'),
    callbacks = {},
    promises = {},
    PRIVACY_BROKER_DOMAIN_PATH = '/v1/domains',
    PRIVACY_BROKER_PP_PATH = '/privacy_pipe';

promises.postCreatePrivacyPipeJWT  = function postCreatePrivacyPipeJWT(props, pbUrl, ppJWT) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.postCreatePrivacyPipeJWT(props, pbUrl, ppJWT, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//
//
//
callbacks.postCreatePrivacyPipeJWT = function postCreatePrivacyPipeJWT(props, pbUrl, ppJWT, callback) {
  'use strict';
  assert(ppJWT, 'postCreatePrivacyPipe ppJWT param is missing');
  assert(pbUrl, 'postCreatePrivacyPipe pbUrl param is missing');
  assert(props.domainIdParam, util.format('props.domainIdParam is missing: %j', props));

  var postUrl = pbUrl + PRIVACY_BROKER_DOMAIN_PATH +
                  '/' + props.domainIdParam +
                  PRIVACY_BROKER_PP_PATH;

  return callbacks.postJWT(props, postUrl, ppJWT, callback);
};

//
// Post JWT to the privacy broker and pass result to the callback
//
callbacks.postJWT = function postJWT(props, postUrl, sendJWT, callback) {
  'use strict';

  assert(props.logger, util.format('props.logger is mising:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is mising - used to track:%j', props));
  assert(props.logMsgPrefix, util.format('props.logMsgPrefix is mising:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  var postProps = {};
  postProps.jwt = sendJWT;
  postProps.url = postUrl;

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: props.logMsgPrefix + '-POST-Privacy-Broker',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: postProps.url, jwt: sendJWT }, loggingMD);

  // post the passed in JWT to the Privacy Broker, wait for return and pass back to caller in the POST reponse
  //
  requestWrapper.postJWT(postProps, function (err, response, returnJWT) {
    return callback(null, response, returnJWT);
  });
};

module.exports = {
  callbacks: callbacks,
  promises: promises
};
