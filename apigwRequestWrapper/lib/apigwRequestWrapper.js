/*jslint node: true, vars: true */

//
//
// Provides convenience promises and callbacks to access functionaility either
// via the AWS API GATEWAY or the Internal API GATEWAY.
//
// Provides the following
//  - Domains - FETCH, POST
//  - Metadata - FETCH, POST
//  - Privacy Pipe - POST
//  - IS Jobs - FETCH; Poll jobs until either all are complete or exceed poll count, once complete returns fetched JOBS
//
// Domain ID as part of the path
// - Due to problems with the AWS GATEWAY and passing the id parameter in the path i ended up creating
//   an interface that did not need. FIXME see bug in repo as think probably way to go and use a header token
//
//
// Authenticaiton
// - For AWS the following envs can be used
//   - API_GATEWAY_API_KEY
//   - API_GATEWAY_API_KEY_NAME
//

const assert = require('assert');
const loggingMD = { fileName: 'apigwRequestWrapper.js' };
const requestWrapper = require('../../requestWrapper/lib/requestWrapper');
const util = require('util');
const APIGW_DOMAIN_PATH = '/v1/domains';
const APIGW_IS_JOB_PATH = '/is/jobs';  // prefixed by /v1/domains/:domainId
const APIGW_METADATA_PATH = '/metadata';
const AWSGW_APIGW_METADATA_PATH = '/v1/metadata';
const APIGW_PP_PATH = '/privacy_pipe';
const AWSGW_APIGW_PP_PATH = '/v1/privacy_pipe';

let callbacks = {};
let promises = {};
let utils = {};

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

  let getUrl = apigwUrl + utils.generateFetchDomainPathUrl(props.domainIdParam);
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

  let postUrl = apigwUrl + utils.generateCreateDomainPathUrl();
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

  if (!mdIdParam) {
    return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_METADATA_PATH;
  } else {
    return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_METADATA_PATH + '/' + mdIdParam;
  }
};

// THE AWSAPIGW DOES NOT PREFIX WITH DOMAIN
utils.generateAWSGWFetchMetadataPathUrl = function generateAWGWFetchMetadataPathUrl(mdIdParam) {
  'use strict';

  //
  // THIS DOES NOT USE THE DOMAIN
  //
  if (!mdIdParam) {
    return AWSGW_APIGW_METADATA_PATH;
  } else {
    return AWSGW_APIGW_METADATA_PATH + '/' + mdIdParam;
  }
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
// Fetch metadata and return result there is NO processing of the result
//
// props.domainIdParam - optiona as the AWS API GW does not use
// props.mdIdParam
//
callbacks.fetchMetadataJWT = function fetchMetadataJWT(props, apigwUrl, callback) {
  'use strict';
  assert(props, 'fetchDomain props param is missing');
  assert(apigwUrl, 'fetchDomain apigwUrl param is missing');

  let getUrl;

  if (!props.domainIdParam) { // THE AWS APIGW does not prefix with domain
    if (!props.mdIdParam) {
      getUrl = apigwUrl + utils.generateAWSGWFetchMetadataPathUrl();
    } else {
      getUrl = apigwUrl + utils.generateAWSGWFetchMetadataPathUrl(props.mdIdParam);
    }

  } else {
    if (!props.mdIdParam) {
      getUrl = apigwUrl + utils.generateFetchMetadataPathUrl(props.domainIdParam);
    } else {
      getUrl = apigwUrl + utils.generateFetchMetadataPathUrl(props.domainIdParam, props.mdIdParam);
    }
  }

  return callbacks.getJWT(props, getUrl, callback);
};

//
// expose the path as used in testing for nocks
//
utils.generatePostMetadataPathUrl = function generatePostMetadataPathUrl(domainIdParam) {
  'use strict';
  return APIGW_DOMAIN_PATH + '/' + domainIdParam + APIGW_METADATA_PATH;
};

utils.generateAWSGWPostMetadataPathUrl = function generateAWSGWPostMetadataPathUrl() {
  'use strict';

  //
  // THIS DOES NOT USE THE DOMAIN
  //
  return AWSGW_APIGW_METADATA_PATH;
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
// Format up the URL before calling more generic postJWT
//
callbacks.postMetadataJWT = function postMetadataJWT(props, apigwUrl, mdJWT, callback) {
  'use strict';
  assert(mdJWT, 'postMetadata mdJWT param is missing');
  assert(apigwUrl, 'postMetadata apigwUrl param is missing');

  let postUrl;
  if (!props.domainIdParam) {
    postUrl = apigwUrl + utils.generateAWSGWPostMetadataPathUrl();

  } else {
    postUrl = apigwUrl + utils.generatePostMetadataPathUrl(props.domainIdParam);
  }

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

utils.generateAWSGWCreatePipePathUrl = function generateAWSGWCreatePipePathUrl() {
  'use strict';
  return AWSGW_APIGW_PP_PATH;
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
// format up the URL before calling more generic POST JWT
//
callbacks.postCreatePrivacyPipeJWT = function postCreatePrivacyPipeJWT(props, apigwUrl, ppJWT, callback) {
  'use strict';
  assert(ppJWT, 'postCreatePrivacyPipe ppJWT param is missing');
  assert(apigwUrl, 'postCreatePrivacyPipe apigwUrl param is missing');

  let postUrl;

  if (!props.domainIdParam) {
    postUrl = apigwUrl + utils.generateAWSGWCreatePipePathUrl();
  } else {
    postUrl = apigwUrl + utils.generateCreatePipePathUrl(props.domainIdParam);
  }

  return callbacks.postJWT(props, postUrl, ppJWT, callback);
};

//--------------------------------------
// Get Identity Syndicate Syndication Jobs
//---------------------------------------

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

  let getUrl = apigwUrl + utils.generateGetIsJobPathUrl(props.domainIdParam, props.jobIdParam);

  return callbacks.getJWT(props, getUrl, callback);
};

//
// FIXME WORK ON FIXING Poll for all jobs to complete or the max number of polls to be reached
//
// maxRetries - the maximum number of times to poll
// wait - the amount of time to wait between polls
// printStatus - true if want to print a status report
// jwtOptions - parameters needed to decode the JWT - it does NOT verify
//
// Standard Ones needed by getIsJobs
//
callbacks.pollIsJobsComplete = function pollIsJobsComplete(props, apigwUrl, callback) {
  'use strict';

  waitForJobs(props, apigwUrl, false, 1, function (err, result) {
    return callback(err, result);
  });
};

function waitForJobs(props, apigwUrl, allJobsDone, waitCount, endedCB) {
  'use strict';

  if (allJobsDone) {
    console.log('All jobs done');
    return endedCB(null, 'theJobs');
  } else if (waitCount > props.maxRetries) {
    console.log('Waited Enough');
    return endedCB(null, 'Waited long enough-from wait');
  }

  setTimeout(function () {
    console.log('******* timer expired---');
    return promises.getIsJobJWT(props, apigwUrl)
      .then(function (rsp) {
        console.log(rsp.body);
        console.log('******* Calling Wait for Jobs again---%s', waitCount);
        return waitForJobs(props, apigwUrl, false, waitCount + 1, endedCB);
      })
      .catch(function (err) {
        console.log('ERROR - fetching jobs:', err);
      });
  }, props.wait);
}

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

  let getProps = { url: getUrl };

  //
  // Check to see if there is a need to add an API key for now do at this low level
  //
  let apiKey = process.env.API_GATEWAY_API_KEY;
  if (props.API_GATEWAY_API_KEY) {
    apiKey = props.API_GATEWAY_API_KEY; // allow env to be override by a props
  }

  let apiKeyName = process.env.API_GATEWAY_API_KEY_NAME;
  if (props.API_GATEWAY_API_KEY_NAME) {
    apiKeyName = props.API_GATEWAY_API_KEY_NAME; // allow env to be override by a props
  }

  if (apiKey) {
    getProps.headers = new Map();
    getProps.headers.set(apiKeyName, apiKey);

    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'GET-to-API-GATEWAY-FROM-apigwRequestWrapper-ADDED-API-KEY',
                      logId: props.loggerMsgId, url: getProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  }

  if (!props.domainIdParam) {
    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'GET-to-API-GATEWAY-FROM-apigwRequestWrapper-NO-DomainId',
                      logId: props.loggerMsgId, url: getProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  } else {
    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'GET-to-API-GATEWAY-FROM-apigwRequestWrapper',
                      domainIdParam: props.domainIdParam,
                      logId: props.loggerMsgId, url: getProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  }

  requestWrapper.getJWT(getProps, function (err, response, returnJWT) {
    return callback(err, response, returnJWT);
  });
};

//
// A promise wrapper around post JWT
// NOTE CONVERTED TO USE a serviceCtx as was as mistake not to use in the
// beginning
promises.postJWT  = function postJWT(serviceCtx, msgId, postURL, sendJWT) {
  'use strict';
  assert(serviceCtx, 'serviceCtx param is missing');
  assert(msgId, 'msgId param is missing');
  assert(postURL, 'postURL param is missing');
  assert(sendJWT, 'sendJWT param is missing');

  let props = {
    logger: serviceCtx.logger,
    logMsgServiceName: serviceCtx.serviceName,
    loggerMsgId: msgId,
  };

  return new Promise(function (resolve, reject) {
    callbacks.postJWT(props, postURL, sendJWT, function (err, rsp) {
      if (err) {
        reject(err);
      } else {
        resolve(rsp);
      }
    });
  });
};

//
// Post the JWT to any URL that it assumes that is the API GATEWAY so adds
// the necessary API_GATEWAY_API_KEY if it exists
//
//
callbacks.postJWT = function postJWT(props, postUrl, sendJWT, callback) {
  'use strict';

  assert(props.logger, util.format('props.logger is missing:%j', props));
  assert(props.loggerMsgId, util.format('props.loggerMsgId is missing - used to track:%j', props));
  assert(props.logMsgServiceName, util.format('props.logMsgServiceName is mising:%j', props));

  let postProps = {};
  postProps.jwt = sendJWT;
  postProps.url = postUrl;

  //
  // Check to see if there is a need to add an API key for now do at this low level
  //
  let apiKey = process.env.API_GATEWAY_API_KEY;
  if (props.API_GATEWAY_API_KEY) {
    apiKey = props.API_GATEWAY_API_KEY; // allow env to be override by a props
  }

  let apiKeyName = process.env.API_GATEWAY_API_KEY_NAME;
  if (props.API_GATEWAY_API_KEY_NAME) {
    apiKeyName = props.API_GATEWAY_API_KEY_NAME; // allow env to be override by a props
  }

  if (apiKey) {
    postProps.headers = new Map();
    postProps.headers.set(apiKeyName, apiKey);

    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-API-GATEWAY-FROM-apigwRequestWrapper-ADDED-API-KEY',
                      logId: props.loggerMsgId, url: postProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  }

  if (!props.domainIdParam) {
    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-API-GATEWAY-FROM-apigwRequestWrapper-NO-DomainId',
                    logId: props.loggerMsgId, url: postProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  } else {
    props.logger.logJSON('info', { serviceType: props.logMsgServiceName, action: 'POST-to-API-GATEWAY-FROM-apigwRequestWrapper',
                    domainIdParam: props.domainIdParam,
                    logId: props.loggerMsgId, url: postProps.url, keyName: apiKeyName, key: apiKey }, loggingMD);
  }

  requestWrapper.postJWT(postProps, function (err, response, resultJWT) {
    return callback(err, response, resultJWT);
  });
};

module.exports = {
  callbacks: callbacks,
  promises: promises,
  utils: utils
};
