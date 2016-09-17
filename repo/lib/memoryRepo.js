/*jslint node: true, vars: true */

const assert = require('assert');
const util = require('util');
const _ServiceType = 'node-utils/memoryRepo';
const loggingMD = { ServiceType: _ServiceType, FileName: 'factory.js' };
const _ = require('underscore');

var collectionId = 0; // as an in-memory repo ok to reset if stop/start

//
// The memory repo supports the creation of collections identified by name.
//
// Each collection is a map of <key, value> and supports access by key, or a
// query that uses a function to scan over the values.
//
// Typically the key is the @id, and the value is a JSON-LD node, but can be
// anything
//
function MemoryRepo() {
  'use strict';

  var collections = {}, repo = {};

  // assign the collection of collections a unique id so can debug easier
  collections.id = '_:' + '_collection_id_' + collectionId;
  collectionId = collectionId + 1;

  repo = {

    // nothing to do for a memory repo
    configure: function configureRepo(serviceCtx, props, callback) {
      assert(serviceCtx, util.format('configure needs a serviceCtx'));
      assert(props, util.format('configure needs a props'));
      assert(callback, util.format('configure needs a callback'));
      callback(null);
    },

    // find the collection by its name - the client decides the name for example METADATA
    getCollection: function (serviceCtx, name) {
      assert(serviceCtx, util.format('getCollection needs a serviceCtx'));
      assert(name, util.format('getCollection needs a name:%s', name));

      let result = collections[name];
      if (!result) {
        let keys = _.keys(collections);
        assert.fail(util.format('MemoryRepo-cannotFindCollection:%s - collections:%s - collectionNames:%j - collections:%j',
                name, (keys.length - 1), keys, collections));
      }

      return result;
    },

    // create the collection for the specified props.name
    // *props - describes collection
    //  **name the collection name
    // @callback(err. created)
    createCollection: function createCollection(serviceCtx, props, callback) {
      assert(serviceCtx, util.format('createCollection needs a serviceCtx'));
      assert(props.name, util.format('cannot create collection with props.name undefined, props is: %j', props));

      let created = false, col = collections[props.name];
      if (!col) {
        // A new collection so add to the collections and initialize to empty map
        collections[props.name] = new Map();
        created = true;
      }

      serviceCtx.logger.logJSON('info', { serviceType: _ServiceType, action: 'Repo-Memory-Created-Collection',
                    name: props.name, createdNew: created, collections: collections }, loggingMD);
      callback(null, created);
    },

    // insert the data into the named collection
    //
    // *data - the data to add into the collection of the form {key: <the key>, value: <the value to add> }
    //          - can be an array of entries or a singleton
    // *props - describes collection
    //  **name the collection name
    // *callback
    //   **err
    //   **data - data that was passed in
    insertIntoCollection: function insertIntoCollection(serviceCtx, props, data, callback) {
      assert(serviceCtx, util.format('insertIntoCollection needs a serviceCtx'));
      assert(props.name, util.format('insertIntoCollection needs a prop.name, props is: %j', props));

      let col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('insertIntoCollection could not find collection? props:%j', props));

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          assert(data[i].key, util.format('insertIntoCollection no key passed in:%j', data[i]));
          assert(data[i].value, util.format('insertIntoCollection no value passed in:%j', data[i]));
          col.set(data[i].key, data[i].value);
        }

        return callback(null, data);
      } else {
        assert(data.key, util.format('insertIntoCollection no key passed in:%j', data));
        assert(data.value, util.format('insertIntoCollection no value passed in:%j', data));
        col.set(data.key, data.value);
        return callback(null, [data]); // always return a collection
      }
    },

    // update a document in the collection as identfied by the query which for now is just @id
    // *data an array of items to add
    // *props - describes collection
    //  **name the collection name
    // *callback
    //  **err
    //  **rows updated
    //
    /* REMOVE UNTIL NEED updateItemInCollection: function updateItemInCollection(serviceCtx, props, query, updateItem, callback) {
      var updatedCount = 0, col, i;

      assert(serviceCtx, util.format('updateItemInCollection needs a serviceCtx'));
      assert(props.name, util.format('updateItemInCollection needs a prop.name, props is: %j', props));
      assert(query['@id'], util.format('updateItemInCollection query needs an @id to search for %j', props));
      assert(!util.isArray(updateItem), util.format('updateItem must be an object: %j', updateItem));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('update could not find collection? props:%j', props));

      if (updateItem.length === 0) {
        // nothing to do
        return callback(null, []);
      }

      // iterate over the collection looking for a match and if so replace
      for (i = 0; i < col.length; i++) {
        if (col[i]['@id']) {
          if (col[i]['@id'] === query['@id']) {
            updatedCount = updatedCount + 1;
            col[i] = updateItem;
          }
        }
      }

      return callback(null, updatedCount);
    }, */

    // remove all documents from a collection
    // *props - describes collection
    //  **name the collection name
    // *callback
    //  **err
    //  **count - number removed
    removeAllFromCollection: function removeAllFromCollection(serviceCtx, props, callback) {
      var count, col;

      assert(serviceCtx, util.format('removeAllFromCollection needs a serviceCtx'));
      assert(props.name, util.format('removeAllFromCollection cannot remove from collection with props.name undefined, props is: %j', props));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('removeAllFromCollection could not find collection? props:%j', props));

      // just replace with empty array
      count = collections[props.name].length;
      collections[props.name] = new Map();

      callback(null, count);
    },

    // Query for data within a collection by @id
    // *props - describes collection
    //  **name the collection name
    //  **query - optional - the restriction to apply, for now only support @id
    // *callback
    //  *err
    //  *results collection
    queryCollection: function queryCollection(serviceCtx, props, callback) {
      assert(serviceCtx, util.format('queryCollection needs a serviceCtx'));
      assert(props.name, util.format('queryCollection with props.name undefined, props is: %j', props));
      assert(!props.query, util.format('queryCollection passed props.query do not use pass props.key: %j', props));

      let col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('queryCollection could not find collection? props:%j', props));

      if (props.key) {
        let result = col.get(props.key);
        if (!result) {
          return callback(null, []);
        } else {
          return callback(null, [result]); // always return a collection
        }
      } else {
        // return all the values
        let results = [];
        col.forEach(function (value) {
          results.push(value);
        });

        return callback(null, results);
      }
    },

    // query for items within a collection, use a passed in function to determine if valid
    // *props - describes collection
    // *compareFunc - the comparison function returns true if match
    //  **name the collection name
    // *callback
    //  *err
    //  *results collection
    queryCollectionByFunc: function queryCollectionByFunc(serviceCtx, props, compareFunc, callback) {
      assert(serviceCtx, util.format('queryCollection needs a serviceCtx'));
      assert(props.name, util.format('queryCollection with props.name undefined, props is: %j', props));

      let results = [], col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('queryCollection could not find collection? props:%j', props));

      col.forEach(function (value) {
        if (compareFunc(value)) {
          results.push(value);
        }
      });

      return callback(null, results);
    },

    //
    // Return the size of the specified collection
    // *serviceCtx
    // *props.name - collection name
    // *callback
    //  *err
    //  *results collection
    sizeOfCollection: function sizeOfCollection(serviceCtx, props, callback) {
      assert(serviceCtx, util.format('sizeOfCollection needs a serviceCtx'));
      assert(props.name, util.format('sizeOfCollection with props.name undefined, props is: %j', props));

      var col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('sizeOfCollection could not find collection? props:%j', props));

      return callback(null, col.size);

    }
  }; // repo

  //
  // Add promise versions of the repo operations
  repo.promises = {
    createCollection: function (serviceCtx, props) {
      return new Promise(function (resolve, reject) {
        repo.createCollection(serviceCtx, props, function (err, created) {
          if (!err) {
            return resolve(created);
          } else {
            return reject(err);
          }
        });
      });
    },

    insertIntoCollection: function (serviceCtx, props, data) {
      return new Promise(function (resolve, reject) {
        repo.insertIntoCollection(serviceCtx, props, data, function (err, retData) {
          if (!err) {
            return resolve(retData);
          } else {
            return reject(err);
          }
        });
      });
    },

    queryCollection: function (serviceCtx, props) {
      return new Promise(function (resolve, reject) {
        repo.queryCollection(serviceCtx, props, function (err, retData) {
          if (!err) {
            return resolve(retData);
          } else {
            return reject(err);
          }
        });
      });
    },

    sizeOfCollection: function (serviceCtx, props) {
      return new Promise(function (resolve, reject) {
        repo.sizeOfCollection(serviceCtx, props, function (err, size) {
          if (!err) {
            return resolve(size);
          } else {
            return reject(err);
          }
        });
      });
    }
  };

  return repo;
}

module.exports = {
  create: function () {
    'use strict';
    return new MemoryRepo();
  }
};
