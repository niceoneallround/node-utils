/*jslint node: true, vars: true */

//
// Utilities to help testing
//
const assert = require('assert');
const configFactory = require('../../serverConfig/lib/serverConfig');
const should = require('should');
const util = require('util');

function getTestServiceConfig(props) {
  'use strict';

  let overrides = {};
  overrides.MODE = 'DEV';
  overrides.HOSTNAME = 'localhost';

  //
  // FIXME bogus should just get all the keys and move across
  // avoids many errors

  if ((props) && (props.port)) {
    overrides.PORT = props.port;
    overrides.PORT_INSIDE_DOCKER = props.port;
  } else {
    overrides.PORT = 'not_passed_into_config_create';
    overrides.PORT_INSIDE_DOCKER = overrides.PORT;
  }

  if ((props) && (props.API_GATEWAY_URL)) {
    overrides.API_GATEWAY_URL = props.API_GATEWAY_URL;
  }

  if ((props) && (props.DOMAIN_NAME)) {
    overrides.DOMAIN_NAME = props.DOMAIN_NAME;
  }

  if ((props) && (props.METADATA_SERVICE_URL)) {
    overrides.METADATA_SERVICE_URL = props.METADATA_SERVICE_URL;
  }

  if ((props) && (props.IDENTITY_SYNDICATE_URL)) {
    overrides.IDENTITY_SYNDICATE_URL = props.IDENTITY_SYNDICATE_URL;
  }

  if ((props) && (props.PRIVACY_BROKER_URL)) {
    overrides.PRIVACY_BROKER_URL = props.PRIVACY_BROKER_URL;
  }

  if ((props) && (props.PRIVACY_NODE_URL)) {
    overrides.PRIVACY_NODE_URL = props.PRIVACY_NODE_URL;
  }

  if ((props) && (props.REFERENCE_SOURCE_PROXY_URL)) {
    overrides.REFERENCE_SOURCE_PROXY_URL = props.REFERENCE_SOURCE_PROXY_URL;
  }

  if ((props) && (props.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL)) {
    overrides.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL = props.REFERENCE_SOURCE_POST_SUBJECT_QUERY_URL;
  }

  if ((props) && (props.REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL)) {
    overrides.REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL = props.REFERENCE_SOURCE_POST_BACK_QUERY_RESULTS_URL;
  }

  // the JWT usage requires a secret so set one up here that is used across all tests, it
  // can be set by the env JWT_SECRET hence name here
  overrides.crypto = {};
  overrides.crypto.jwt = {};
  overrides.crypto.jwt.JWT_SECRET = 'bogusSecret';

  let config = configFactory.create(overrides);
  return config;
}

//
// callback(ctx)
function createDummyServiceCtx(props, callback) {
  'use strict';
  assert(props, 'props param missing');
  assert(props.name, util.format('props.name missing:%j', props));

  let ctx = {};
  ctx.name = props.name;
  ctx.logger = {
    logJSON: function (part1, part2, part3) { // write out
      console.log('dummyServiceContext dummmy logging', part1, part2, part3);
      return 1;
    },

    logProgress: function (msg) {
      console.log('**********');
      console.log('****** dummy progress:%s', msg);
      console.log('**********');
    }
  };

  // add stats block
  ctx.stats = {};

  // some code wants a callback others do not so support
  if (callback) {
    return callback(ctx);
  } else {
    return ctx;
  }
}

function createDummyResponseObject() {
  'use strict';
  let rsp = {};
  rsp.headers = {};
  rsp.setHeader = function (key, value) {
    rsp.headers[key] = value;
  };

  return rsp;
}

function createDummyRequestObject() {
  'use strict';
  let req = {};
  req.headers = {};
  req.setHeader = function (key, value) {
    req.headers[key] = value;
  };

  return req;
}

module.exports = {
  createDummyRequestObject: createDummyRequestObject,
  createDummyResponseObject: createDummyResponseObject,
  createDummyServiceCtx: createDummyServiceCtx,
  getTestServiceConfig: getTestServiceConfig,
};
