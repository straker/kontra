(function(exports, document) {
'use strict';
/*
 * Copyright (C) 2014 Steven Lambert
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */

 /**
 * @fileoverview HTML5 JavaScript asset loader. Part of the Kontra game library.
 * @author steven@sklambert.com (Steven Lambert)
 * @requires qLite.js
 */

// save the toString method for objects
var toString = ({}).toString;

/**
 * @class AssetLoader
 * @property {string} manifestUrl - The URL to the manifest file.
 * @property {object} manifest    - The JSON parsed manifest file.
 * @property {object} assets      - List of loaded assets.
 * @property {string} assetRoot   - Root directive for all assets.
 * @property {object} bundles     - List of created bundles.
 * @property {object} canPlay     - List of audio type compatibility.
 */
function AssetLoader() {
  // manifest
  this.manifestUrl = '';
  this.manifest  = {};

  // assets
  this.assets = {};
  this.assetRoot = './';
  this.bundles = {};

  this.supportedAssets = ['jpeg', 'jpg', 'gif', 'png', 'wav', 'mp3', 'ogg', 'aac', 'm4a', 'js', 'css', 'json'];

  // detect iOS so we can deal with audio assets not pre-loading
  this.isiOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);

  // audio playability (taken from Modernizr)
  var audio = new Audio();
  this.canPlay = {};
  this.canPlay.wav = audio.canPlayType('audio/wav; codecs="1"').replace(/no/, '');
  this.canPlay.mp3 = audio.canPlayType('audio/mpeg;').replace(/no/, '');
  this.canPlay.ogg = audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '');
  this.canPlay.aac = audio.canPlayType('audio/aac;').replace(/no/, '');
  this.canPlay.m4a = (audio.canPlayType('audio/x-m4a;') || this.canPlay.aac).replace(/no/, '');
}

/**
 * Add a bundle to the bundles dictionary.
 * @private
 * @memberof AssetLoader
 * @param {string} bundleName - The name of the bundle.
 * @throws {Error} If the bundle already exists.
 */
function addBundle(bundleName) {
  if (this.bundles[bundleName]) {
    throw new Error('Bundle \'' + bundleName + '\' already created');
  }
  else {
    // make the status property in-enumerable so it isn't returned in a for-in loop
    this.bundles[bundleName] = Object.create(Object.prototype, { status: {
      value: 'created',
      writable: true,
      enumerable: false,
      configurable: false }
    });
  }
}

/**
 * Count the number of assets.
 * @private
 * @memberof AssetLoader
 * @param {object} assets - The assets to count.
 * @return {number} Total number of assets.
 */
function countAssets(assets) {
  var total = 0;
  var asset, type;

  for (var assetName in assets) {
    if (assets.hasOwnProperty(assetName)) {
      asset = assets[assetName];

      if (asset instanceof Array) {
        type = 'audio';
      }
      else {
        type = getType(asset);
      }

      // only count audio assets if this is not iOS
      if (type === 'audio' && !this.isiOS) {
        total++;
      }
      else {
        total++;
      }
    }
  }

  return total;
}

/**
 * Test if an object is a string.
 * @private
 * @memberof AssetLoader
 * @param {object} obj - The object to test.
 * @returns {boolean} True if the object is a string.
 */
function isString(obj) {
  return toString.call(obj) === '[object String]';
}

/**
 * Return the type of asset based on it's extension.
 * @private
 * @memberof AssetLoader
 * @param {string} url - The URL to the asset.
 * @returns {string} image, audio, js, json.
 */
function getType(url) {
  if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
    return 'image';
  }
  else if (url.match(/\.(wav|mp3|ogg|aac|m4a)$/)) {
    return 'audio';
  }
  else if(url.match(/\.(js)$/)) {
    return 'js';
  }
  else if(url.match(/\.(css)$/)) {
    return 'css';
  }
  else if(url.match(/\.(json)$/)) {
    return 'json';
  }
}

/**
 * Return the extension of an asset.
 * @private
 * @memberof AssetLoader
 * @param {string} url - The URL to the asset.
 * @returns {string}
 */
function getExtension(url) {
  // @see {@link http://jsperf.com/extract-file-extension}
  return url.substr((~-url.lastIndexOf(".") >>> 0) + 2);
}

/**
 * Format Error messages for better output.
 * Use this function right before passing the Error to the user.
 * @private
 * @memberOf AssetLoader
 * @param {Error}  err - Error object.
 * @param {string} msg - Custom message.
 * @returns {string} The formated err message.
 */
function formatError(err, msg) {
  err.originalMessage = err.message;
  err.message = 'AssetLoader: ' + msg + '\n\t' + err.stack;
  return err;
}
/**
 * Load an asset manifest file.
 * @public
 * @memberof AssetLoader
 * @param {string} url - The URL to the asset manifest file.
 * @returns {Promise} A deferred promise.
 */
AssetLoader.prototype.loadManifest = function(url) {
  var _this = this;
  var deferred = q.defer();
  var i, len, bundle, bundles;

  // load the manifest only if it hasn't been loaded
  if (this.manifestUrl !== url) {
    this.loadJSON(url)
    .then(function loadMainfestJSONSuccess(manifest) {

      _this.manifest = manifest;
      _this.manifestUrl = url;
      _this.assetRoot = manifest.assetRoot || './';

      // create bundles and add assets
      try {
        for (i = 0, len = manifest.bundles.length; i < len; i++) {
          bundle = manifest.bundles[i];
          _this.createBundle(bundle.name, true);
          _this.addBundleAsset(bundle.name, bundle.assets, true);
        }
      }
      catch (err) {
        deferred.reject(err);
      }

      // load bundles
      if (manifest.loadBundles) {

        if (isString(manifest.loadBundles)) {
          // load all bundles
          if (manifest.loadBundles === 'all') {
            bundles = Object.keys(_this.bundles || {});
          }
          else {
            bundles = [manifest.loadBundles];
          }
        }
        else if (manifest.loadBundles instanceof Array) {
          bundles = manifest.loadBundles;
        }

        _this.loadBundle(bundles)
        .then(function loadMainfestSuccess() {
          deferred.resolve();
        }, function loadMainfestError(err) {
          deferred.reject(err);
        }, function loadMainfestNotify(progress) {
          deferred.notify(progress);
        });
      }
      else {
        deferred.resolve();
      }
    }, function loadMainfestJSONError(err) {
      err.message = err.message.replace('JSON', 'manifest');
      deferred.reject(err);
    });
  }
  else {
    deferred.resolve();
  }

  return deferred.promise;
};
/**
 * Create a bundle.
 * @public
 * @memberof AssetLoader
 * @param {string|array} bundle    - The name of the bundle(s).
 * @param {boolean}      isPromise - If this function is called by a function that uses a promise.
 * @throws {Error} If the bundle name already exists.
 * @example
 * AssetLoader.createBundle('bundleName');
 * AssetLoader.createBundle(['bundle1', 'bundle2']);
 */
AssetLoader.prototype.createBundle = function(bundle, isPromise) {
  try {
    // list of bundle names
    if (bundle instanceof Array) {
      for (var i = 0, len = bundle.length; i < len; i++) {
        addBundle.call(this, bundle[i]);
      }
    }
    // single bundle name
    else {
      addBundle.call(this, bundle);
    }
  }
  catch(err) {
    if (isPromise) {
      throw formatError(err, 'Unable to create bundle');
    }
    else {
      throw err;
    }
  }
};

/**
 * Load all assets in a bundle.
 * @public
 * @memberof AssetLoader
 * @param {string|array} bundle - The name of the bundle(s).
 * @returns {Promise} A deferred promise.
 * @throws {ReferenceError} If the bundle has not be created.
 * @example
 * AssetLoader.loadBundle('bundleName');
 * AssetLoader.loadBundle(['bundle1', 'bundle2']);
 */
AssetLoader.prototype.loadBundle = function(bundle) {
  var _this = this;
  var numLoaded = 0;
  var numAssets = 0;
  var bundles = [];
  var deferred = q.defer();  // defer to return
  var promises = [];  // keep track of all assets loaded
  var assets;

  if (bundle instanceof Array) {
    bundles = bundle;
  }
  else if (isString(bundle)) {
    bundles = [bundle];
  }

  for (var i = 0, len = bundles.length; i < len; i++) {
    assets = this.bundles[ bundles[i] ];

    if (!assets) {
      var err = new ReferenceError('Bundle not created');
      deferred.reject(formatError(err, 'Unable to load bundle \'' + bundle + '\''));
      return deferred.promise;
    }

    numAssets += countAssets.call(this, assets);

    assets.status = 'loading';
    promises.push(this.loadAsset(assets));
  }

  (function(_this, bundles) {
    q.all(promises)
    .then(function loadBundlesSuccess() {
      for (var i = 0, len = bundles.length; i < len; i++) {
        _this.bundles[ bundles[i] ].status = 'loaded';
      }

      deferred.resolve();
    }, function loadBundlesError(err) {
      deferred.reject(err);
    }, function loadBundlesNotify() {
      // notify user of progress
      deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
    });
  })(_this, bundles);

  return deferred.promise;
};

/**
 * Add an asset to a bundle.
 * @public
 * @memberof AssetLoader
 * @param {string}  bundleName - The name of the bundle.
 * @param {object}  asset      - The asset(s) to add to the bundle.
 * @param {boolean} isPromise  - If this function is called by a function that uses a promise.
 * @throws {ReferenceError} If the bundle has not be created.
 * @example
 * AssetLoader.addBundleAsset('bundleName', {'assetName': 'assetUrl'});
 * AssetLoader.addBundleAsset('bundleName', {'asset1': 'asset1Url', 'asset2': 'asset2Url'});
 */
AssetLoader.prototype.addBundleAsset = function(bundleName, asset, isPromise) {
  if (!this.bundles[bundleName]) {
    var err = new ReferenceError('Bundle not created');

    // format the error message for a promises reject
    if (isPromise) {
      throw formatError(err, 'Unable to add asset to bundle \'' + bundleName + '\'');
    }
    else {
      throw err;
    }
  }
  else {
    for (var assetName in asset) {
      if (asset.hasOwnProperty(assetName)) {
        this.bundles[bundleName][assetName] = asset[assetName];
      }
    }
  }
};
/**
 * Load an asset.
 * @public
 * @memberof AssetLoader
 * @param {object} asset - The asset(s) to load.
 * @returns {Promise} A deferred promise.
 * @throws {TypeError} If the asset type is not supported.
 * @example
 * AssetLoader.loadAsset({'assetName': 'assetUrl'});
 * AssetLoader.loadAsset({'asset1': 'asset1Url', 'asset2': 'asset2Url'});
 */
AssetLoader.prototype.loadAsset = function(asset) {
  var _this = this;
  var numLoaded = 0;
  var numAssets = countAssets.call(this, asset);
  var deferred = q.defer();
  var promises = [];
  var src, type, defer;

  for (var assetName in asset) {
    if (asset.hasOwnProperty(assetName)) {
      src = asset[assetName];

      // multiple audio formats
      if (src instanceof Array) {
        type = 'audio';
      }
      else {
        type = getType(src);
      }
      defer = q.defer();

      // load asset by type
      switch(type) {
        case 'image':
          // create closure for event binding
          (function loadImage(name, src, defer) {
            var image = new Image();
            image.status = 'loading';
            image.name = name;
            image.onload = function() {
              image.status = 'loaded';
              _this.assets[name] = image;
              defer.resolve();
              deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
            };
            image.onerror = function() {
              defer.reject(new Error('Unable to load Image \'' + name + '\''));
            };
            image.src = src;

            promises.push(defer.promise);
          })(assetName, src, defer);
          break;

        case 'audio':
          if (isString(src)) {
            src = [src];
          }

          // check that the browser can play one of the listed audio types
          var source, playableSrc;
          for (var i = 0, len = src.length; i < len; i++) {
            source = src[i];
            var extension = getExtension(source);

            // break on first audio type that is playable
            if (this.canPlay[extension]) {
              playableSrc = source;
              break;
            }
          }

          if (!playableSrc) {
            defer.reject(new Error('Browser cannot play any of the audio types provided for asset \'' + assetName + '\''));
            promises.push(defer.promise);
          }
          else {
            // don't count audio in iOS
            if (this.isiOS) {
              numAssets--;
            }

            (function loadAudio(name, src, defer) {
              var audio = new Audio();
              audio.status = 'loading';
              audio.name = name;
              audio.addEventListener('canplay', function() {
                audio.status = 'loaded';
                _this.assets[name] = audio;
                defer.resolve();
                deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
              });
              audio.onerror = function() {
                defer.reject(new Error('Unable to load Audio \'' + name + '\''));
              };
              audio.src = src;
              audio.preload = 'auto';
              audio.load();

              // for iOS, just load the asset without adding it the promises array
              // the audio will be downloaded on user interaction instead
              if (_this.isiOS) {
                audio.status = 'loaded';
                _this.assets[name] = audio;
              }
              else {
                promises.push(defer.promise);
              }
            })(assetName, playableSrc, defer);
          }
          break;

        case 'js':
          this.loadScript(src)
          .then(function loadScriptSuccess() {
            defer.resolve();
            deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
          }, function loadScriptError(err) {
            defer.reject(new Error(err.name + ': ' + err.message + ' \'' + assetName + '\' from src \'' + src + '\''));
          });

          promises.push(defer.promise);
          break;

        case 'css':
          this.loadCSS(src)
          .then(function loadCSSSuccess() {
            defer.resolve();
            deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
          }, function loadCSSError(err) {
            defer.reject(new Error(err.name + ': ' + err.message + ' \'' + assetName + '\' from src \'' + src + '\''));
          });

          promises.push(defer.promise);
          break;

        case 'json':
          (function loadJSONFile(name, src, defer) {
            _this.loadJSON(src)
            .then(function loadJsonSuccess(json) {
              _this.assets[name] = json;
              defer.resolve();
              deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
            }, function loadJSONError(err) {
              defer.reject(new Error(err.name + ': ' + err.message + ' \'' + name + '\' from src \'' + src + '\''));
            });

            promises.push(defer.promise);
          })(assetName, src, defer);
          break;

        default:
          var err = new TypeError('Unsupported asset type');
          deferred.reject(formatError(err, 'File type for asset \'' + assetName + '\' is not supported. Please use ' + this.supportedAssets.join(', ')));
      }
    }
  }

  if (numAssets === 0) {
    deferred.resolve();
    return deferred.promise;
  }

  q.all(promises)
  .then(function loadAssetSuccess(value) {
    deferred.resolve(value);
  },
  function loadAssetError(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Load a JavaScript file.
 * <p><strong>NOTE:</strong> This function does not add the asset to the assets dictionary.</p>
 * @public
 * @memberof AssetLoader
 * @param {string} url - The URL to the JavaScript file.
 * @returns {Promise} A deferred promise.
 */
AssetLoader.prototype.loadScript = function(url) {
  var deferred = q.defer();
  var script = document.createElement('script');
  script.async = true;
  script.onload = function() {
    deferred.resolve();
  };
  script.onerror = function() {
    var err = new Error();
    deferred.reject(formatError(err, 'Unable to load JavaScript file'));
  };
  script.src = url;
  document.body.appendChild(script);

  return deferred.promise;
};

/**
 * Load a CSS file.
 * <p><strong>NOTE:</strong> This function does not add the asset to the assets dictionary.</p>
 * @public
 * @memberof AssetLoader
 * @param {string} url - The URL to the CSS file.
 * @returns {Promise} A deferred promise.
 */
AssetLoader.prototype.loadCSS = function(url) {
  var deferred = q.defer();

  /*
   * Because of the lack of onload and onerror support for &lt;link> tags, we need to load the CSS
   * file via ajax and then put the contents of the file into a &lt;style> tag.
   * @see {@link http://pieisgood.org/test/script-link-events/}
   */
  var req = new XMLHttpRequest();
  req.addEventListener('load', function CSSLoaded() {
    // ensure we have a css file before creating the <style> tag
    if (req.status === 200 && req.getResponseHeader('content-type').indexOf('text/css') !== -1) {
      var style = document.createElement('style');
      style.innerHTML = req.responseText;
      style.setAttribute('data-url', url);  // set data attribute for testing purposes
      document.getElementsByTagName('head')[0].appendChild(style);
      deferred.resolve();
    }
    else {
      var err = new Error(req.responseText);
      deferred.reject(formatError(err, 'Unable to load CSS file'));
    }
  });
  req.open('GET', url, true);
  req.send();

  return deferred.promise;
};

/**
 * Load a JSON file.
 * @public
 * @memberof AssetLoader
 * @param {string} url - The URL to the JSON file.
 * @returns {Promise} A deferred promise. Resolves with the parsed JSON.
 * @throws {Error} When the JSON file fails to load.
 */
AssetLoader.prototype.loadJSON = function(url) {
  var deferred = q.defer();
  var req = new XMLHttpRequest();
  req.addEventListener('load', function JSONLoaded() {
    if (req.status === 200) {
      try {
        var json = JSON.parse(req.responseText);
        deferred.resolve(json);
      }
      catch (err) {
        deferred.reject(formatError(err, 'Unable to parse JSON file'));
      }
    }
    else {
      var err = new Error(req.responseText);
      deferred.reject(formatError(err, 'Unable to load JSON file'));
    }
  });
  req.open('GET', url, true);
  req.send();

  return deferred.promise;
};
/**
 * The MIT License
 *
 * Copyright (c) 2010-2012 Google, Inc. http://angularjs.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
window.q = qFactory(function(callback) {
  setTimeout(function() {
    callback();
  }, 0);
}, function(e) {
  console.error('qLite: ' + e.stack);
});

/**
 * Constructs a promise manager.
 *
 * @param {function(Function)} nextTick Function for executing functions in the next turn.
 * @param {function(...*)} exceptionHandler Function into which unexpected exceptions are passed for
 *     debugging purposes.
 * @returns {object} Promise manager.
 */
function qFactory(nextTick, exceptionHandler) {
  var toString = ({}).toString;
  var isFunction = function isFunction(value){return typeof value == 'function';};
  var isArray = function isArray(value) {return toString.call(value) === '[object Array]';};

  function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          // Need to check if hasOwnProperty exists,
          // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
          if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isArray(obj)) {
        for (key = 0; key < obj.length; key++)
          iterator.call(context, obj[key], key);
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  }

  /**
   * @ngdoc method
   * @name $q#defer
   * @function
   *
   * @description
   * Creates a `Deferred` object which represents a task which will finish in the future.
   *
   * @returns {Deferred} Returns a new instance of deferred.
   */
  var defer = function() {
    var pending = [],
        value, deferred;

    deferred = {

      resolve: function(val) {
        if (pending) {
          var callbacks = pending;
          pending = undefined;
          value = ref(val);

          if (callbacks.length) {
            nextTick(function() {
              var callback;
              for (var i = 0, ii = callbacks.length; i < ii; i++) {
                callback = callbacks[i];
                value.then(callback[0], callback[1], callback[2]);
              }
            });
          }
        }
      },


      reject: function(reason) {
        deferred.resolve(createInternalRejectedPromise(reason));
      },


      notify: function(progress) {
        if (pending) {
          var callbacks = pending;

          if (pending.length) {
            nextTick(function() {
              var callback;
              for (var i = 0, ii = callbacks.length; i < ii; i++) {
                callback = callbacks[i];
                callback[2](progress);
              }
            });
          }
        }
      },


      promise: {
        then: function(callback, errback, progressback) {
          var result = defer();

          var wrappedCallback = function(value) {
            try {
              result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
            } catch(e) {
              result.reject(e);
              exceptionHandler(e);
            }
          };

          var wrappedErrback = function(reason) {
            try {
              result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
            } catch(e) {
              result.reject(e);
              exceptionHandler(e);
            }
          };

          var wrappedProgressback = function(progress) {
            try {
              result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
            } catch(e) {
              exceptionHandler(e);
            }
          };

          if (pending) {
            pending.push([wrappedCallback, wrappedErrback, wrappedProgressback]);
          } else {
            value.then(wrappedCallback, wrappedErrback, wrappedProgressback);
          }

          return result.promise;
        },

        "catch": function(callback) {
          return this.then(null, callback);
        },

        "finally": function(callback) {

          function makePromise(value, resolved) {
            var result = defer();
            if (resolved) {
              result.resolve(value);
            } else {
              result.reject(value);
            }
            return result.promise;
          }

          function handleCallback(value, isResolved) {
            var callbackOutput = null;
            try {
              callbackOutput = (callback ||defaultCallback)();
            } catch(e) {
              return makePromise(e, false);
            }
            if (callbackOutput && isFunction(callbackOutput.then)) {
              return callbackOutput.then(function() {
                return makePromise(value, isResolved);
              }, function(error) {
                return makePromise(error, false);
              });
            } else {
              return makePromise(value, isResolved);
            }
          }

          return this.then(function(value) {
            return handleCallback(value, true);
          }, function(error) {
            return handleCallback(error, false);
          });
        }
      }
    };

    return deferred;
  };


  var ref = function(value) {
    if (value && isFunction(value.then)) return value;
    return {
      then: function(callback) {
        var result = defer();
        nextTick(function() {
          result.resolve(callback(value));
        });
        return result.promise;
      }
    };
  };


  /**
   * @ngdoc method
   * @name $q#reject
   * @function
   *
   * @description
   * Creates a promise that is resolved as rejected with the specified `reason`. This api should be
   * used to forward rejection in a chain of promises. If you are dealing with the last promise in
   * a promise chain, you don't need to worry about it.
   *
   * When comparing deferreds/promises to the familiar behavior of try/catch/throw, think of
   * `reject` as the `throw` keyword in JavaScript. This also means that if you "catch" an error via
   * a promise error callback and you want to forward the error to the promise derived from the
   * current promise, you have to "rethrow" the error by returning a rejection constructed via
   * `reject`.
   *
   * ```js
   *   promiseB = promiseA.then(function(result) {
   *     // success: do something and resolve promiseB
   *     //          with the old or a new result
   *     return result;
   *   }, function(reason) {
   *     // error: handle the error if possible and
   *     //        resolve promiseB with newPromiseOrValue,
   *     //        otherwise forward the rejection to promiseB
   *     if (canHandle(reason)) {
   *      // handle the error and recover
   *      return newPromiseOrValue;
   *     }
   *     return $q.reject(reason);
   *   });
   * ```
   *
   * @param {*} reason Constant, message, exception or an object representing the rejection reason.
   * @returns {Promise} Returns a promise that was already resolved as rejected with the `reason`.
   */
  var reject = function(reason) {
    var result = defer();
    result.reject(reason);
    return result.promise;
  };

  var createInternalRejectedPromise = function(reason) {
    return {
      then: function(callback, errback) {
        var result = defer();
        nextTick(function() {
          try {
            result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
          } catch(e) {
            result.reject(e);
            exceptionHandler(e);
          }
        });
        return result.promise;
      }
    };
  };


  /**
   * @ngdoc method
   * @name $q#when
   * @function
   *
   * @description
   * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
   * This is useful when you are dealing with an object that might or might not be a promise, or if
   * the promise comes from a source that can't be trusted.
   *
   * @param {*} value Value or a promise
   * @returns {Promise} Returns a promise of the passed value or promise
   */
  var when = function(value, callback, errback, progressback) {
    var result = defer(),
        done;

    var wrappedCallback = function(value) {
      try {
        return (isFunction(callback) ? callback : defaultCallback)(value);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    var wrappedErrback = function(reason) {
      try {
        return (isFunction(errback) ? errback : defaultErrback)(reason);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    var wrappedProgressback = function(progress) {
      try {
        return (isFunction(progressback) ? progressback : defaultCallback)(progress);
      } catch (e) {
        exceptionHandler(e);
      }
    };

    nextTick(function() {
      ref(value).then(function(value) {
        if (done) return;
        done = true;
        result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback));
      }, function(reason) {
        if (done) return;
        done = true;
        result.resolve(wrappedErrback(reason));
      }, function(progress) {
        if (done) return;
        result.notify(wrappedProgressback(progress));
      });
    });

    return result.promise;
  };


  function defaultCallback(value) {
    return value;
  }


  function defaultErrback(reason) {
    return reject(reason);
  }


  /**
   * @ngdoc method
   * @name $q#all
   * @function
   *
   * @description
   * Combines multiple promises into a single promise that is resolved when all of the input
   * promises are resolved.
   *
   * @param {Array.<Promise>|Object.<Promise>} promises An array or hash of promises.
   * @returns {Promise} Returns a single promise that will be resolved with an array/hash of values,
   *   each value corresponding to the promise at the same index/key in the `promises` array/hash.
   *   If any of the promises is resolved with a rejection, this resulting promise will be rejected
   *   with the same rejection value.
   */
  function all(promises) {
    var deferred = defer(),
        counter = 0,
        results = isArray(promises) ? [] : {};

    forEach(promises, function(promise, key) {
      counter++;
      ref(promise).then(function(value) {
        if (results.hasOwnProperty(key)) return;
        results[key] = value;
        if (!(--counter)) deferred.resolve(results);
      }, function(reason) {
        if (results.hasOwnProperty(key)) return;
        deferred.reject(reason);
      }, function(reason) {
        if (results.hasOwnProperty(key)) return;
        deferred.notify(reason);
      });
    });

    if (counter === 0) {
      deferred.resolve(results);
    }

    return deferred.promise;
  }

  return {
    defer: defer,
    reject: reject,
    when: when,
    all: all
  };
}

exports.AssetLoader = AssetLoader;
})(window, document);
var kontra = (function(kontra, document) {
  /**
   * Set up the canvas.
   * @memberOf kontra
   *
   * @param {object} properties - Properties for the game.
   * @param {string|Canvas} properties.canvas - ID string or Canvas element to draw the game on.
   */
  kontra.init = function init(properties) {
    properties = properties || {};

    if (kontra.isString(properties.canvas)) {
      this.canvas = document.getElementById(properties.canvas);
    }
    else if (kontra.isCanvas(properties.canvas)) {
      this.canvas = canvas;
    }
    else {
      this.canvas = document.getElementsByTagName('canvas')[0];

      if (!this.canvas) {
        var error = new ReferenceError('No canvas element found.');
        kontra.logError(error, 'You must provide a canvas element for the game.');
        return;
      }
    }

    this.context = this.canvas.getContext('2d');
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
  };

  /**
   * Throw an error message to the user with readability formating.
   * @memberOf kontra
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra.logError = function logError(error, message) {
    error.originalMessage = error.message;
    error.message = 'Kontra: ' + message + '\n\t' + error.stack;
    console.error(error.message);
  };

  /**
   * Noop function.
   * @memberOf kontra
   */
  kontra.noop = function noop() {};

  /**
   * Determine if a value is an Array.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isArray = Array.isArray;

  /**
   * Determine if a value is a String.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Determine if a value is a Number.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  /**
   * Determine if a value is an Image.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isImage = function isImage(value) {
    return value && value.nodeName.toLowerCase() === 'img';
  };

  /**
   * Determine if a value is a Canvas.
   * @memberOf kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isCanvas = function isCanvas(value) {
    return value && value.nodeName.toLowerCase() === 'canvas';
  };

  return kontra;
})(kontra || {}, document);
var kontra = (function(kontra) {
  // use the kontra-asset-loader
  kontra.AssetLoader = AssetLoader;

  return kontra;
})(kontra || {});
var kontra = (function(kontra, window, document) {
  /**
   * Game loop that updates and draws the game every frame.
   * @memberOf kontra
   * @constructor
   *
   * @param {object}   properties - Configure the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {number}   [properties.slowFactor=1] - How much to slow down the frame rate.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.draw - Function called to draw the game.
   */
  kontra.GameLoop = function GameLoop(properties) {
    properties = properties || {};

    // check for required functions
    if (typeof properties.update !== 'function' || typeof properties.draw !== 'function') {
      var error = new ReferenceError('Required functions not found');
      kontra.logError(error, 'You must provide update() and draw() functions to create a game loop.');
      return;
    }

    // animation variables
    var fps = properties.fps || 60;
    var last = 0;
    var accumulator = 0;
    var step = 1E3 / fps;
    var slowFactor = properties.slowFactor || 1;
    var delta = slowFactor * step;

    var update = properties.update;
    var draw = properties.draw;
    var started = false;
    var _this = this;
    var now;
    var dt;
    var rAF;

    document.addEventListener( 'visibilitychange', onVisibilityChange, false);

    /**
     * Start the game loop.
     * @memberOf kontra.GameLoop
     */
    this.start = function GameLoopStart() {
      started = true;
      last = 0;
      requestAnimationFrame(this.frame);
    };

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.GameLoop
     */
    this.frame = function GameLoopFrame() {
      rAF = requestAnimationFrame(_this.frame);

      stats.begin();

      now = timestamp();
      dt = now - (last || now);
      last = now;

      accumulator += dt;

      while (accumulator >= delta) {
        update();

        accumulator -= delta;
      }

      draw();

      stats.end();
    };

    /**
     * Stop the game loop.
     * @memberOf kontra.GameLoop
     */
    this.stop = function GameLoopStop() {
      started = false;
      cancelAnimationFrame(rAF);
    };

    /**
     * Pause the game loop. This is different than stopping so that on visibility
     * change, we don't just resume the game if it was stopped before.
     * @memberOf kontra.GameLoop
     */
    this.pause = function GameLoopPause() {
      cancelAnimationFrame(rAF);
    };

    /**
     * Stop the game when the window isn't visible.
     * @memberOf kontra.GameLoop
     * @private
     */
    function onVisibilityChange() {
      if (document.hidden) {
        _this.pause();
      }
      else if (started) {
        _this.start();
      }
    }
  };

  /**
   * Returns the current time.
   * @private
   *
   * @returns {number}
   */
  var timestamp = (function() {
    // function to call if window.performance.now is available
    function timestampPerformance() {
      return window.performance.now();
    }

    // default function to call
    function timestampDate() {
      return new Date().getTime();
    }

    if (window.performance && window.performance.now) {
      return timestampPerformance;
    }
    else {
      return timestampDate;
    }
  })();

  return kontra;
})(kontra || {}, window, document);
/*jshint -W084 */

var kontra = (function(kontra, window) {
  var callbacks = {};
  var pressedKeys = {};

  var keyMap = {
    // named keys
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    20: 'capslock',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'delete',
    91: 'leftwindow',
    92: 'rightwindow',
    93: 'select',
    144: 'numlock',
    145: 'scrolllock',

    // special characters
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: '\''
  };

  // alpha keys
  for (i = 0; i < 26; i++) {
    keyMap[65+i] = String.fromCharCode(65+i).toLowerCase();
  }
  // numeric keys
  for (var i = 0; i < 10; i++) {
    keyMap[48+i] = ''+i;
  }
  // f keys
  for (i = 1; i < 20; i++) {
    keyMap[111+i] = 'f'+i;
  }
  // keypad
  for (i = 0; i < 10; i++) {
    keyMap[96+i] = 'numpad'+i;
  }

  // shift keys mapped to their non-shift equivalent
  var shiftKeys = {
    '~': '`',
    '!': '1',
    '@': '2',
    '#': '3',
    '$': '4',
    '%': '5',
    '^': '6',
    '&': '7',
    '*': '8',
    '(': '9',
    ')': '0',
    '_': '-',
    '+': '=',
    ':': ';',
    '"': '\'',
    '<': ',',
    '>': '.',
    '?': '/',
    '|': '\\',
    'plus': '='
  };

  // aliases modifier keys to their actual key for keyup event
  var aliases = {
    'leftwindow': 'meta',  // mac
    'select': 'meta'  // mac
  };

  // modifier order for combinations
  var modifierOrder = ['meta', 'ctrl', 'alt', 'shift'];

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler);

  /**
   * Register a function to be called on a keyboard keys.
   * @memberOf kontra
   *
   * @param {string|string[]} keys - keys combination string(s).
   *
   * @throws {SyntaxError} If callback is not a function.
   */
  kontra.bindKey = function bindKey(keys, callback) {
    if (typeof callback !== 'function') {
      var error = new SyntaxError('Invalid function.');
      kontra.logError(error, 'You must provide a function as the second parameter.');
      return;
    }

    keys = (kontra.isArray(keys) ? keys : [keys]);

    for (var i = 0, key; key = keys[i]; i++) {
      var combination = normalizeKeys(key);

      callbacks[combination] = callback;
    }
  };

  /**
   * Remove the callback function for a key combination.
   * @param {string|string[]} keys - keys combination string.
   */
  kontra.unbindKey = function unbindKey(keys) {
    keys = (kontra.isArray(keys) ? keys : [keys]);

    for (var i = 0, key; key = keys[i]; i++) {
      var combination = normalizeKeys(key);

      callbacks[combination] = undefined;
    }
  };

  /**
   * Returns whether a key is pressed.
   * @memberOf kontra
   *
   * @param {string} keys - Keys combination string.
   *
   * @returns {boolean}
   */
  kontra.keyIsPressed = function keyIsPressed(keys) {
    var combination = normalizeKeys(keys);
    var pressed = true;

    // loop over each key in the combination and verify that it is pressed
    keys = combination.split('+');
    for (var i = 0, key; key = keys[i]; i++) {
      pressed = pressed && !!pressedKeys[key];
    }

    return pressed;
  };

  /**
   * Normalize the event keycode
   * @private
   *
   * @param {Event} e
   *
   * @returns {number}
   */
  function normalizeKeyCode(e) {
    return (typeof e.which === 'number' ? e.which : e.keyCode);
  }

  /**
   * Normalize keys combination order.
   * @private
   *
   * @param {string} keys - keys combination string.
   *
   * @returns {string} Normalized combination.
   *
   * @example
   * normalizeKeys('c+ctrl');  //=> 'ctrl+c'
   * normalizeKeys('shift+++meta+alt');  //=> 'meta+alt+shift+plus'
   */
  function normalizeKeys(keys) {
    var combination = [];

    // handle '++' combinations
    keys = keys.trim().replace('++', '+plus');

    // put modifiers in the correct order
    for (var i = 0, modifier; modifier = modifierOrder[i]; i++) {

      // check for the modifier
      if (keys.indexOf(modifier) !== -1) {
        combination.push(modifier);
        keys = keys.replace(modifier, '');
      }
    }

    // remove all '+'s to leave only the last key
    keys = keys.replace(/\+/g, '').toLowerCase();

    // check for shift key
    if (shiftKeys[keys]) {
      combination.push('shift+'+shiftKeys[keys]);
    }
    else if(keys) {
      combination.push(keys);
    }

    return combination.join('+');
  }

  /**
   * Get the key combination from an event.
   * @private
   *
   * @param {Event} e
   *
   * @return {string} normalized combination.
   */
  function getKeyCombination(e) {
    var combination = [];

    // check for modifiers
    for (var i = 0, modifiers; modifier = modifierOrder[i]; i++) {
      if (e[modifier+'Key']) {
        combination.push(modifier);
      }
    }

    var key = keyMap[normalizeKeyCode(e)];

    // prevent duplicate keys from being added to the combination
    // for example 'ctrl+ctrl' since ctrl is both a modifier and
    // a regular key
    if (combination.indexOf(key) === -1) {
      combination.push(key);
    }

    return combination.join('+');
  }

  /**
   * Execute a function that corresponds to a keyboard combination.
   * @private
   *
   * @param {Event} e
   */
  function keydownEventHandler(e) {
    var combination = getKeyCombination(e);

    // set pressed keys
    for (var i = 0, keys = combination.split('+'), key; key = keys[i]; i++) {
      pressedKeys[key] = true;
    }

    if (callbacks[combination]) {
      callbacks[combination](e, combination);
      e.preventDefault();
    }
  }

  /**
   * Set the released key to not being pressed.
   * @private
   *
   * @param {Event} e
   */
  function keyupEventHandler(e) {
    var key = keyMap[normalizeKeyCode(e)];
    pressedKeys[key] = false;

    if (aliases[key]) {
      pressedKeys[ aliases[key] ] = false;
    }
  }

  /**
   * Reset pressed keys.
   * @private
   *
   * @param {Event} e
   */
  function blurEventHandler(e) {
    pressedKeys = {};
  }

  return kontra;
})(kontra || {}, window);
/*jshint -W084 */

var kontra = (function(kontra) {
  kontra.Pool = Pool;

  /**
   * Object pool.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberOf kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {number} properties.size - Size of the pool.
   * @param {object} properties.Object - Object to put in the pool.
   *
   * Objects inside the pool must implement <code>draw()</code>, <code>update()</code>,
   * <code>set()</code>, and <code>isAlive()</code> functions.
   */
  function Pool(properties) {
    properties = properties || {};

    // ensure objects for the pool have required functions
    var obj = new properties.Object();
    if (typeof obj.draw !== 'function' || typeof obj.update !== 'function' ||
        typeof obj.set !== 'function' || typeof obj.isAlive !== 'function') {
      var error = new ReferenceError('Required function not found.');
      kontra.logError(error, 'Objects to be pooled must implement draw(), update(), set() and isAlive() functions.');
      return;
    }

    this.size = properties.size;
    this.lastIndex = properties.size - 1;
    this.objects = [];

    // populate the pool
    this.objects[0] = obj;
    for (var i = 1; i < this.size; i++) {
      this.objects[i] = new properties.Object();
    }
  }

  /**
   * Get an object from the pool.
   * @memberOf kontra.Pool
   *
   * @param {object} properties - Properties to pass to object.set().
   *
   * @returns {boolean} True if the pool had an object to get.
   */
  Pool.prototype.get = function(properties) {
    // the pool is out of objects if the first object is in use
    if (this.objects[0].isAlive()) {
      return false;
    }

    // save off first object in pool to reassign to last object after unshift
    var obj = this.objects[0];

    // unshift the array
    for (var i = 1; i < this.size; i++) {
      this.objects[i-1] = this.objects[i];
    }

    this.objects[this.lastIndex] = obj.set(properties);

    return true;
  };

  /**
   * Update all alive pool objects.
   * @memberOf kontra.Pool
   */
  Pool.prototype.update = function() {
    var i = this.lastIndex;
    var obj;

    while (obj = this.objects[i]) {

      // once we find the first object that is not alive we can stop
      if (!obj.isAlive()) {
        return;
      }

      obj.update();

      // if the object is dead, move it to the front of the pool
      if (!obj.isAlive()) {

        // push an object from the middle of the pool to the front of the pool
        // without returning a new array through Array#splice to avoid garbage
        // collection of the old array
        // @see http://jsperf.com/object-pools-array-vs-loop
        for (var j = i; j > 0; j--) {
          this.objects[j] = this.objects[j-1];
        }

        this.objects[0] = obj;
      }
      else {
        i--;
      }
    }
  };

  /**
   * Draw all alive pool objects.
   * @memberOf kontra.Pool
   */
  Pool.prototype.draw = function() {
    for (var i = this.lastIndex, obj; obj = this.objects[i]; i--) {

      // once we find the first object that is not alive we can stop
      if (!obj.isAlive()) {
        return;
      }

      obj.draw();
    }
  };

  return kontra;
})(kontra || {});
var kontra = (function(kontra, undefined) {
  kontra.Sprite = Sprite;

  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   * @requires kontra.Vector
   *
   * @param @see this.set for list of available parameters.
   */
  function Sprite(properties) {
    if (!kontra.Vector) {
      var error = new ReferenceError('Vector() not found.');
      kontra.logError(error, 'Kontra.Sprite requires kontra.Vector.');
      return;
    }

    this.position = new kontra.Vector();
    this.velocity = new kontra.Vector();
    this.acceleration = new kontra.Vector();
    this.timeToLive = 0;
    this.context = kontra.context;

    if (properties) {
      this.set(properties);
    }
  }

  /**
   * Move the sprite by its velocity.
   * @memberOf kontra.Sprite
   */
  Sprite.prototype.advance = function SpriteAdvance() {
    this.velocity.add(this.acceleration);

    this.position.add(this.velocity);

    this.timeToLive--;
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite
   */
  Sprite.prototype.render = function SpriteRender() {
    this.context.save();
    this.context.drawImage(this.image, this.position.x, this.position.y);
    this.context.restore();
  };

  /**
   * Determine if the sprite is alive.
   * @memberOf kontra.Sprite
   *
   * @returns {boolean}
   */
  Sprite.prototype.isAlive = function SpriteIsAlive() {
    return this.timeToLive > 0;
  };

  /**
   * Set properties on the sprite.
   * @memberOf kontra.Sprite
   *
   * @param {object} properties - Properties to set on the sprite.
   * @param {Vector} properties.x - X coordinate of the sprite.
   * @param {Vector} properties.y - Y coordinate of the sprite.
   * @param {Vector} [properties.dx] - Change in X position.
   * @param {Vector} [properties.dy] - Change in Y position.
   * @param {Vector} [properties.ddx] - Change in X velocity.
   * @param {Vector} [properties.ddy] - Change in Y velocity.
   * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
   * @param {string|Image|Canvas} [properties.image] - Image for the sprite.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
   *
   * If you need the sprite to live forever, or just need it to stay on screen until you
   * decide when to kill it, you can set time to live to <code>Infinity</code>. Just be
   * sure to override the <code>isAlive()</code> function to return true when the sprite
   * should die.
   *
   * @returns {Sprite}
   */
  Sprite.prototype.set = function SpriteSpawn(properties) {
    properties = properties || {};

    var _this = this;

    this.position.set(properties.x, properties.y);
    this.velocity.set(properties.dx, properties.dy);
    this.acceleration.set(properties.ddx, properties.ddy);
    this.timeToLive = properties.timeToLive || 0;

    this.context = properties.context || this.context;

    // load an image
    if (kontra.isString(properties.image)) {
      this.image = new Image();
      this.image.onload = function() {
        _this.width = this.width;
        _this.height = this.height;
      };
      this.image.src = properties.image;
    }
    else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
      this.image = properties.image;
      this.width = this.image.width;
      this.height = this.image.height;
    }
    else {
      // make the render function for this sprite a noop since there is no image to draw.
      // this.render/this.draw should be overridden if you want to draw something else.
      this.render = kontra.noop;
    }

    return this;
  };

  /**
   * Update the sprites velocity and position.
   * @memberOf kontra.Sprite
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the update step. Just call <code>this.advance()</code> when you need
   * the sprite to update its position.
   *
   * @example
   * sprite = new Sprite();
   * sprite.update = function() {
   *   // do some logic
   *
   *   this.advance();
   *
   *   return this;
   * };
   *
   * @returns {Sprite}
   */
  Sprite.prototype.update = function SpriteUpdate() {
    this.advance();

    return this;
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite.
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the draw step. Just call <code>this.render()</code> when you need the
   * sprite to draw its image.
   *
   * @example
   * sprite = new Sprite();
   * sprite.draw = function() {
   *   // do some logic
   *
   *   this.render();
   *
   *   return this;
   * };
   *
   * @returns {Sprite}
   */
  Sprite.prototype.draw = function SpriteDraw() {
    this.render();

    return this;
  };

  return kontra;
})(kontra || {});
/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  kontra.SpriteSheet = SpriteSheet;

  /**
   * Create a sprite sheet from an image.
   * @memberOf kontra
   * @constructor
   *
   * @param {object} properties - Configure the sprite sheet.
   * @param {string|Image} properties.image - Path to the image or Image object.
   * @param {number} properties.frameWidth - Width (in px) of each frame.
   * @param {number} properties.frameHeight - Height (in px) of each frame.
   */
  function SpriteSheet(properties) {
    properties = properties || {};

    var _this = this;

    // load an image path
    if (kontra.isString(properties.image)) {
      this.image = new Image();
      this.image.onload = calculateFrames;
      this.image.src = properties.image;
    }
    // load an image object
    else if (kontra.isImage(properties.image)) {
      this.image = properties.image;
      calculateFrames();
    }
    else {
      var error = new SyntaxError('Invalid image.');
      kontra.logError(error, 'You must provide an Image or path to an image.');
      return;
    }

    /**
     * Calculate the number of frames in a row.
     */
    function calculateFrames() {
      _this.frameWidth = properties.frameWidth || _this.image.width;
      _this.frameHeight = properties.frameHeight || _this.image.height;

      _this.framesPerRow = Math.floor(_this.image.width / _this.frameWidth);
    }
  }

  /**
   * Create an animation from the sprite sheet.
   * @memberOf kontra.SpriteSheet
   *
   * @param {object} animations - List of named animations to create from the Image.
   * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
   * @param {number} animations.animationName.frameSpeed=1 - Number of frames to wait before transitioning the animation to the next frame.
   *
   * @example
   * var animations = {
   *   idle: {
   *     frames: 1  // single frame animation
   *   },
   *   walk: {
   *     frames: '2..6',  // consecutive frame animation (frames 2-6, inclusive)
   *     frameSpeed: 4
   *   },
   *   moonWalk: {
   *     frames: '6..2',  // descending consecutive frame animation
   *     frameSpeed: 4
   *   },
   *   jump: {
   *     frames: [7, 12, 2],  // non-consecutive frame animation
   *     frameSpeed: 3
   *   },
   *   attack: {
   *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *     frameSpeed: 2
   *   }
   * };
   * sheet.createAnimation(animations);
   */
  SpriteSheet.prototype.createAnimation = function SpriteSheetCreateAnimation(animations) {
    var error;

    if (!animations || Object.keys(animations).length === 0) {
      error = new SyntaxError('No animations found.');
      kontra.logError(error, 'You must provide at least one named animation to create an Animation.');
      return;
    }

    this.animations = {};

    // create each animation by parsing the frames
    var animation;
    var frames;
    for (var name in animations) {
      if (!animations.hasOwnProperty(name)) {
        continue;
      }

      animation = animations[name];
      frames = animation.frames;

      animation.frameSpeed = animation.frameSpeed || 1;

      // array that holds the order of the animation
      animation.animationSequence = [];

      if (frames === undefined) {
        error = new SyntaxError('No animation frames found.');
        kontra.logError(error, 'Animation ' + name + ' must provide a frames property.');
        return;
      }

      // single frame
      if (kontra.isNumber(frames)) {
        animation.animationSequence.push(frames);
      }
      // consecutive frames
      else if (kontra.isString(frames)) {
        animation.animationSequence = parseConsecutiveFrames(frames);
      }
      // non-consecutive frames
      else if (kontra.isArray(frames)) {
        for (var i = 0, frame; frame = frames[i]; i++) {

          // consecutive frames
          if (kontra.isString(frame)) {
            var consecutiveFrames = parseConsecutiveFrames(frame);

            // add new frames to the end of the array
            animation.animationSequence.push.apply(animation.animationSequence,consecutiveFrames);
          }
          // single frame
          else {
            animation.animationSequence.push(frame);
          }
        }
      }

      this.animations[name] = new Animation(this, animation);
    }
  };

  /**
   * Get an animation by name.
   * @memberOf kontra.SpriteSheet
   *
   * @param {string} name - Name of the animation.
   *
   * @returns {Animation}
   */
  SpriteSheet.prototype.getAnimation = function SpriteSheetGetAnimation(name) {
    return this.animations[name];
  };

  /**
   * Parse a string of consecutive frames.
   * @private
   *
   * @param {string} frames - Start and end frame.
   *
   * @returns {number[]} List of frames.
   */
  function parseConsecutiveFrames(frames) {
    var animationSequence = [];
    var consecutiveFrames = frames.split('..');

    // turn each string into a number
    consecutiveFrames[0] = parseInt(consecutiveFrames[0], 10);
    consecutiveFrames[1] = parseInt(consecutiveFrames[1], 10);

    // determine which direction to loop
    var direction = (consecutiveFrames[0] < consecutiveFrames[1] ? 1 : -1);
    var i;

    // ascending frame order
    if (direction === 1) {
      for (i = consecutiveFrames[0]; i <= consecutiveFrames[1]; i++) {
        animationSequence.push(i);
      }
    }
    // descending order
    else {
      for (i = consecutiveFrames[0]; i >= consecutiveFrames[1]; i--) {
        animationSequence.push(i);
      }
    }

    return animationSequence;
  }

  /**
   * Single animation from a sprite sheet.
   * @private
   * @constructor
   *
   * @param {SpriteSheet} spriteSheet - Sprite sheet for the animation.
   * @param {object} animation - Animation object.
   * @param {number[]} animation.animationSequence - List of frames of the animation.
   * @param {number}  animation.frameSpeed - Number of frames to wait before transitioning the animation to the next frame.
   */
  function Animation(spriteSheet, animation) {

    this.animationSequence = animation.animationSequence;
    this.frameSpeed = animation.frameSpeed;

    var currentFrame = 0;  // the current frame to draw
    var counter = 0;       // keep track of frame rate
    var update;
    var draw;

    /**
     * Update the animation.
     * @memberOf Animation
     */
    this.update = function AnimationUpdate() {
      // update to the next frame if it is time
      if (counter === this.frameSpeed - 1) {
        currentFrame = ++currentFrame % this.animationSequence.length;
      }

      // update the counter
      counter = ++counter % this.frameSpeed;
    };

    /**
     * Draw the current frame.
     * @memberOf Animation
     *
     * @param {integer} x - X position to draw
     * @param {integer} y - Y position to draw
     */
    this.draw = function AnimationDraw(x, y) {
      // get the row and col of the frame
      var row = Math.floor(this.animationSequence[currentFrame] / spriteSheet.framesPerRow);
      var col = Math.floor(this.animationSequence[currentFrame] % spriteSheet.framesPerRow);

      ctx.drawImage(
        spriteSheet.image,
        col * spriteSheet.frameWidth, row * spriteSheet.frameHeight,
        spriteSheet.frameWidth, spriteSheet.frameHeight,
        x, y,
        spriteSheet.frameWidth, spriteSheet.frameHeight);
    };

    /**
     * Play the animation.
     * @memberOf Animation
     */
    this.play = function AnimationPlay() {
      // restore references to update and draw functions only if overridden
      if (update !== undefined) {
        this.update = update;
      }

      if (draw !== undefined) {
        this.draw = draw;
      }

      update = draw = undefined;
    };

    /**
     * Stop the animation and prevent update and draw.
     * @memberOf Animation
     */
    this.stop = function AnimationStop() {

      // instead of putting an if statement in both draw/update functions that checks
      // a variable to determine whether to draw or update, we can just reassign the
      // functions to noop and save processing time in the game loop.
      // @see http://jsperf.com/boolean-check-vs-noop
      //
      // this creates more logic in the setup functions, but one time logic is better than
      // continuous logic.

      // don't override if previously overridden
      if (update === undefined) {
        update = this.update;
        this.update = kontra.noop;
      }

      if (draw === undefined) {
        draw = this.draw;
        this.draw = kontra.noop;
      }
    };

    /**
     * Pause the animation and prevent update.
     * @memberOf Animation
     */
    this.pause = function AnimationPause() {
      // don't override if previously overridden
      if (update === undefined) {
        update = this.update;
        this.update = kontra.noop;
      }
    };

    /**
     * Go to a specific animation frame index.
     * @memberOf Animation
     *
     * @param {number} frame - Animation frame to go to.
     *
     * @example
     * sheet.createAnimation({
     *   run: { frames: [2,6,8,4,3] }
     * });
     * var run = sheet.getAnimation('run');
     * run.gotoFrame(2);  //=> animation will go to 8 (2nd index)
     * run.gotoFrame(0);  //=> animation will go to 2 (0th index)
     */
    this.gotoFrame = function AnimationGotoFrame(frame) {
      if (kontra.isNumber(frame) && frame >= 0 && frame < this.animationSequence.length) {
        currentFrame = frame;
        counter = 0;
      }
    };
  }

  return kontra;
})(kontra || {});
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
/*jshint -W084 */

/**
 * @fileoverview A tile engine for rendering tilesets.
 */
var kontra = (function(kontra, undefined) {
  /*
    want to handle:
      - multiple images
  */

  /**
   *
   */
   kontra.TileEngine = function TileEngine(properties) {
    properties = properties || {};

    var _this = this;
    var rendered = false;

    // since the tile engine can have more than one image, each image must be associated
    // with a unique set of tiles. This array will hold a reference to the tileset image
    // that each tile belongs to for quick access when drawing (i.e. O(1))
    var tileIndex = [undefined];  // index 0 is always an empty tile

    this.tileIndex = tileIndex;

    // size of the tiles
    // most common tile size on opengameart.org seems to be 32x32, followed by 16x16
    this.tileWidth = properties.tileWidth || 32;
    this.tileHeight = properties.tileHeight || 32;

    // size of the map (in tiles)
    this.width = properties.width || kontra.canvas.width / this.tileWidth | 0;
    this.height = properties.height || kontra.canvas.height / this.tileHeight | 0;

    // create an off-screen canvas for pre-rendering the map
    // @see http://jsperf.com/render-vs-prerender
    var offScreenCanvas = document.createElement('canvas');
    var offScreenContext = offScreenCanvas.getContext('2d');

    offScreenCanvas.width = this.width * this.tileWidth;
    offScreenCanvas.height = this.height * this.tileHeight;

    this.context = properties.context || kontra.context;
    this.layers = [];
    this.images = [];

    /**
     * Add an image for the tile engine to use.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string|Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    this.addImage = function TileEngineAddImage(properties) {
      properties = properties || {};

      if (kontra.isString(properties.image)) {
        var img = new Image();
        img.onload = function() {
          associateImage.call(_this, {image: this, firstTile: properties.firstTile});
        };
        img.src = properties.image;
      }
      else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        associateImage({image: properties.image, firstTile: properties.firstTile});
      }
    };

    /**
     * Associate an image with its tiles.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string|Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    function associateImage(properties) {
      var image = properties.image;
      var startTile = properties.firsTile || tileIndex.length;

      image.tileWidth = image.width / this.tileWidth;
      image.tileHeight = image.height / this.tileHeight;
      image.startTile = startTile;

      this.images.push(image);

      // associate the new image tiles with the image
      for (var i = 0, len = image.tileWidth * image.tileHeight; i < len; i++) {
        // objects are just pointers so storing an object is only storing a pointer of 4 bytes
        // @see http://stackoverflow.com/questions/4740593/how-is-memory-handled-with-javascript-objects
        tileIndex[startTile + i] = image;
      }
    }

    /**
     * Add a layer.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties -
     * @param {number[]} properties.data - Tile layer data.
     * @param {number} properties.index - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     * @param {string} properties.name - Layer name.
     */
    this.addLayer = function TileEngineAddLayer(properties) {
      properties = properties || {};

      this.layers.push({
        name: properties.name,
        data: properties.data,
        index: properties.index
      });

      // sort the layers by index
      // default sort method is good enough for small lists
      this.layers.sort(function(a, b) {
        return a.index - b.index;
      });

      // pre-render the canvas when a new layer is added (i.e the only time the map
      // should change)
      preRenderImage.call(this);
    };

    /**
     *
     * @memberOf kontra.TileEngine
     */
    this.draw = function TileEngineDraw() {
      this.context.drawImage(offScreenCanvas, 0, 0);
    };

    /**
     * Pre-render the tiles to make drawing fast.
     */
    function preRenderImage() {
      var tile, image, x, y, sx, sy;

      // draw each layer in order
      for (var i = 0, layer; layer = this.layers[i]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          image = tileIndex[tile];

          x = (j % this.width) * this.tileWidth;
          y = (j / this.width | 0) * this.tileHeight;

          var tileOffset = tile - image.startTile;

          sx = (tileOffset % image.tileWidth) * this.tileWidth;
          sy = (tileOffset / image.tileWidth | 0) * this.tileHeight;

          offScreenContext.drawImage(image, sx, sy, this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight);
        }
      }

      rendered = true;
    }
  };

  return kontra;
})(kontra || {});
var kontra = (function(kontra, Math) {
  kontra.Vector = Vector;

  /**
   * A vector for 2d space.
   * @memberOf kontra
   * @constructor
   *
   * @param {number} x=0 - Center x coordinate.
   * @param {number} y=0 - Center y coordinate.
   */
  function Vector(x, y) {
    this.set(x, y);
  }

  /**
   * Set the vector's x and y position.
   * @memberOf kontra.Vector
   *
   * @param {number} x - Center x coordinate.
   * @param {number} y - Center y coordinate.
   */
  Vector.prototype.set = function VecotrSet(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };

  /**
   * Add a vector to this vector.
   * @memberOf kontra.Vector
   *
   * @param {Vector} vector - Vector to add.
   */
  Vector.prototype.add = function VectorAdd(vector) {
    this.x += vector.x;
    this.y += vector.y;
  };

  /**
   * Get the length of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.length = function VecotrLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  /**
   * Get the angle of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.angle = function VectorAnagle() {
    return Math.atan2(this.y, this.x);
  };

  /**
   * Get a new vector from an angle and magnitude
   * @memberOf kontra.Vector
   *
   * @returns {Vector}
   */
  Vector.prototype.fromAngle = function VectorFromAngle(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  };

  return kontra;
})(kontra || {}, Math);