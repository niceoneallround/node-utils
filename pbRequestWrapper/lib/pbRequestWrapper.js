/*jslint node: true, vars: true */

//
// Provides util routines to http access the Privacy Broker - mainly encapsualtes the paths
// later may add more
//

var assert = require('assert'),
    loggingMD = { fileName: 'pbRequestWrapper.js' },
    requestWrapper = require('../../requestWrapper/lib/requestWrapper'),
    util = require('util'),
    callbacks = {},
    promises = {},
    utils = {},
    PRIVACY_BROKER_DOMAIN_PATH = '/v1/domains',
    PRIVACY_BROKER_PP_PATH = '/privacy_pipe';

//
// expose the path as used in testing for nocks
//
utils.generateCreatePipePathUrl = function generateCreatePipePathUrl(domainIdParam) {
  'use strict';
  return PRIVACY_BROKER_DOMAIN_PATH + '/' + domainIdParam + PRIVACY_BROKER_PP_PATH;
};

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

  var postUrl = pbUrl + utils.generateCreatePipePathUrl(props.domainIdParam);
  /*PRIVACY_BROKER_DOMAIN_PATH +
                  '/' + props.domainIdParam +
                  PRIVACY_BROKER_PP_PATH;*/

  return callbacks.postJWT(props, postUrl, ppJWT, callback);
};

//
// Post JWT to the privacy broker and pass result to the callback
//
callbacks.postJWT = function postJWT(props, postUrl, sendJWT, callback) {
  'use strict';

  assert(props.logger, util.format('props.logger is mising:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is missing - used to track:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  var postProps = {};
  postProps.jwt = sendJWT;
  postProps.url = postUrl;

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-Privacy-Broker',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: postProps.url, jwt: sendJWT }, loggingMD);

  // post the passed in JWT to the Privacy Broker, wait for return and pass back to caller in the POST reponse
  //
  requestWrapper.postJWT(postProps, function (err, response, returnJWT) {
    return callback(err, response, returnJWT);
  });
};

module.exports = {
  callbacks: callbacks,
  promises: promises,
  utils: utils
};
