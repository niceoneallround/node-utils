/*jslint node: true, vars: true */

var assert = require('assert'),
    CONFIG_OPTIONS,
    util = require('util'),
    loggingMD = {
        ServiceType: 'node-utils/repo',
        FileName: 'factory.js' },
    memoryRepoFactory = require('./memoryRepo');

CONFIG_OPTIONS = {
  DB_TYPE_MEMORY: 'memory'
};

//
// create a repo based on the passed in configuration, once created pass to callback
//
// Configuration parameters are
//  DB_TYPE
//
// Parameters are
// *serviceCtx - used to access service level functionalities
// *cfg - repo config parameters
// *callback
//    **err
//    **repo
function createRepo(serviceCtx, cfg, callback) {
  'use strict';

  var repo = null;
  assert(serviceCtx, util.format('createRepo needs a serviceCtx'));
  assert(cfg, util.format('createRepo needs a cfg'));
  assert(callback, util.format('createRepo needs a callback'));

  serviceCtx.logger.logJSON('info', { serviceType: serviceCtx.serviceName, action: 'Creating-New-Repo',
                                                          metadata: cfg }, loggingMD);

  // if no DB type then default to memory database
  if (!cfg.DB_TYPE) {
    // if not specified default to memory that does not user dn name or connect URL
    cfg.DB_TYPE = CONFIG_OPTIONS.DB_TYPE_MEMORY;
    serviceCtx.logger.logJSON('info', { serviceType: serviceCtx.serviceName,
                    action: 'Create-New-Repo-No-DB_TYPE-specified-default-to-Memory' }, loggingMD);
  }

  if (cfg.DB_TYPE === CONFIG_OPTIONS.DB_TYPE_MEMORY) {
    // setup memory repo
    serviceCtx.logger.logJSON('info', { serviceType: serviceCtx.serviceName, action: 'Create-New-Repo-Memory',
                  metadata: cfg }, loggingMD);

    repo = memoryRepoFactory.create();
    repo.configure(serviceCtx, cfg, function (err) {
      return callback(err, repo);
    }); // configure
  } else {
    assert.fail(util.format('cfg.DB_TYPE is unknown or not set: %j', cfg));
  }
}

module.exports = {
  CONFIG_OPTIONS: CONFIG_OPTIONS,
  createRepo: createRepo
};
