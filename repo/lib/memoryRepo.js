/*jslint node: true, vars: true */

var assert = require('assert'),
    collectionId = 0,
    util = require('util'),
    _ServiceType = 'node-utils/memoryRepo',
    loggingMD = {
        ServiceType: _ServiceType,
        FileName: 'factory.js' },
    _ = require('underscore');

//
// Create a memory repo -  basically a map of collections where the key is client supplied for example
// domain.datamodel
//
function MemoryRepo() {
  'use strict';

  var collections = {};

  // assign the collection of collections a unique id so can debug easier
  collections.id = '_:' + '_collection_id_' + collectionId;
  collectionId = collectionId + 1;

  return {

    // nothing to do for a memory repo
    // callback
    //  *err
    configure: function configureRepo(serviceCtx, props, callback) {
      assert(serviceCtx, util.format('configure needs a serviceCtx'));
      assert(props, util.format('configure needs a props'));
      assert(callback, util.format('configure needs a callback'));
      callback(null);
    },

    // find the collection by its name - the client decides the name for example domain.datamodel
    getCollection: function (serviceCtx, name) {
      var result, keys;
      assert(serviceCtx, util.format('getCollection needs a serviceCtx'));
      assert(name, util.format('getCollection needs a name:%s', name));

      result = collections[name];
      if (!result) {
        keys = _.keys(collections);
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
      var created = false, col;

      assert(serviceCtx, util.format('createCollection needs a serviceCtx'));
      assert(props.name, util.format('cannot create collection with props.name undefined, props is: %j', props));

      // if collection already exists then this is a nop otherwise initalize to empty array
      col = collections[props.name];
      if (!col) {
        collections[props.name] = [];
        created = true;
      }

      serviceCtx.logger.logJSON('info', { serviceType: _ServiceType, action: 'Repo-Memory-Created-Collection',
                    name: props.name, createdNew: created, collections: collections }, loggingMD);
      callback(null, created);
    },

    // insert the jsonld data into the named collection
    // update
    //
    // *data an array of items to add
    // *props - describes collection
    //  **name the collection name
    // *callback
    //   **err
    //   **rows inserted
    insertIntoCollection: function insertIntoCollection(serviceCtx, props, data, callback) {
      var col, i;
      assert(serviceCtx, util.format('insertIntoCollection needs a serviceCtx'));
      assert(props.name, util.format('insertIntoCollection needs a prop.name, props is: %j', props));
      assert(util.isArray(data), util.format('data must be an array: %j', data));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('insertIntoCollection could not find collection? props:%j', props));

      if (data.length === 0) {
        return callback(null, []);
      } else {
        for (i = 0; i < data.length; i++) {
          col.push(data[i]);
        }

        return callback(null, data);
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
    updateItemInCollection: function updateItemInCollection(serviceCtx, props, query, updateItem, callback) {
      var updatedCount = 0, col, i;

      assert(serviceCtx, util.format('update needs a serviceCtx'));
      assert(props.name, util.format('update needs a prop.name, props is: %j', props));
      assert(query['@id'], util.format('update query needs an @id to search for %j', props));
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
    },

    // remove all documents from a collection
    // *props - describes collection
    //  **name the collection name
    // *callback
    //  **err
    //  **count - number removed
    removeAllFromCollection: function removeAllFromCollection(serviceCtx, props, callback) {
      var count, col;

      assert(serviceCtx, util.format('update needs a serviceCtx'));
      assert(props.name, util.format('cannot remove from collection with props.name undefined, props is: %j', props));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('removeAllFromCollection could not find collection? props:%j', props));

      // just replace with empty array
      count = collections[props.name].length;
      collections[props.name] = [];

      callback(null, count);
    },

    // Query for data within a collection
    // *props - describes collection
    //  **name the collection name
    //  **query - optional - the restriction to apply, for now only support @id
    // *callback
    //  *err
    //  *results collection
    queryCollection: function queryCollection(serviceCtx, props, callback) {
      // create a new array and copy items
      var results = [], i, col, query = null;

      assert(serviceCtx, util.format('queryCollection needs a serviceCtx'));
      assert(props.name, util.format('queryCollection with props.name undefined, props is: %j', props));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('queryCollection could not find collection? props:%j', props));

      query = props.query;
      for (i = 0; i < col.length; i++) {
        if (!query) {
          // return whole collection
          results.push(col[i]);
        } else {
          if (col[i]['@id']) {
            if (col[i]['@id'] === query['@id']) {
              results.push(col[i]);
            }
          }
        }
      }

      return callback(null, results);
    },

    // query for items within a collection, use a passed in function to determine if valid
    // *props - describes collection
    // *compareFunc - the comparison function returns true if match
    //  **name the collection name
    // *callback
    //  *err
    //  *results collection
    queryCollectionByFunc: function queryCollectionByFunc(serviceCtx, props, compareFunc, callback) {
      // create a new array and copy items
      var col, results = [], i;

      assert(serviceCtx, util.format('queryCollection needs a serviceCtx'));
      assert(props.name, util.format('queryCollection with props.name undefined, props is: %j', props));

      col = this.getCollection(serviceCtx, props.name);
      assert(col, util.format('queryCollection could not find collection? props:%j', props));

      for (i = 0; i < col.length; i++) {
        if (compareFunc(col[i])) {
          results.push(col[i]);
        }
      }

      return callback(null, results);
    }
  };
}

module.exports = {
  create: function () {
    'use strict';
    return new MemoryRepo();
  }
};
