/*jslint node: true, vars: true */

//
// Utilities to help testing
//
var assert = require('assert'),
    configFactory = require('../../serverConfig/lib/serverConfig'),
    should = require('should'),
    util = require('util');

function getTestServiceConfig(props) {
  'use strict';
  var overrides, config;

  overrides = {};
  overrides.MODE = 'DEV';
  overrides.HOSTNAME = 'localhost';

  if ((props) && (props.port)) {
    overrides.PORT = props.port;
    overrides.PORT_INSIDE_DOCKER = props.port;
  } else {
    overrides.PORT = 'not_passed_into_config_create';
    overrides.PORT_INSIDE_DOCKER = overrides.PORT;
  }

  if ((props) && (props.METADATA_SERVICE_URL)) {
    overrides.METADATA_SERVICE_URL = props.METADATA_SERVICE_URL;
  }

  // the JWT usage requires a secret so set one up here that is used across all tests, it
  // can be set by the env JWT_SECRET hence name here
  overrides.crypto = {};
  overrides.crypto.jwt = {};
  overrides.crypto.jwt.JWT_SECRET = 'bogusSecret';

  config = configFactory.create(overrides);
  return config;
}

//
// callback(ctx)
function createDummyServiceCtx(props, callback) {
  'use strict';

  var ctx = {};
  assert(callback, 'no callback param');
  assert(props, 'props param missing');
  assert(props.name, util.format('props.name missing:%j', props));

  ctx.name = props.name;
  ctx.logger = {
    logJSON: function (part1, part2, part3) { // write out
      console.log('dummyServiceContext dummmy logging', part1, part2, part3);
      return 1;
    }
  };

  return callback(ctx);
}

module.exports = {
  createDummyServiceCtx: createDummyServiceCtx,
  getTestServiceConfig: getTestServiceConfig
};
