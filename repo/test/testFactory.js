/*jslint node: true, vars: true */

//
// Test the memory repo
//
//
var assert = require('assert'),
    should = require('should'),
    CONFIG_OPTIONS = require('../lib/factory').CONFIG_OPTIONS,
    repoFactory = require('../lib/factory'),
    util = require('util');

describe('Factory Tests', function () {
  'use strict';

  it('1.1 should support create a memory repo', function (done) {
    var props = {
      DB_TYPE: CONFIG_OPTIONS.DB_TYPE_MEMORY
    },
    serviceCtx = {
      logger: {
        logJSON: function () {}
      }
    };

    repoFactory.createRepo(serviceCtx, props, function (err, repo) {
      assert(!err, util.format('unexpected error: %j', err));
      assert(repo, 'no repo created');
      done();
    });
  });

});
