/**
 * localStorage can be a bit of a pain to work with since it stores everything as strings:
 * localStorage.setItem('item', 1);  //=> '1'
 * localStorage.setItem('item', false);  //=> 'false'
 * localStorage.setItem('item', [1,2,3]);  //=> '1,2,3'
 * localStorage.setItem('item', {a:'b'});  //=> '[object Object]'
 * localStorage.setItem('item', undefinedVariable);  //=> 'undefined'
 *
 * @fileoverview A simple wrapper for localStorage to make it easier to work with.
 * Based on store.js {@see https://github.com/marcuswestin/store.js}
 */
var kontra = (function(kontra, window, localStorage, undefined) {
  // check if the browser can use localStorage
  kontra.canUse = kontra.canUse || {};
  kontra.canUse.localStorage = 'localStorage' in window && window.localStorage !== null;

  if (!kontra.canUse.localStorage) {
    return kontra;
  }

  /**
   * Object for using localStorage.
   */
  kontra.store = {};

  /**
   * Save an item to localStorage.
   * @memberOf kontra
   *
   * @param {string} key - Name to store the item as.
   * @param {*} value - Item to store.
   */
  kontra.store.set = function setStoreItem(key, value) {
    if (value === undefined) {
      this.remove(key);
    }
    else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  /**
   * Retrieve an item from localStorage and convert it back to it's original type.
   * @memberOf kontra
   *
   * @param {string} key - Name of the item.
   *
   * @returns {*}
   */
  kontra.store.get = function getStoreItem(key) {
    var value = localStorage.getItem(key);

    try {
      value = JSON.parse(value);
    }
    catch(e) {}

    return value;
  };

  /**
   * Remove an item from localStorage.
   * @memberOf kontra
   *
   * @param {string} key - Name of the item.
   */
  kontra.store.remove = function removeStoreItem(key) {
    localStorage.removeItem(key);
  };

  /**
   * Clear all keys from localStorage.
   * @memberOf kontra
   */
  kontra.store.clear = function clearStore() {
    localStorage.clear();
  };

  return kontra;
})(kontra || {}, window, window.localStorage);