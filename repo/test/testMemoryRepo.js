/*jslint node: true, vars: true */

//
// Test the memory repo
//
//
const assert = require('assert');
const should = require('should');
const memoryRepo = require('../lib/memoryRepo');
const util = require('util');

describe('Memory Repo tests', function () {
  'use strict';

  var data, data2,
      serviceCtx = {
        logger: {
          logJSON: function () {}
        }
      };

  data = { '@id': 'id1', bogus: 'some data' };
  data2 = { '@id': 'id2', bogus: 'some data 2' };

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

      let props = {
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
          repo.insertIntoCollection(serviceCtx, props, { key: data['@id'], value: data }, function (err, rowsInserted) {
            assert(!err, util.format('unexpected err'));
            rowsInserted.length.should.be.equal(1);
            rowsInserted[0].should.have.property('key', data['@id']);

            // query and make sure data now there
            props.key = data['@id'];
            repo.queryCollection(serviceCtx, props, function (err, results) {
              assert(!err, util.format('unexpected err'));
              assert((results.length === 1), util.format('expected results to be 1 got: %j', results));

              // add one more and check
              repo.insertIntoCollection(serviceCtx, props, [{ key: data2['@id'], value: data2 }], function (err, rowsInserted) {
                assert(!err, util.format('unexpected err'));
                rowsInserted.length.should.be.equal(1);

                // query and make sure data now 2 rows
                props.key = null;
                repo.queryCollection(serviceCtx, props, function (err, results) {
                  assert(!err, util.format('unexpected err'));
                  assert((results.length === 2), util.format('expected results to be zero got: %j', results));

                  // query by id
                  props.key = data2['@id'];
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

    it('2.2 test that size function works', function (done) {

      var props = {
        name: 'test.com/http://id.webshield.io/com/test/datamodel22_size'
      };

      repo.createCollection(serviceCtx, props, function (err, created) {
        assert(!err, util.format('unexpected err'));
        assert(created, 'expected created to be true');

        // add an item to the collection
        repo.insertIntoCollection(serviceCtx, props, { key: data['@id'], value: data }, function (err, rowsInserted) {
          assert(!err, util.format('unexpected err'));
          rowsInserted.length.should.be.equal(1);

          // check size
          repo.sizeOfCollection(serviceCtx, props, function (err, size) {
            assert(!err, util.format('unexpected err'));
            assert((size === 1), util.format('expected colleciton size of 1 got :%s', size));
            done();
          });
        });
      });
    }); // 2.2

    it('2.3 should return an empty set if cannot find by key', function (done) {

      var props = {
        name: 'test.com/http://id.webshield.io/com/test/23'
      };

      repo.createCollection(serviceCtx, props, function (err, created) {
        assert(!err, util.format('unexpected err'));
        assert(created, 'expected created to be true');

        props.key = 'http://not_found';
        repo.queryCollection(serviceCtx, props, function (err, results) {
          assert(!err, util.format('unexpected err'));
          assert((results.length === 0), util.format('expected results to be zero got: %j', results));
          done();
        });
      });
    }); // 2.2
  }); // describe 2

  describe('3 create collection tests with Promises', function () {

    var repo;

    before(function (done) {
      createNewRepo(function (r) {
        repo = r;
        done();
      });
    });

    it('3.1 should support create collection and check size', function () {

      var props = {
        name: 'test.com/http://id.webshield.io/com/test/datamodel31'
      };

      return repo.promises.createCollection(serviceCtx, props)
        .then(//result of create 3 #1
          function (created) {
            assert(created, 'repo was not created');

            // check collection size
            return repo.promises.sizeOfCollection(serviceCtx, props)
        .then(//result of sizeOf #2
            function (size) {
              assert((size === 0), util.format('expected size to be zero got:%s', size));

              return repo.promises.insertIntoCollection(serviceCtx, props, { key: data['@id'], value: data })
        .then(//result of insert #3
            function (insertedData) {
                assert((insertedData.length === 1), util.format('expected one row back after insert got:%j', insertedData));
              }); // #3
            }); // #2
          }); // #1
    }); // 3.1
  }); // describe 2
});
