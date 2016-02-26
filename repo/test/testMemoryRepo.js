/*jslint node: true, vars: true */

//
// Test the memory repo
//
//
var assert = require('assert'),
    should = require('should'),
    memoryRepo = require('../lib/memoryRepo'),
    util = require('util');

describe('Memory Repo tests', function () {
  'use strict';

  var data, data2,
      serviceCtx = {
        logger: {
          logJSON: function () {}
        }
      };

  data = {};
  data['@id'] = '_:id1';
  data2 = {};
  data2['@id'] = '_:id2';

  function createNewRepo(callback) {
    var repo = memoryRepo.create();
    assert(repo, 'No repo created');
    repo.configure(serviceCtx, {}, function (err) {
      assert(!err, util.format('unexpected err:%j', err));
      callback(repo);
    });
  }

  it('1.1 should support create and configure repo', function (done) {
    createNewRepo(function (repo) {
      assert(repo, 'no repo created?');
      done();
    });
  });

  describe('2 create collection tests with callbacks', function () {

    var repo;

    before(function (done) {
      createNewRepo(function (r) {
        repo = r;
        done();
      });
    });

    it('2.1 should support create collection, insert into it and fetch from it', function (done) {

      var props = {
        name: 'test.com/http://id.webshield.io/com/test/datamodel_1'
      };

      repo.createCollection(serviceCtx, props, function (err, created) {
        assert(!err, util.format('unexpected err'));
        assert(created, 'expected created to be true');

        // ensure empty
        repo.queryCollection(serviceCtx, props, function (err, results) {
          assert(!err, util.format('unexpected err'));
          assert((results.length === 0), util.format('expected results to be zero got: %j', results));

          // add an item to the collection
          repo.insertIntoCollection(serviceCtx, props, [data], function (err, rowsInserted) {
            assert(!err, util.format('unexpected err'));
            rowsInserted.length.should.be.equal(1);

            // query and make sure data now there
            repo.queryCollection(serviceCtx, props, function (err, results) {
              assert(!err, util.format('unexpected err'));
              assert((results.length === 1), util.format('expected results to be 2 got: %j', results));

              // add one more and check
              repo.insertIntoCollection(serviceCtx, props, [data2], function (err, rowsInserted) {
                assert(!err, util.format('unexpected err'));
                rowsInserted.length.should.be.equal(1);

                // query and make sure data now 2 rows
                repo.queryCollection(serviceCtx, props, function (err, results) {
                  assert(!err, util.format('unexpected err'));
                  assert((results.length === 2), util.format('expected results to be zero got: %j', results));

                  // query by id
                  props.query = { '@id': data2['@id'] };
                  repo.queryCollection(serviceCtx, props, function (err, results) {
                    var compareFunc;
                    assert(!err, util.format('unexpected err'));
                    assert((results.length === 1), util.format('expected results to be 1 got: %j', results));
                    assert(results[0]['@id'] === data2['@id'], util.format('expected results to be data2 got: %j', results));

                    // query by function
                    props.query = null;
                    compareFunc = function (row) {
                      if (row['@id'] === data2['@id']) {
                        return true;
                      } else {
                        return false;
                      }
                    };

                    repo.queryCollectionByFunc(serviceCtx, props, compareFunc, function (err, results) {
                      assert(!err, util.format('unexpected err'));
                      assert((results.length === 1), util.format('expected results to be 1 got: %j', results));
                      assert(results[0]['@id'] === data2['@id'], util.format('expected results to be data2 got: %j', results));
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    }); // 2.1
  }); // describe 2

  describe('3 create collection tests with Promises', function () {

    var repo;

    before(function (done) {
      createNewRepo(function (r) {
        repo = r;
        done();
      });
    });

    it('3.1 should support create collection, insert into it and fetch from it', function () {

      var props = {
        name: 'test.com/http://id.webshield.io/com/test/datamodel_1'
      };

      return repo.promises.createCollection(serviceCtx, props)
        .then(
          function (created) {
            assert(created, 'repo was not created');
          }
        );
    }); // 3.1
  }); // describe 2
});
