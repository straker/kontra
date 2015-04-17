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
var kontra = (function(kontra) {
  var isImage = /(jpeg|jpg|gif|png)$/;
  var isAudio = /(wav|mp3|ogg|aac|m4a)$/;
  var folderSeparator = /(\\|\/)/g;

  // all assets are stored by name as well as by URL
  kontra.images = {};
  kontra.audios = {};
  kontra.data = {};

  // base asset path for determining asset URLs
  kontra.assetPaths = {
    images: '',
    audios: '',
    data: '',
  };

  // audio playability
  // @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
  var audio = new Audio();
  kontra.canUse = kontra.canUse || {};
  kontra.canUse.wav = '';
  kontra.canUse.mp3 = audio.canPlayType('audio/mpeg;').replace(/^no$/,'');
  kontra.canUse.ogg = audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
  kontra.canUse.aac = audio.canPlayType('audio/aac;').replace(/^no$/,'');
  kontra.canUse.m4a = (audio.canPlayType('audio/x-m4a;') || kontra.canUse.aac).replace(/^no$/,'');

  /**
   * Get the extension of an asset.
   * @see http://jsperf.com/extract-file-extension
   * @memberOf kontra
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  kontra.getAssetExtension = function getAssetExtension(url) {
    return url.substr((~-url.lastIndexOf(".") >>> 0) + 2);
  };

  /**
   * Get the type of asset based on its extension.
   * @memberOf kontra
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string} Image, Audio, Data.
   */
  kontra.getAssetType = function getAssetType(url) {
    var extension = this.getAssetExtension(url);

    if (extension.match(isImage)) {
      return 'Image';
    }
    else if (extension.match(isAudio)) {
      return 'Audio';
    }
    else {
      return 'Data';
    }
  };

  /**
   * Get the name of an asset.
   * @memberOf kontra
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  kontra.getAssetName = function getAssetName(url) {
    return url.replace(/\.[^/.]+$/, "");
  };

  return kontra;
})(kontra || {});
/*jshint -W084 */

var kontra = (function(kontra, q) {
  /**
   * Load an Image, Audio, or data file.
   * @memberOf kontra
   *
   * @param {string|string[]} - Comma separated list of assets to load.
   *
   * @returns {Promise} A deferred promise.
   *
   * @example
   * kontra.loadAsset('car.png');
   * kontra.loadAsset(['explosion.mp3', 'explosion.ogg']);
   * kontra.loadAsset('bio.json');
   * kontra.loadAsset('car.png', ['explosion.mp3', 'explosion.ogg'], 'bio.json');
   */
  kontra.loadAssets = function loadAsset() {
    var deferred = q.defer();
    var promises = [];
    var numLoaded = 0;
    var numAssets = arguments.length;
    var type, name, url;

    if (!arguments.length) {
      deferred.resolve();
    }

    for (var i = 0, asset; asset = arguments[i]; i++) {
      if (!Array.isArray(asset)) {
        url = asset;
      }
      else {
        url = asset[0];
      }

      type = this.getAssetType(url);

      // create a closure for event binding
      (function(assetDeferred) {
        promises.push(assetDeferred.promise);

        kontra['load' + type](url).then(
          function loadAssetSuccess() {
            assetDeferred.resolve();
            deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
          },
          function loadAssetError(error) {
            assetDeferred.reject(error);
        });
      })(q.defer());
    }

    q.all(promises).then(
      function loadAssetsSuccess() {
        deferred.resolve();
      },
      function loadAssetsError(error) {
        deferred.reject(error);
    });

    return deferred.promise;
  };

  /**
   * Load an Image file. Uses assetPaths.images to resolve URL.
   * @memberOf kontra
   *
   * @param {string} url - The URL to the Image file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Image.
   *
   * @example
   * kontra.loadImage('car.png');
   * kontra.loadImage('autobots/truck.png');
   */
  kontra.loadImage = function(url) {
    var deferred = q.defer();
    var name = this.getAssetName(url);
    var image = new Image();

    url = this.assetPaths.images + url;

    image.onload = function loadImageOnLoad() {
      kontra.images[name] = kontra.images[url] = this;
      deferred.resolve(this);
    };

    image.onerror = function loadImageOnError() {
      deferred.reject('Unable to load image ' + url);
    };

    image.src = url;

    return deferred.promise;
  };

  /**
   * Load an Audio file. Supports loading multiple audio formats which will be resolved by
   * the browser in the order listed. Uses assetPaths.audios to resolve URL.
   * @memberOf kontra
   *
   * @param {string|string[]} url - The URL to the Audio file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Audio.
   *
   * @example
   * kontra.loadAudio('sound_effects/laser.mp3');
   * kontra.loadAudio(['explosion.mp3', 'explosion.m4a', 'explosion.ogg']);
   *
   * There are two ways to load Audio in the web: HTML5 Audio or the Web Audio API.
   * HTML5 Audio has amazing browser support, including back to IE9
   * (http://caniuse.com/#feat=audio). However, the web Audio API isn't supported in
   * IE nor Android Browsers (http://caniuse.com/#search=Web%20Audio%20API).
   *
   * To support the most browsers we'll use HTML5 Audio. However, doing so means we'll
   * have to work around mobile device limitations as well as Audio implementation
   * limitations.
   *
   * Android browsers require playing Audio through user interaction whereas iOS 6+ can
   * play through normal JavaScript. Moreover, Android can only play one sound source at
   * a time whereas iOS 6+ can handle more than one. See this article for more details
   * (http://pupunzi.open-lab.com/2013/03/13/making-html5-audio-actually-work-on-mobile/)
   *
   * Both iOS and Android will download an Audio through JavaScript, but neither will play
   * it until user interaction. You can get around this issue by having a splash screen
   * that requires user interaction to start the game and using that event to play the audio.
   * (http://jsfiddle.net/straker/5dsm6jgt/)
   */
  kontra.loadAudio = function(url) {
    var deferred = q.defer();
    var source, name, playableSource, audio;

    if (!Array.isArray(url)) {
      url = [url];
    }

    // determine which audio format the browser can play
    for (var i = 0; source = url[i]; i++) {
      if ( this.canUse[this.getAssetExtension(source)] ) {
        playableSource = source;
        break;
      }
    }

    if (!playableSource) {
      deferred.reject('Browser cannot play any of the audio formats provided');
    }
    else {
      name = this.getAssetName(playableSource);
      audio = new Audio();

      source = this.assetPaths.audios + playableSource;

      audio.addEventListener('canplay', function loadAudioOnLoad() {
        kontra.audios[name] = kontra.audios[source] = this;
        deferred.resolve(this);
      });

      audio.onerror = function loadAudioOnError() {
        deferred.reject('Unable to load audio ' + source);
      };

      audio.src = source;
      audio.preload = 'auto';
      audio.load();
    }

    return deferred.promise;
  };


  /**
   * Load a data file (be it text or JSON). Uses assetPaths.data to resolve URL.
   * @memberOf kontra
   *
   * @param {string} url - The URL to the data file.
   *
   * @returns {Promise} A deferred promise. Resolves with the data or parsed JSON.
   *
   * @example
   * kontra.loadData('bio.json');
   * kontra.loadData('dialog.txt');
   */
  kontra.loadData = function(url) {
    var deferred = q.defer();
    var req = new XMLHttpRequest();
    var name = this.getAssetName(url);
    var dataUrl = this.assetPaths.data + url;

    req.addEventListener('load', function loadDataOnLoad() {
      if (req.status !== 200) {
        deferred.reject(req.responseText);
        return;
      }

      try {
        var json = JSON.parse(req.responseText);
        kontra.data[name] = kontra.data[dataUrl] = json;

        deferred.resolve(json);
      }
      catch(e) {
        var data = req.responseText;
        kontra.data[name] = kontra.data[dataUrl] = data;

        deferred.resolve(data);
      }
    });

    req.open('GET', dataUrl, true);
    req.send();

    return deferred.promise;
  };

  return kontra;
})(kontra || {}, q);
/*jshint -W084 */

var kontra = (function(kontra, q) {
  kontra.bundles = {};

  /**
   * Create a group of assets that can be loaded using <code>kontra.loadBundle()</code>.
   * @memberOf kontra
   *
   * @param {string} bundle - The name of the bundle.
   * @param {string[]} assets - Assets to add to the bundle.
   *
   * @example
   * kontra.createBundle('myBundle', ['car.png', ['explosion.mp3', 'explosion.ogg']]);
   */
  kontra.createBundle = function createBundle(bundle, assets) {
    if (this.bundles[bundle]) {
      return;
    }

    this.bundles[bundle] = assets || [];
  };

  /**
   * Load all assets that are part of a bundle.
   * @memberOf kontra
   *
   * @param {string|string[]} - Comma separated list of bundles to load.
   *
   * @returns {Promise} A deferred promise.
   *
   * @example
   * kontra.loadBundles('myBundle');
   * kontra.loadBundles('myBundle', 'myOtherBundle');
   */
  kontra.loadBundles = function loadBundles() {
    var deferred = q.defer();
    var promises = [];
    var numLoaded = 0;
    var numAssets = 0;
    var assets;

    for (var i = 0, bundle; bundle = arguments[i]; i++) {
      if (!(assets = this.bundles[bundle])) {
        deferred.reject('Bundle \'' + bundle + '\' has not been created.');
        continue;
      }

      numAssets += assets.length;

      promises.push(this.loadAssets.apply(this, assets));
    }

    q.all(promises).then(
      function loadBundlesSuccess() {
        deferred.resolve();
      },
      function loadBundlesError(error) {
        deferred.reject(error);
      },
      function loadBundlesNofity() {
        deferred.notify({'loaded': ++numLoaded, 'total': numAssets});
    });

    return deferred.promise;
  };

  return kontra;
})(kontra || {}, q);
/*jshint -W084 */

var kontra = (function(kontra, q) {
  /**
   * Load an asset manifest file.
   * @memberOf kontra
   *
   * @param {string} url - The URL to the asset manifest file.
   *
   * @returns {Promise} A deferred promise.
   */
  kontra.loadManifest = function loadManifest(url) {
    var deferred = q.defer();
    var bundles;

    kontra.loadData(url).then(
      function loadManifestSuccess(manifest) {
        kontra.assetPaths.images = manifest.imagePath || '';
        kontra.assetPaths.audios = manifest.audioPath || '';
        kontra.assetPaths.data = manifest.dataPath || '';

        // create bundles and add assets
        for (var i = 0, bundle; bundle = manifest.bundles[i]; i++) {
          kontra.createBundle(bundle.name, bundle.assets);
        }

        if (!manifest.loadBundles) {
          deferred.resolve();
          return;
        }

        // load all bundles
        if (manifest.loadBundles === 'all') {
          bundles = Object.keys(kontra.bundles || {});
        }
        // load a single bundle
        else if (!Array.isArray(manifest.loadBundles)) {
          bundles = [manifest.loadBundles];
        }
        // load multiple bundles
        else {
          bundles = manifest.loadBundles;
        }

        kontra.loadBundles.apply(kontra, bundles).then(
          function loadBundlesSuccess() {
            deferred.resolve();
          },
          function loadBundlesError(error) {
            deferred.reject(error);
          },
          function loadBundlesNotify(progress) {
            deferred.notify(progress);
        });
      },
      function loadManifestError(error) {
        deferred.reject(error);
    });

    return deferred.promise;
  };

  return kontra;
})(kontra || {}, q);
/* global console */

var kontra = (function(kontra, document) {
  'use strict';

  /**
   * Set up the canvas.
   * @memberOf kontra
   *
   * @param {object} properties - Properties for the game.
   * @param {string|Canvas} properties.canvas - Main canvas ID or Element for the game.
   */
  kontra.init = function init(properties) {
    properties = properties || {};

    if (kontra.isString(properties.canvas)) {
      this.canvas = document.getElementById(properties.canvas);
    }
    else if (kontra.isCanvas(properties.canvas)) {
      this.canvas = properties.canvas;
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
   * Throw an error message to the user with readable formating.
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
var kontra = (function(kontra, window, document) {
  'use strict';

  /**
   * Returns the current time. Uses the User Timing API if it's available or defaults to
   * using Date().getTime()
   * @private
   *
   * @returns {number}
   */
  kontra.timestamp = (function() {
    if (window.performance && window.performance.now) {
      return function timestampPerformance() {
        return window.performance.now();
      };
    }
    else {
      return function timestampDate() {
        return new Date().getTime();
      };
    }
  })();





  /**
   * Game loop that updates and renders the game every frame.
   * @memberOf kontra
   *
   * @see kontra.gameLoop._prot.set for list of params
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop._proto);
    gameLoop.set(properties);

    return gameLoop;
  };

  kontra.gameLoop._proto = {
    /**
     * Set properties on the game loop.
     * @memberOf kontra.gameLoop
     *
     * @param {object}   properties - Configure the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    set: function(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra.logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);

      this._update = properties.update;
      this._render = properties.render;
    },

    /**
     * Start the game loop.
     * @memberOf kontra.gameLoop
     */
    start: function() {
      this._last = kontra.timestamp();
      requestAnimationFrame(this.frame.bind(this));
    },

    /**
     * Called every frame of the game loop.
     * @memberOf kontra.gameLoop
     */
    frame: function() {
      this._rAF = requestAnimationFrame(this.frame.bind(this));

      this._now = kontra.timestamp();
      this._dt = this._now - this._last;
      this._last = this._now;

      // this prevents updating the game with a very large dt if the game were to
      // lose focus and then regain focus later
      if (this._dt > 1E3) {
        return;
      }

      this._accumulator += this._dt;

      while (this._accumulator >= this._delta) {
        this._update(this._delta);

        this._accumulator -= this._delta;
      }

      this._render();
    },

    /**
     * Stop the game loop.
     */
    stop: function() {
      cancelAnimationFrame(this._rAF);
    }
  };

  return kontra;
})(kontra || {}, window, document);
/*jshint -W084 */

var kontra = (function(kontra, window) {
  'use strict';

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
  for (var i = 0; i < 26; i++) {
    keyMap[65+i] = String.fromCharCode(65+i).toLowerCase();
  }
  // numeric keys
  for (i = 0; i < 10; i++) {
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
    for (var i = 0, modifier; modifier = modifierOrder[i]; i++) {
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
  'use strict';

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
   * Objects inside the pool must implement <code>render()</code>, <code>update()</code>,
   * <code>set()</code>, and <code>isAlive()</code> functions.
   */
  function Pool(properties) {
    properties = properties || {};

    // ensure objects for the pool have required functions
    var obj = new properties.Object();
    if (typeof obj.render !== 'function' || typeof obj.update !== 'function' ||
        typeof obj.set !== 'function' || typeof obj.isAlive !== 'function') {
      var error = new ReferenceError('Required function not found.');
      kontra.logError(error, 'Objects to be pooled must implement render(), update(), set() and isAlive() functions.');
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

    obj.set(properties);
    this.objects[this.lastIndex] = obj;

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
   * render all alive pool objects.
   * @memberOf kontra.Pool
   */
  Pool.prototype.render = function() {
    for (var i = this.lastIndex, obj; obj = this.objects[i]; i--) {

      // once we find the first object that is not alive we can stop
      if (!obj.isAlive()) {
        return;
      }

      obj.render();
    }
  };

  return kontra;
})(kontra || {});
var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2d space.
   * @memberOf kontra
   *
   * @see kontra.vector._prot.set for list of params
   */
  kontra.vector = function(x, y) {
    var vector = Object.create(kontra.vector._proto);
    vector.set(x, y);

    return vector;
  };

  kontra.vector._proto = {
    /**
     * Set the vector's x and y position.
     * @memberOf kontra.vector
     *
     * @param {number} x=0 - Center x coordinate.
     * @param {number} y=0 - Center y coordinate.
     */
    set: function(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    },

    /**
     * Add a vector to this vector.
     * @memberOf kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt - Time since last update.
     */
    add: function(vector, dt) {
      this.x += vector.x * (dt || 1);
      this.y += vector.y * (dt || 1);
    },

    /**
     * Get the length of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    length: function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Get the angle of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    angle: function() {
      return Math.atan2(this.y, this.x);
    },

    /**
     * Get a new vector from an angle and magnitude
     * @memberOf kontra.vector
     *
     * @returns {vector}
     */
    fromAngle: function(angle, magnitude) {
      return vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   * @requires kontra.vector
   *
   * @see kontra.sprite._prot.set for list of params
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite._proto);
    sprite.position = kontra.vector();
    sprite.velocity = kontra.vector();
    sprite.acceleration = kontra.vector();
    sprite.set(properties);

    return sprite;
  };

  kontra.sprite._proto = {
    /**
     * Move the sprite by its velocity.
     * @memberOf kontra.Sprite
     *
     * @param {number} dt - Time since last update.
     */
    advance: function(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Draw the sprite.
     * @memberOf kontra.Sprite
     */
    draw: function() {
      this.context.drawImage(this.image, this.position.x, this.position.y);
    },

    /**
     * Determine if the sprite is alive.
     * @memberOf kontra.Sprite
     *
     * @returns {boolean}
     */
    isAlive: function() {
      return this.timeToLive > 0;
    },

    /**
     * Set properties on the sprite.
     * @memberOf kontra.Sprite
     *
     * @param {object} properties - Properties to set on the sprite.
     * @param {number} properties.x - X coordinate of the sprite.
     * @param {number} properties.y - Y coordinate of the sprite.
     * @param {number} [properties.dx] - Change in X position.
     * @param {number} [properties.dy] - Change in Y position.
     * @param {number} [properties.ddx] - Change in X velocity.
     * @param {number} [properties.ddy] - Change in Y velocity.
     * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
     * @param {Image|Canvas} [properties.image] - Image for the sprite.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     * @param {function} [properties.update] - Function to use to update the sprite.
     * @param {function} [properties.render] - Function to use to render the sprite.
     *
     * If you need the sprite to live forever, or just need it to stay on screen until you
     * decide when to kill it, you can set time to live to <code>Infinity</code>. Just be
     * sure to override the <code>isAlive()</code> function to return true when the sprite
     * should die.
     *
     * @returns {Sprite}
     */
    set: function(properties) {
      properties = properties || {};

      this.position.set(properties.x, properties.y);
      this.velocity.set(properties.dx, properties.dy);
      this.acceleration.set(properties.ddx, properties.ddy);
      this.timeToLive = properties.timeToLive || 0;

      this.context = properties.context || kontra.context;

      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        this.image = properties.image;
        this.width = this.image.width;
        this.height = this.image.height;
      }
      else {
        // make the render function for this sprite a noop since there is no image to draw.
        // this.render/this.draw should be overridden if you want to draw something else.
        this.render = kontra.noop;
      }

      if (properties.update) {
        this.update = properties.update;
      }

      if (properties.render) {
        this.render = properties.render;
      }
    },

    /**
     * Update the sprites velocity and position.
     * @memberOf kontra.Sprite
     * @abstract
     *
     * @param {number} dt - Time since last update.
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the update step. Just call <code>this.advance()</code> when you need
     * the sprite to update its position.
     *
     * @example
     * sprite = new kontra.Sprite({
     *   update: function update(dt) {
     *     // do some logic
     *
     *     this.advance(dt);
     *   }
     * });
     *
     * @returns {Sprite}
     */
    update: function(dt) {
      this.advance(dt);
    },

    /**
     * Render the sprite.
     * @memberOf kontra.Sprite.
     * @abstract
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the render step. Just call <code>this.draw()</code> when you need the
     * sprite to draw its image.
     *
     * @example
     * sprite = new kontra.Sprite({
     *   render: function render() {
     *     // do some logic
     *
     *     this.draw();
     *   }
     * });
     *
     * @returns {Sprite}
     */
    render: function() {
      this.draw();
    }
  };

  return kontra;
})(kontra || {}, Math);
/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  'use strict';

  kontra.SpriteSheet = SpriteSheet;

  /**
   * Create a sprite sheet from an image.
   * @memberOf kontra
   * @constructor
   *
   * @param {object} properties - Configure the sprite sheet.
   * @param {Image|Canvas} properties.image - Image for the sprite sheet.
   * @param {number} properties.frameWidth - Width (in px) of each frame.
   * @param {number} properties.frameHeight - Height (in px) of each frame.
   */
  function SpriteSheet(properties) {
    properties = properties || {};

    this.animations = {};

    if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
      this.image = properties.image;
      this.frameWidth = properties.frameWidth;
      this.frameHeight = properties.frameHeight;

      this.framesPerRow = this.image.width / this.frameWidth | 0;
    }
    else {
      var error = new SyntaxError('Invalid image.');
      kontra.logError(error, 'You must provide an Image for the SpriteSheet.');
      return;
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
   * var sheet = kontra.SpriteSheet(img, 16, 16);
   * sheet.createAnimation({
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
   * });
   */
  SpriteSheet.prototype.createAnimation = function SpriteSheetCreateAnimation(animations) {
    var error;

    if (!animations || Object.keys(animations).length === 0) {
      error = new SyntaxError('No animations found.');
      kontra.logError(error, 'You must provide at least one named animation to create an Animation.');
      return;
    }

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
  'use strict';

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

var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberOf kontra
   * @constructor
   *
   * @param {object} properties - Configure the tile engine.
   * @param {number} properties.tileWidth - Width of the tile.
   * @param {number} properties.tileHeight - Height of the tile.
   * @param {number} properties.width - Width of the map (in tiles).
   * @param {number} properties.height - Height of the map (in tiles).
   * @param {Context} [properties.context=kontra.context] - Provide a context for the tile engine to draw on.
   */
   kontra.TileEngine = function TileEngine(properties) {
    properties = properties || {};

    var _this = this;

    // since the tile engine can have more than one image, each image must be associated
    // with a unique set of tiles. This array will hold a reference to the tileset image
    // that each tile belongs to for quick access when drawing (i.e. O(1))
    var tileIndex = [undefined];  // index 0 is always an empty tile

    // draw order of layers (by name)
    var layerOrder = [];

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
    this.layers = {};
    this.images = [];

    /**
     * Add an image for the tile engine to use.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string} properties.name - Name of the image.
     * @param {string|Image|Canvas} properties.image - Path to the image or Image object.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    this.addImage = function TileEngineAddImage(properties) {
      properties = properties || {};

      if (kontra.isString(properties.image)) {
        kontra.loadImage(properties.image, properties.name).then(
          function loadImageSuccess(image) {
            associateImage({image: image, firstTile: properties.firstTile});
          }, function loadImageError(error) {
            console.error(error);
            return;
        });
      }
      else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        associateImage({image: properties.image, firstTile: properties.firstTile});
      }
    };

    /**
     * Remove an image from the tile engine.
     * @memberOf kontra.TileEngine
     *
     * @param {string} name - Name of the image to remove.
     */
    this.removeImage = function TileEngineRemoveImage(name) {
      var image = kontra.assets[name];

      // unassociate image from tiles
      for (var i = image.firstTile, len = image.tileWidth * image.tileHeight; i <= len; i++) {
        tileIndex[i] = null;
      }

      for (var j = 0, img; img = this.images[j]; j++) {
        if (image === img) {
          this.images.splice(j, 1);
        }
      }
    };


    /**
     * Add a layer to the tile engine.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the layer to add.
     * @param {string} properties.name - Name of the layer.
     * @param {number[]} properties.data - Tile layer data.
     * @param {number} properties.index - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     */
    this.addLayer = function TileEngineAddLayer(properties) {
      properties = properties || {};

      this.layers[properties.name] = {
        data: properties.data,
        index: properties.index
      };

      layerOrder.push(properties.name);

      layerOrder.sort(function(a, b) {
        return _this.layers[a].index - _this.layers[b].index;
      });

      preRenderImage();
    };

    /**
     * Remove a layer from the tile engine.
     * @memberOf kontra.TileEngine
     *
     * @param {string} name - Name of the layer to remove.
     */
    this.removeLayer = function TileEngineRemoveLayer(name) {
      this.layers[name] = null;
    };

    /**
     * Draw the pre-rendered canvas.
     * @memberOf kontra.TileEngine
     */
    this.draw = function TileEngineDraw() {
      this.context.drawImage(offScreenCanvas, 0, 0);
    };

    /**
     * Associate an image with its tiles.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    function associateImage(properties) {
      var image = properties.image;
      var firstTile = properties.firstTile || tileIndex.length;

      image.tileWidth = image.width / _this.tileWidth;
      image.tileHeight = image.height / _this.tileHeight;
      image.firstTile = firstTile;

      _this.images.push(image);

      // associate the new image tiles with the image
      for (var i = 0, len = image.tileWidth * image.tileHeight; i < len; i++) {
        // objects are just pointers so storing an object is only storing a pointer of 4 bytes,
        // which is the same as storing a number
        // @see http://stackoverflow.com/questions/4740593/how-is-memory-handled-with-javascript-objects
        // @see http://stackoverflow.com/questions/16888036/javascript-how-to-reduce-the-memory-size-of-a-number
        tileIndex[firstTile + i] = image;
      }

      preRenderImage();
    }

    /**
     * Pre-render the tiles to make drawing fast.
     */
    function preRenderImage() {
      var tile, image, x, y, sx, sy;

      // draw each layer in order
      for (var i = 0, layer; layer = _this.layers[layerOrder[i]]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0) and skip images that haven't been loaded yet as
          // they'll pre-render when they are done loading
          if (!tile || !tileIndex[tile]) {
            continue;
          }

          image = tileIndex[tile];

          x = (j % _this.width) * _this.tileWidth;
          y = (j / _this.width | 0) * _this.tileHeight;

          var tileOffset = tile - image.firstTile;

          sx = (tileOffset % image.tileWidth) * _this.tileWidth;
          sy = (tileOffset / image.tileWidth | 0) * _this.tileHeight;

          offScreenContext.drawImage(image, sx, sy, _this.tileWidth, _this.tileHeight, x, y, _this.tileWidth, _this.tileHeight);
        }
      }
    }
  };

  return kontra;
})(kontra || {});