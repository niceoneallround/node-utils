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
    APIGW_IS_JOB_PATH = '/is/jobs',  // prefixed by /v1/domains/:domainId
    APIGW_METADATA_PATH = '/metadata', // '/v1/domains/' + domainIdParam + '/metadata';
    APIGW_PP_PATH = '/privacy_pipe';

//------------------------
// Domain requests
//------------------------

//
// expose the path as used in testing for nocks
//
utils.generateFetchDomainPathUrl = function generateFetchDomainPathUrl(domainIdParam) {
  'use strict';
  return APIGW_DOMAIN_PATH + '/' + domainIdParam;
};

//
// Fetch a domain using the domain id param
// props.domainIdParam
//
callbacks.fetchDomainJWT = function fetchDomainJWT(props, apigwUrl, callback) {
  'use strict';
  assert(props, 'fetchDomain props param is missing');
  assert(apigwUrl, 'fetchDomain apigwUrl param is missing');
  assert(props.domainIdParam, util.format('props.domainIdParam is missing: %j', props));

  var getUrl = apigwUrl + utils.generateFetchDomainPathUrl(props.domainIdParam);
  return callbacks.getJWT(props, getUrl, callback);
};

// promise version of fetch just wraps callback
promises.fetchDomainJWT  = function fetchDomainJWT(props, apigwUrl) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.fetchDomainJWT(props, apigwUrl, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//
// create domain functions
//
utils.generateCreateDomainPathUrl = function generateCreateDomainPathUrl() {
  'use strict';
  return APIGW_DOMAIN_PATH;
};

//
// Create a domain
// props.domainJWT
//
callbacks.createDomainJWT = function createDomainJWT(props, apigwUrl, domainJWT, callback) {
  'use strict';
  assert(props, 'createDomain props param is missing');
  assert(apigwUrl, 'createDomain apigwUrl param is missing');
  assert(domainJWT, 'createDomain domainJWT param is missing');

  var postUrl = apigwUrl + utils.generateCreateDomainPathUrl();
  return callbacks.postJWT(props, postUrl, domainJWT, callback);
};

// promise version of create just wraps callback
promises.createDomainJWT  = function createDomainJWT(props, apigwUrl, domainJWT) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.createDomainJWT(props, apigwUrl, domainJWT, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//---------------------------
// Metadata Requests
//-------------------------

utils.generateFetchMetadataPathUrl = function generateFetchMetadataPathUrl(domainIdParam, mdIdParam) {
  'use strict';
  return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_METADATA_PATH + '/' + mdIdParam;
};

//
// Fetch metadata
// props.domainIdParam
// props.mdIdParam
//
callbacks.fetchMetadataJWT = function fetchMetadataJWT(props, apigwUrl, callback) {
  'use strict';
  assert(props, 'fetchDomain props param is missing');
  assert(apigwUrl, 'fetchDomain apigwUrl param is missing');
  assert(props.domainIdParam, util.format('props.domainIdParam is missing: %j', props));
  assert(props.mdIdParam, util.format('props.mdIdParam is missing: %j', props));

  var getUrl = apigwUrl + utils.generateFetchMetadataPathUrl(props.domainIdParam, props.mdIdParam);
  return callbacks.getJWT(props, getUrl, callback);
};

// promise version of fetch just wraps callback
promises.fetchMetadataJWT  = function fetchMetadataJWT(props, apigwUrl) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.fetchMetadataJWT(props, apigwUrl, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//
// expose the path as used in testing for nocks
//
utils.generatePostMetadataPathUrl = function generatePostMetadataPathUrl(domainIdParam) {
  'use strict';
  return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_METADATA_PATH;
};

//
// props.domainIdParam
//
promises.postMetadataJWT  = function postMetadataJWT(props, apigwUrl, mdJWT) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.postMetadataJWT(props, apigwUrl, mdJWT, function (err, rsp) {
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
callbacks.postMetadataJWT = function postMetadataJWT(props, apigwUrl, mdJWT, callback) {
  'use strict';
  assert(mdJWT, 'postMetadata mdJWT param is missing');
  assert(apigwUrl, 'postMetadata apigwUrl param is missing');
  assert(props.domainIdParam, util.format('props.domainIdParam is missing: %j', props));

  var postUrl = apigwUrl + utils.generatePostMetadataPathUrl(props.domainIdParam);

  return callbacks.postJWT(props, postUrl, mdJWT, callback);
};

//-------------------------------
// Privacy Pipe Requests
//------------------------------

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

//----------------------
// Get Identity Syndicate Syndication Jobs
//----------------------

//
// expose the path as used in testing for nocks
//
utils.generateGetIsJobPathUrl = function generateGetIsJobPathUrl(domainIdParam, jobIdParam) {
  'use strict';

  if (!jobIdParam) {
    return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_IS_JOB_PATH;
  } else {
    return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_IS_JOB_PATH + '/' + jobIdParam;
  }
};

promises.getIsJobJWT = function getIsJobJWT(props, apigwUrl) {
  'use strict';
  return new Promise(function (resolve, reject) {
    callbacks.getIsJobJWT(props, apigwUrl, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

callbacks.getIsJobJWT = function getIsJobJWT(props, apigwUrl, callback) {
  'use strict';
  assert(apigwUrl, 'getIsJobJWT apigwUrl param is missing');
  assert(props.domainIdParam, util.format('getIsJobJWT props.domainIdParam is missing: %j', props));

  var getUrl = apigwUrl + utils.generateGetIsJobPathUrl(props.domainIdParam, props.jobIdParam);

  return callbacks.getJWT(props, getUrl, callback);
};

//-----------------------------
// general
//----------------

// fetch the JWT using the passed in url
callbacks.getJWT = function getJWT(props, getUrl, callback) {
  'use strict';
  assert(getUrl, 'getUrl param missing');
  assert(props, 'props param missing');
  assert(callback, 'callback missing');

  assert(props.logger, util.format('props.logger is missing:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is missing - used to track:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  var getProps = { url: getUrl };

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'GET-to-API-GATEWAY',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: getProps.url }, loggingMD);

  requestWrapper.getJWT(getProps, function (err, response, returnJWT) {
    return callback(err, response, returnJWT);
  });
};

//
// Post JWT to the apigw and pass result to the callback
//
callbacks.postJWT = function postJWT(props, postUrl, sendJWT, callback) {
  'use strict';

  assert(props.logger, util.format('props.logger is missing:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is missing - used to track:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  var postProps = {};
  postProps.jwt = sendJWT;
  postProps.url = postUrl;

  props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-API-GATEWAY',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: postProps.url, jwt: sendJWT }, loggingMD);

  requestWrapper.postJWT(postProps, function (err, response, resultJWT) {
    return callback(err, response, resultJWT);
  });
};

module.exports = {
  callbacks: callbacks,
  promises: promises,
  utils: utils
};
