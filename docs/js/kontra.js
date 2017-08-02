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
/*jshint -W084 */

var kontra = (function(kontra, q) {
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
   * @private
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  kontra._getAssetExtension = function getAssetExtension(url) {
    return url.substr((~-url.lastIndexOf(".") >>> 0) + 2);
  };

  /**
   * Get the type of asset based on its extension.
   * @memberOf kontra
   * @private
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string} Image, Audio, Data.
   */
  kontra._getAssetType = function getAssetType(url) {
    var extension = this._getAssetExtension(url);

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
   * @private
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  kontra._getAssetName = function getAssetName(url) {
    return url.replace(/\.[^/.]+$/, "");
  };

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

      type = this._getAssetType(url);

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
    var name = this._getAssetName(url);
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
      if ( this.canUse[this._getAssetExtension(source)] ) {
        playableSource = source;
        break;
      }
    }

    if (!playableSource) {
      deferred.reject('Browser cannot play any of the audio formats provided');
    }
    else {
      name = this._getAssetName(playableSource);
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
    var name = this._getAssetName(url);
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
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  kontra.init = function init(canvas) {
    if (kontra._isString(canvas)) {
      this.canvas = document.getElementById(canvas);
    }
    else if (kontra._isCanvas(canvas)) {
      this.canvas = canvas;
    }
    else {
      this.canvas = document.getElementsByTagName('canvas')[0];

      if (!this.canvas) {
        var error = new ReferenceError('No canvas element found.');
        kontra._logError(error, 'You must provide a canvas element for the game.');
        return;
      }
    }

    this.context = this.canvas.getContext('2d');
  };

  /**
   * Throw an error message to the user with readable formating.
   * @memberof kontra
   * @private
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra._logError = function logError(error, message) {
    console.error('Kontra: ' + message + '\n\t' + error.stack);
  };

  /**
   * Noop function.
   * @memberof kontra
   * @private
   */
  kontra._noop = function noop() {};

  /**
   * Determine if a value is a String.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Determine if a value is a Number.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  /**
   * Determine if a value is an Image.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isImage = function isImage(value) {
    return value instanceof HTMLImageElement;
  };

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra._isCanvas = function isCanvas(value) {
    return value instanceof HTMLCanvasElement;
  };

  return kontra;
})(kontra || {}, document);
var kontra = (function(kontra, window) {
  'use strict';

  /**
   * Get the current time. Uses the User Timing API if it's available or defaults to using
   * Date().getTime()
   * @memberof kontra
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
   * @memberof kontra
   *
   * @see kontra.gameLoop.prototype.init for list of parameters.
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop.prototype);
    gameLoop.init(properties);

    return gameLoop;
  };

  kontra.gameLoop.prototype = {
    /**
     * Initialize properties on the game loop.
     * @memberof kontra.gameLoop
     *
     * @param {object}   properties - Properties of the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    init: function init(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra._logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      this.isStopped = true;

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);
      this._step = 1 / (properties.fps || 60);

      this.update = properties.update;
      this.render = properties.render;

      if (properties.clearCanvas === false) {
        this._clearCanvas = kontra._noop;
      }
    },

    /**
     * Start the game loop.
     * @memberof kontra.gameLoop
     */
    start: function start() {
      this._last = kontra.timestamp();
      this.isStopped = false;
      requestAnimationFrame(this._frame.bind(this));
    },

    /**
     * Stop the game loop.
     */
    stop: function stop() {
      this.isStopped = true;
      cancelAnimationFrame(this._rAF);
    },

    /**
     * Called every frame of the game loop.
     * @memberof kontra.gameLoop
     * @private
     */
    _frame: function frame() {
      this._rAF = requestAnimationFrame(this._frame.bind(this));

      this._now = kontra.timestamp();
      this._dt = this._now - this._last;
      this._last = this._now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (this._dt > 1E3) {
        return;
      }

      this._accumulator += this._dt;

      while (this._accumulator >= this._delta) {
        this.update(this._step);

        this._accumulator -= this._delta;
      }

      this._clearCanvas();
      this.render();
    },

    /**
     * Clear the canvas on every frame.
     * @memberof kontra.gameLoop
     * @private
     */
    _clearCanvas: function clearCanvas() {
      kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
    }
  };

  return kontra;
})(kontra || {}, window);
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
    'select': 'meta'       // mac
  };

  // modifier order for combinations
  var modifierOrder = ['meta', 'ctrl', 'alt', 'shift'];

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler);

  /**
   * Object for using the keyboard.
   */
  kontra.keys = {};

  /**
   * Register a function to be called on a keyboard keys.
   * Please note that not all keyboard combinations can be executed due to ghosting.
   * @memberof kontra.keys
   *
   * @param {string|string[]} keys - keys combination string(s).
   *
   * @throws {SyntaxError} If callback is not a function.
   */
  kontra.keys.bind = function bindKey(keys, callback) {
    if (typeof callback !== 'function') {
      var error = new SyntaxError('Invalid function.');
      kontra._logError(error, 'You must provide a function as the second parameter.');
      return;
    }

    keys = (Array.isArray(keys) ? keys : [keys]);

    for (var i = 0, key; key = keys[i]; i++) {
      var combination = normalizeKeys(key);

      callbacks[combination] = callback;
    }
  };

  /**
   * Remove the callback function for a key combination.
   * @memberof kontra.keys
   *
   * @param {string|string[]} keys - keys combination string.
   */
  kontra.keys.unbind = function unbindKey(keys) {
    keys = (Array.isArray(keys) ? keys : [keys]);

    for (var i = 0, key; key = keys[i]; i++) {
      var combination = normalizeKeys(key);

      callbacks[combination] = undefined;
    }
  };

  /**
   * Returns whether a key is pressed.
   * @memberof kontra.keys
   *
   * @param {string} keys - Keys combination string.
   *
   * @returns {boolean}
   */
  kontra.keys.pressed = function keyPressed(keys) {
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
    else if (keys) {
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
var kontra = (function(kontra) {
  'use strict';

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @see kontra.pool.prototype.init for list of parameters.
   */
  kontra.pool = function(properties) {
    var pool = Object.create(kontra.pool.prototype);
    pool.init(properties);

    return pool;
  };

  kontra.pool.prototype = {
    /**
     * Initialize properties on the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties of the pool.
     * @param {object} properties.create - Function that returns the object to use in the pool.
     * @param {object} properties.createProperties - Properties that will be passed to the create function.
     * @param {number} properties.maxSize - The maximum size that the pool will grow to.
     * @param {boolean} properties.fill - Fill the pool to max size instead of slowly growing.
     *
     * Objects inside the pool must implement <code>render()</code>, <code>update()</code>,
     * <code>init()</code>, and <code>isAlive()</code> functions.
     */
    init: function init(properties) {
      properties = properties || {};

      var error, obj;

      // check for the correct structure of the objects added to pools so we know that the
      // rest of the pool code will work without errors
      if (typeof properties.create !== 'function') {
        error = new SyntaxError('Required function not found.');
        kontra._logError(error, 'Parameter \'create\' must be a function that returns an object.');
        return;
      }

      // bind the create function to always use the create properties
      this.create = properties.create.bind(this, properties.createProperties || {});

      // ensure objects for the pool have required functions
      obj = this.create();

      if (!obj || typeof obj.render !== 'function' || typeof obj.update !== 'function' ||
          typeof obj.init !== 'function' || typeof obj.isAlive !== 'function') {
        error = new SyntaxError('Create object required functions not found.');
        kontra._logError(error, 'Objects to be pooled must implement render(), update(), init() and isAlive() functions.');
        return;
      }

      // start the pool with an object
      this.objects = [obj];
      this.size = 1;
      this.maxSize = properties.maxSize || Infinity;
      this.lastIndex = 0;
      this.inUse = 0;

      // fill the pool
      if (properties.fill) {
        if (properties.maxSize) {
          while (this.objects.length < this.maxSize) {
            this.objects.unshift(this.create());
          }

          this.size = this.maxSize;
          this.lastIndex = this.maxSize - 1;
        }
        else {
          error = new SyntaxError('Required property not found.');
          kontra._logError(error, 'Parameter \'maxSize\' must be set before you can fill a pool.');
          return;
        }
      }
    },

    /**
     * Get an object from the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties to pass to object.init().
     */
    get: function get(properties) {
      properties = properties || {};

      // the pool is out of objects if the first object is in use and it can't grow
      if (this.objects[0].isAlive()) {
        if (this.size === this.maxSize) {
          return;
        }
        // double the size of the array by filling it with twice as many objects
        else {
          for (var x = 0; x < this.size && this.objects.length < this.maxSize; x++) {
            this.objects.unshift(this.create());
          }

          this.size = this.objects.length;
          this.lastIndex = this.size - 1;
        }
      }

      // save off first object in pool to reassign to last object after unshift
      var obj = this.objects[0];
      obj.init(properties);

      // unshift the array
      for (var i = 1; i < this.size; i++) {
        this.objects[i-1] = this.objects[i];
      }

      this.objects[this.lastIndex] = obj;
      this.inUse++;
    },

    /**
     * Return all objects that are alive from the pool.
     * @memberof kontra.pool
     *
     * @returns {object[]}
     */
    getAliveObjects: function getAliveObjects() {
      return this.objects.slice(this.objects.length - this.inUse);
    },

    /**
     * Clear the object pool.
     * @memberof kontra.pool
     */
    clear: function clear() {
      this.inUse = 0;
      this.size = 1;
      this.lastIndex = 0;
      this.objects.length = 0;
      this.objects.push(this.create());
    },

    /**
     * Update all alive pool objects.
     * @memberof kontra.pool
     *
     * @param {number} dt - Time since last update.
     */
    update: function update(dt) {
      var i = this.lastIndex;
      var obj;

      // If the user kills an object outside of the update cycle, the pool won't know of
      // the change until the next update and inUse won't be decremented. If the user then
      // gets an object when inUse is the same size as objects.length, inUse will increment
      // and this statement will evaluate to -1.
      //
      // I don't like having to go through the pool to kill an object as it forces you to
      // know which object came from which pool. Instead, we'll just prevent the index from
      // going below 0 and accept the fact that inUse may be out of sync for a frame.
      var index = Math.max(this.objects.length - this.inUse, 0);

      // only iterate over the objects that are alive
      while (i >= index) {
        obj = this.objects[i];

        obj.update(dt);

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
          this.inUse--;
          index++;
        }
        else {
          i--;
        }
      }
    },

    /**
     * render all alive pool objects.
     * @memberof kontra.pool
     */
    render: function render() {
      var index = Math.max(this.objects.length - this.inUse, 0);

      for (var i = this.lastIndex; i >= index; i--) {
        this.objects[i].render();
      }
    }
  };

  return kontra;
})(kontra || {});
var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A quadtree for 2D collision checking. The quadtree acts like an object pool in that it
   * will create subnodes as objects are needed but it won't clean up the subnodes when it
   * collapses to avoid garbage collection.
   * @memberof kontra
   *
   * @see kontra.quadtree.prototype.init for list of parameters.
   *
   * The quadrant indices are numbered as follows (following a z-order curve):
   *     |
   *  0  |  1
   * ----+----
   *  2  |  3
   *     |
   */
  kontra.quadtree = function(properties) {
    var quadtree = Object.create(kontra.quadtree.prototype);
    quadtree.init(properties);

    return quadtree;
  };

  kontra.quadtree.prototype = {
    /**
     * Initialize properties on the quadtree.
     * @memberof kontra.quadtree
     *
     * @param {object} properties - Properties of the quadtree.
     * @param {number} [properties.depth=0] - Current node depth.
     * @param {number} [properties.maxDepth=3] - Maximum node depths the quadtree can have.
     * @param {number} [properties.maxObjects=25] - Maximum number of objects a node can support before splitting.
     * @param {object} [properties.parentNode] - The node that contains this node.
     * @param {object} [properties.bounds] - The 2D space this node occupies.
     */
    init: function init(properties) {
      properties = properties || {};

      this.depth = properties.depth || 0;
      this.maxDepth = properties.maxDepth || 3;
      this.maxObjects = properties.maxObjects || 25;

      // since we won't clean up any subnodes, we need to keep track of which nodes are
      // currently the leaf node so we know which nodes to add objects to
      this.isBranchNode = false;

      this.parentNode = properties.parentNode;

      this.bounds = properties.bounds || {
        x: 0,
        y: 0,
        width: kontra.canvas.width,
        height: kontra.canvas.height
      };

      this.objects = [];
      this.subnodes = [];
    },

    /**
     * Clear the quadtree
     * @memberof kontra.quadtree
     */
    clear: function clear() {
      if (this.isBranchNode) {
        for (var i = 0; i < 4; i++) {
          this.subnodes[i].clear();
        }
      }

      this.isBranchNode = false;
      this.objects.length = 0;
    },

    /**
     * Find the leaf node the object belongs to and get all objects that are part of
     * that node.
     * @memberof kontra.quadtree
     *
     * @param {object} object - Object to use for finding the leaf node.
     *
     * @returns {object[]} A list of objects in the same leaf node as the object.
     */
    get: function get(object) {
      var node = this;
      var objects = [];
      var indices, index;

      // traverse the tree until we get to a leaf node
      while (node.subnodes.length && this.isBranchNode) {
        indices = this._getIndex(object);

        for (var i = 0, length = indices.length; i < length; i++) {
          index = indices[i];

          objects.push.apply(objects, this.subnodes[index].get(object));
        }

        return objects;
      }

      return node.objects;
    },

    /**
     * Add an object to the quadtree. Once the number of objects in the node exceeds
     * the maximum number of objects allowed, it will split and move all objects to their
     * corresponding subnodes.
     * @memberof kontra.quadtree
     *
     * @param {...object|object[]} Objects to add to the quadtree
     *
     * @example
     * kontra.quadtree().add({id:1}, {id:2}, {id:3});
     * kontra.quadtree().add([{id:1}, {id:2}], {id:3});
     */
    add: function add() {
      var i, object, obj, indices, index;

      for (var j = 0, length = arguments.length; j < length; j++) {
        object = arguments[j];

        // add a group of objects separately
        if (Array.isArray(object)) {
          this.add.apply(this, object);

          continue;
        }

        // current node has subnodes, so we need to add this object into a subnode
        if (this.subnodes.length && this.isBranchNode) {
          this._addToSubnode(object);

          continue;
        }

        // this node is a leaf node so add the object to it
        this.objects.push(object);

        // split the node if there are too many objects
        if (this.objects.length > this.maxObjects && this.depth < this.maxDepth) {
          this._split();

          // move all objects to their corresponding subnodes
          for (i = 0; obj = this.objects[i]; i++) {
            this._addToSubnode(obj);
          }

          this.objects.length = 0;
        }
      }
    },

    /**
     * Add an object to a subnode.
     * @memberof kontra.quadtree
     * @private
     *
     * @param {object} object - Object to add into a subnode
     */
    _addToSubnode: function _addToSubnode(object) {
      var indices = this._getIndex(object);

      // add the object to all subnodes it intersects
      for (var i = 0, length = indices.length; i < length; i++) {
        this.subnodes[ indices[i] ].add(object);
      }
    },

    /**
     * Determine which subnodes the object intersects with.
     * @memberof kontra.quadtree
     * @private
     *
     * @param {object} object - Object to check.
     *
     * @returns {number[]} List of all subnodes object intersects.
     */
    _getIndex: function getIndex(object) {
      var indices = [];

      var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
      var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

      // save off quadrant checks for reuse
      var intersectsTopQuadrants = object.y < horizontalMidpoint && object.y + object.height >= this.bounds.y;
      var intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint && object.y < this.bounds.y + this.bounds.height;

      // object intersects with the left quadrants
      if (object.x < verticalMidpoint && object.x + object.width >= this.bounds.x) {
        if (intersectsTopQuadrants) {  // top left
          indices.push(0);
        }

        if (intersectsBottomQuadrants) {  // bottom left
          indices.push(2);
        }
      }

      // object intersects with the right quadrants
      if (object.x + object.width >= verticalMidpoint && object.x < this.bounds.x + this.bounds.width) {  // top right
        if (intersectsTopQuadrants) {
          indices.push(1);
        }

        if (intersectsBottomQuadrants) {  // bottom right
          indices.push(3);
        }
      }

      return indices;
    },

    /**
     * Split the node into four subnodes.
     * @memberof kontra.quadtree
     * @private
     */
    _split: function split() {
      this.isBranchNode = true;

      // only split if we haven't split before
      if (this.subnodes.length) {
        return;
      }

      var subWidth = this.bounds.width / 2 | 0;
      var subHeight = this.bounds.height / 2 | 0;

      for (var i = 0; i < 4; i++) {
        this.subnodes[i] = kontra.quadtree({
          bounds: {
            x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
            y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
            width: subWidth,
            height: subHeight
          },
          depth: this.depth+1,
          maxDepth: this.maxDepth,
          maxObjects: this.maxObjects,
          parentNode: this
        });
      }
    },

    /**
     * Draw the quadtree. Useful for visual debugging.
     * @memberof kontra.quadtree
     */
    render: function() {
      /* istanbul ignore next */
      // don't draw empty leaf nodes, always draw branch nodes and the first node
      if (this.objects.length || this.depth === 0 ||
          (this.parentNode && this.parentNode.isBranchNode)) {

        kontra.context.strokeStyle = 'red';
        kontra.context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        if (this.subnodes.length) {
          for (var i = 0; i < 4; i++) {
            this.subnodes[i].render();
          }
        }
      }
    }
  };

  return kontra;
})(kontra || {});
var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2D space.
   * @memberof kontra
   *
   * @see kontra.vector.prototype.init for list of parameters.
   */
  kontra.vector = function(properties) {
    var vector = Object.create(kontra.vector.prototype);
    vector.init(properties);

    return vector;
  };

  kontra.vector.prototype = {
    /**
     * Initialize the vectors x and y position.
     * @memberof kontra.vector
     *
     * @param {object} properties - Properties of the vector.
     * @param {number} properties.x=0 - X coordinate.
     * @param {number} properties.y=0 - Y coordinate.
     *
     * @returns {vector}
     */
    init: function init(properties) {
      properties = properties || {};

      this.x = properties.x || 0;
      this.y = properties.y || 0;

      return this;
    },

    /**
     * Add a vector to this vector.
     * @memberof kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt=1 - Time since last update.
     */
    add: function add(vector, dt) {
      this.x += (vector.x || 0) * (dt || 1);
      this.y += (vector.y || 0) * (dt || 1);
    },

    /**
     * Clamp the vector between two points that form a rectangle.
     * Please note that clamping will only work if the add function is called.
     * @memberof kontra.vector
     *
     * @param {number} [xMin=-Infinity] - Min x value.
     * @param {number} [yMin=Infinity] - Min y value.
     * @param {number} [xMax=-Infinity] - Max x value.
     * @param {number} [yMax=Infinity] - Max y value.
     */
    clamp: function clamp(xMin, yMin, xMax, yMax) {
      this._xMin = (xMin !== undefined ? xMin : -Infinity);
      this._xMax = (xMax !== undefined ? xMax : Infinity);
      this._yMin = (yMin !== undefined ? yMin : -Infinity);
      this._yMax = (yMax !== undefined ? yMax : Infinity);

      // rename x and y so we can use them as getters and setters
      this._x = this.x;
      this._y = this.y;

      // define getters to return the renamed x and y and setters to clamp their value
      Object.defineProperties(this, {
        x: {
          get: function() {
            return this._x;
          },
          set: function(value) {
            this._x = Math.min( Math.max(value, this._xMin), this._xMax );
          }
        },
        y: {
          get: function() {
            return this._y;
          },
          set: function(value) {
            this._y = Math.min( Math.max(value, this._yMin), this._yMax );
          }
        }
      });
    }
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberof kontra
   * @requires kontra.vector
   *
   * @see kontra.sprite.prototype.init for list of parameters.
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite.prototype);
    sprite.init(properties);

    return sprite;
  };

  kontra.sprite.prototype = {
    /**
     * Initialize properties on the sprite.
     * @memberof kontra.sprite
     *
     * @param {object} properties - Properties of the sprite.
     * @param {number} properties.x - X coordinate of the sprite.
     * @param {number} properties.y - Y coordinate of the sprite.
     * @param {number} [properties.dx] - Change in X position.
     * @param {number} [properties.dy] - Change in Y position.
     * @param {number} [properties.ddx] - Change in X velocity.
     * @param {number} [properties.ddy] - Change in Y velocity.
     *
     * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     *
     * @param {Image|Canvas} [properties.image] - Image for the sprite.
     *
     * @param {object} [properties.animations] - Animations for the sprite instead of an image.
     *
     * @param {string} [properties.color] - If no image or animation is provided, use color to draw a rectangle for the sprite.
     * @param {number} [properties.width] - Width of the sprite for drawing a rectangle.
     * @param {number} [properties.height] - Height of the sprite for drawing a rectangle.
     *
     * @param {function} [properties.update] - Function to use to update the sprite.
     * @param {function} [properties.render] - Function to use to render the sprite.
     *
     * If you need the sprite to live forever, or just need it to stay on screen until you
     * decide when to kill it, you can set <code>timeToLive</code> to <code>Infinity</code>.
     * Just be sure to set <code>timeToLive</code> to 0 when you want the sprite to die.
     */
    init: function init(properties) {
      properties = properties || {};

      this.position = (this.position || kontra.vector()).init({
        x: properties.x,
        y: properties.y
      });
      this.velocity = (this.velocity || kontra.vector()).init({
        x: properties.dx,
        y: properties.dy
      });
      this.acceleration = (this.acceleration || kontra.vector()).init({
        x: properties.ddx,
        y: properties.ddy
      });

      // loop through properties before overrides
      for (var prop in properties) {
        if (!properties.hasOwnProperty(prop)) {
          continue;
        }

        this[prop] = properties[prop];
      }

      this.timeToLive = properties.timeToLive || 0;
      this.context = properties.context || kontra.context;

      // image sprite
      if (kontra._isImage(properties.image) || kontra._isCanvas(properties.image)) {
        this.image = properties.image;
        this.width = properties.image.width;
        this.height = properties.image.height;

        // change the advance and draw functions to work with images
        this.advance = this._advanceSprite;
        this.draw = this._drawImage;
      }
      // animation sprite
      else if (properties.animations) {
        this.animations = properties.animations;

        // default the current animation to the first one in the list
        this.currentAnimation = properties.animations[ Object.keys(properties.animations)[0] ];
        this.width = this.currentAnimation.width;
        this.height = this.currentAnimation.height;

        // change the advance and draw functions to work with animations
        this.advance = this._advanceAnimation;
        this.draw = this._drawAnimation;
      }
      // rectangle sprite
      else {
        this.color = properties.color;
        this.width = properties.width;
        this.height = properties.height;

        // change the advance and draw functions to work with rectangles
        this.advance = this._advanceSprite;
        this.draw = this._drawRect;
      }
    },

    // define getter and setter shortcut functions to make it easier to work with the
    // position, velocity, and acceleration vectors.

    /**
     * Sprite position.x
     * @memberof kontra.sprite
     *
     * @property {number} x
     */
    get x() {
      return this.position.x;
    },

    /**
     * Sprite position.y
     * @memberof kontra.sprite
     *
     * @property {number} y
     */
    get y() {
      return this.position.y;
    },

    /**
     * Sprite velocity.x
     * @memberof kontra.sprite
     *
     * @property {number} dx
     */
    get dx() {
      return this.velocity.x;
    },

    /**
     * Sprite velocity.y
     * @memberof kontra.sprite
     *
     * @property {number} dy
     */
    get dy() {
      return this.velocity.y;
    },

    /**
     * Sprite acceleration.x
     * @memberof kontra.sprite
     *
     * @property {number} ddx
     */
    get ddx() {
      return this.acceleration.x;
    },

    /**
     * Sprite acceleration.y
     * @memberof kontra.sprite
     *
     * @property {number} ddy
     */
    get ddy() {
      return this.acceleration.y;
    },

    set x(value) {
      this.position.x = value;
    },
    set y(value) {
      this.position.y = value;
    },
    set dx(value) {
      this.velocity.x = value;
    },
    set dy(value) {
      this.velocity.y = value;
    },
    set ddx(value) {
      this.acceleration.x = value;
    },
    set ddy(value) {
      this.acceleration.y = value;
    },

    /**
     * Determine if the sprite is alive.
     * @memberof kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive: function isAlive() {
      return this.timeToLive > 0;
    },

    /**
     * Simple bounding box collision test.
     * @memberof kontra.sprite
     *
     * @param {object} object - Object to check collision against.
     *
     * @returns {boolean} True if the objects collide, false otherwise.
     */
    collidesWith: function collidesWith(object) {
      return this.x < object.x + object.width &&
             this.x + this.width > object.x &&
             this.y < object.y + object.height &&
             this.y + this.height > object.y;
    },

    /**
     * Update the sprites velocity and position.
     * @memberof kontra.sprite
     * @abstract
     *
     * @param {number} dt - Time since last update.
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the update step. Just call <code>this.advance()</code> when you need
     * the sprite to update its position.
     *
     * @example
     * sprite = kontra.sprite({
     *   update: function update(dt) {
     *     // do some logic
     *
     *     this.advance(dt);
     *   }
     * });
     */
    update: function update(dt) {
      this.advance(dt);
    },

    /**
     * Render the sprite.
     * @memberof kontra.sprite.
     * @abstract
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the render step. Just call <code>this.draw()</code> when you need the
     * sprite to draw its image.
     *
     * @example
     * sprite = kontra.sprite({
     *   render: function render() {
     *     // do some logic
     *
     *     this.draw();
     *   }
     * });
     */
    render: function render() {
      this.draw();
    },

    /**
     * Play an animation.
     * @memberof kontra.sprite
     *
     * @param {string} name - Name of the animation to play.
     */
    playAnimation: function playAnimation(name) {
      this.currentAnimation = this.animations[name];
    },

    /**
     * Move the sprite by its velocity.
     * @memberof kontra.sprite
     * @private
     *
     * @param {number} dt - Time since last update.
     */
    _advanceSprite: function advanceSprite(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Update the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     * @private
     *
     * @param {number} dt - Time since last update.
     */
    _advanceAnimation: function advanceAnimation(dt) {
      this._advanceSprite(dt);

      this.currentAnimation.update(dt);
    },

    /**
     * Draw a simple rectangle. Useful for prototyping.
     * @memberof kontra.sprite
     * @private
     */
    _drawRect: function drawRect() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x, this.y, this.width, this.height);
    },

    /**
     * Draw the sprite.
     * @memberof kontra.sprite
     * @private
     */
    _drawImage: function drawImage() {
      this.context.drawImage(this.image, this.x, this.y);
    },

    /**
     * Draw the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     * @private
     */
    _drawAnimation: function drawAnimation() {
      this.currentAnimation.render({
        context: this.context,
        x: this.x,
        y: this.y
      });
    },
  };

  return kontra;
})(kontra || {}, Math);
var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * Single animation from a sprite sheet.
   * @memberof kontra
   *
   * @see kontra.pool.prototype.init for list of parameters.
   */
  kontra.animation = function(properties) {
    var animation = Object.create(kontra.animation.prototype);
    animation.init(properties);

    return animation;
  };

  kontra.animation.prototype = {
    /**
     * Initialize properties on the animation.
     * @memberof kontra.animation
     *
     * @param {object} properties - Properties of the animation.
     * @param {object} properties.spriteSheet - Sprite sheet for the animation.
     * @param {number[]} properties.frames - List of frames of the animation.
     * @param {number}  properties.frameRate - Number of frames to display in one second.
     */
    init: function init(properties) {
      properties = properties || {};

      this.spriteSheet = properties.spriteSheet;
      this.frames = properties.frames;
      this.frameRate = properties.frameRate;

      this.width = properties.spriteSheet.frame.width;
      this.height = properties.spriteSheet.frame.height;

      this.currentFrame = 0;
      this._accumulator = 0;

      // set update and render so we can noop them later to stop the animation
      this.update = this._advance;
      this.render = this._draw;
    },

    /**
     * Play the animation.
     * @memberof kontra.animation
     */
    play: function play() {
      // restore references to update and render functions only if overridden
      this.update = this._advance;
      this.render = this._draw;
    },

    /**
     * Stop the animation and prevent update and render.
     * @memberof kontra.animation
     */
    stop: function stop() {

      // instead of putting an if statement in both render/update functions that checks
      // a variable to determine whether to render or update, we can just reassign the
      // functions to noop and save processing time in the game loop.
      // @see http://jsperf.com/boolean-check-vs-noop
      this.update = kontra._noop;
      this.render = kontra._noop;
    },

    /**
     * Pause the animation and prevent update.
     * @memberof kontra.animation
     */
    pause: function pause() {
      this.update = kontra._noop;
    },

    /**
     * Clone an animation to be used more than once.
     * @memberof kontra.animation
     *
     * @returns {object}
     */
    clone: function clone() {
      return kontra.animation(this);
    },

    /**
     * Update the animation. Used when the animation is not paused or stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {number} [dt=1/60] - Time since last update.
     */
    _advance: function advance(dt) {
      dt = dt || 1 / 60;

      this._accumulator += dt;

      // update to the next frame if it's time
      while (this._accumulator * this.frameRate >= 1) {
        this.currentFrame = ++this.currentFrame % this.frames.length;

        this._accumulator -= 1 / this.frameRate;
      }
    },

    /**
     * Draw the current frame. Used when the animation is not stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - How to draw the animation.
     * @param {number} properties.x - X position to draw.
     * @param {number} properties.y - Y position to draw.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     */
    _draw: function draw(properties) {
      properties = properties || {};

      var context = properties.context || kontra.context;

      // get the row and col of the frame
      var row = this.frames[this.currentFrame] / this.spriteSheet.framesPerRow | 0;
      var col = this.frames[this.currentFrame] % this.spriteSheet.framesPerRow | 0;

      context.drawImage(
        this.spriteSheet.image,
        col * this.spriteSheet.frame.width, row * this.spriteSheet.frame.height,
        this.spriteSheet.frame.width, this.spriteSheet.frame.height,
        properties.x, properties.y,
        this.spriteSheet.frame.width, this.spriteSheet.frame.height
      );
    }
  };






  /**
   * Create a sprite sheet from an image.
   * @memberof kontra
   *
   * @see kontra.spriteSheet.prototype.init for list of parameters.
   */
  kontra.spriteSheet = function(properties) {
    var spriteSheet = Object.create(kontra.spriteSheet.prototype);
    spriteSheet.init(properties);

    return spriteSheet;
  };

  kontra.spriteSheet.prototype = {
    /**
     * Initialize properties on the spriteSheet.
     * @memberof kontra
     *
     * @param {object} properties - Properties of the sprite sheet.
     * @param {Image|Canvas} properties.image - Image for the sprite sheet.
     * @param {number} properties.frameWidth - Width (in px) of each frame.
     * @param {number} properties.frameHeight - Height (in px) of each frame.
     * @param {object} properties.animations - Animations to create from the sprite sheet.
     */
    init: function init(properties) {
      properties = properties || {};

      this.animations = {};

      if (kontra._isImage(properties.image) || kontra._isCanvas(properties.image)) {
        this.image = properties.image;
        this.frame = {
          width: properties.frameWidth,
          height: properties.frameHeight
        };

        this.framesPerRow = properties.image.width / properties.frameWidth | 0;
      }
      else {
        var error = new SyntaxError('Invalid image.');
        kontra._logError(error, 'You must provide an Image for the SpriteSheet.');
        return;
      }

      if (properties.animations) {
        this.createAnimations(properties.animations);
      }
    },

    /**
     * Create animations from the sprite sheet.
     * @memberof kontra.spriteSheet
     *
     * @param {object} animations - List of named animations to create from the Image.
     * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
     * @param {number} animations.animationName.frameRate - Number of frames to display in one second.
     *
     * @example
     * var sheet = kontra.spriteSheet({image: img, frameWidth: 16, frameHeight: 16});
     * sheet.createAnimations({
     *   idle: {
     *     frames: 1  // single frame animation
     *   },
     *   walk: {
     *     frames: '2..6',  // ascending consecutive frame animation (frames 2-6, inclusive)
     *     frameRate: 4
     *   },
     *   moonWalk: {
     *     frames: '6..2',  // descending consecutive frame animation
     *     frameRate: 4
     *   },
     *   jump: {
     *     frames: [7, 12, 2],  // non-consecutive frame animation
     *     frameRate: 3
     *   },
     *   attack: {
     *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *     frameRate: 2
     *   }
     * });
     */
    createAnimations: function createAnimations(animations) {
      var error;

      if (!animations || Object.keys(animations).length === 0) {
        error = new ReferenceError('No animations found.');
        kontra._logError(error, 'You must provide at least one named animation to create an Animation.');
        return;
      }

      // create each animation by parsing the frames
      var animation, frames, frameRate, sequence;
      for (var name in animations) {
        if (!animations.hasOwnProperty(name)) {
          continue;
        }

        animation = animations[name];
        frames = animation.frames;
        frameRate = animation.frameRate;

        // array that holds the order of the animation
        sequence = [];

        if (frames === undefined) {
          error = new ReferenceError('No animation frames found.');
          kontra._logError(error, 'Animation ' + name + ' must provide a frames property.');
          return;
        }

        // single frame
        if (kontra._isNumber(frames)) {
          sequence.push(frames);
        }
        // consecutive frames
        else if (kontra._isString(frames)) {
          sequence = this._parseFrames(frames);
        }
        // non-consecutive frames
        else if (Array.isArray(frames)) {
          for (var i = 0, frame; frame = frames[i]; i++) {

            // consecutive frames
            if (kontra._isString(frame)) {

              // add new frames to the end of the array
              sequence.push.apply(sequence, this._parseFrames(frame));
            }
            // single frame
            else {
              sequence.push(frame);
            }
          }
        }
        else {
          error = new SyntaxError('Improper frames value');
          kontra._logError(error, 'The frames property must be a number, string, or array.');
          return;
        }

        this.animations[name] = kontra.animation({
          spriteSheet: this,
          frames: sequence,
          frameRate: frameRate
        });
      }
    },

    /**
     * Parse a string of consecutive frames.
     * @memberof kontra.spriteSheet
     * @private
     *
     * @param {string} frames - Start and end frame.
     *
     * @returns {number[]} List of frames.
     */
    _parseFrames: function parseFrames(frames) {
      var sequence = [];
      var consecutiveFrames = frames.split('..').map(Number);

      // determine which direction to loop
      var direction = (consecutiveFrames[0] < consecutiveFrames[1] ? 1 : -1);
      var i;

      // ascending frame order
      if (direction === 1) {
        for (i = consecutiveFrames[0]; i <= consecutiveFrames[1]; i++) {
          sequence.push(i);
        }
      }
      // descending order
      else {
        for (i = consecutiveFrames[0]; i >= consecutiveFrames[1]; i--) {
          sequence.push(i);
        }
      }

      return sequence;
    }
  };

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
   * @memberof kontra.store
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
   * @memberof kontra.store
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
   * @memberof kontra.store
   *
   * @param {string} key - Name of the item.
   */
  kontra.store.remove = function removeStoreItem(key) {
    localStorage.removeItem(key);
  };

  /**
   * Clear all keys from localStorage.
   * @memberof kontra.store
   */
  kontra.store.clear = function clearStore() {
    localStorage.clear();
  };

  return kontra;
})(kontra || {}, window, window.localStorage);
var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberof kontra
   *
   * @see kontra.tileEngine.prototype.init for list of parameters.
   */
  kontra.tileEngine = function(properties) {
    var tileEngine = Object.create(kontra.tileEngine.prototype);
    tileEngine.init(properties);

    return tileEngine;
  };

  kontra.tileEngine.prototype = {
    /**
     * Initialize properties on the tile engine.
     * @memberof kontra.tileEngine
     *
     * @param {object} properties - Properties of the tile engine.
     * @param {number} [properties.tileWidth=32] - Width of a tile.
     * @param {number} [properties.tileHeight=32] - Height of a tile.
     * @param {number} properties.width - Width of the map (in tiles).
     * @param {number} properties.height - Height of the map (in tiles).
     * @param {number} [properties.x=0] - X position to draw.
     * @param {number} [properties.y=0] - Y position to draw.
     * @param {number} [properties.sx=0] - X position to clip the tileset.
     * @param {number} [properties.sy=0] - Y position to clip the tileset.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the tile engine to draw on.
     */
    init: function init(properties) {
      properties = properties || {};

      // size of the map (in tiles)
      if (!properties.width || !properties.height) {
        var error = new ReferenceError('Required parameters not found');
        kontra._logError(error, 'You must provide width and height of the map to create a tile engine.');
        return;
      }

      this.width = properties.width;
      this.height = properties.height;

      // size of the tiles. Most common tile size on opengameart.org seems to be 32x32,
      // followed by 16x16
      this.tileWidth = properties.tileWidth || properties.tilewidth || 32;
      this.tileHeight = properties.tileHeight || properties.tileheight || 32;

      this.context = properties.context || kontra.context;

      this.canvasWidth = this.context.canvas.width;
      this.canvasHeight = this.context.canvas.height;

      // create an off-screen canvas for pre-rendering the map
      // @see http://jsperf.com/render-vs-prerender
      this._offscreenCanvas = document.createElement('canvas');
      this._offscreenContext = this._offscreenCanvas.getContext('2d');

      // make the off-screen canvas the full size of the map
      this._offscreenCanvas.width = this.mapWidth = this.width * this.tileWidth;
      this._offscreenCanvas.height = this.mapHeight = this.height * this.tileHeight;

      // when clipping an image, sx and sy must within the image region, otherwise
      // Firefox and Safari won't draw it.
      // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
      this.sxMax = Math.max(0, this.mapWidth - this.canvasWidth);
      this.syMax = Math.max(0, this.mapHeight - this.canvasHeight);

      // each tileset will hold the first and the last grid as well as the image for the tileset
      this.tilesets = [];
      this.layers = {};

      // draw order of layers (by name)
      this._layerOrder = [];

      this.x = properties.x || 0;
      this.y = properties.y || 0;
      this.sx = properties.sx || 0;
      this.sy = properties.sy || 0;

      if (properties.tilesets) {
        this.addTilesets(properties.tilesets);
      }

      if (properties.layers) {
        this.addLayers(properties.layers);
      }
    },

    /**
     * Add an tileset for the tile engine to use.
     * @memberof kontra.tileEngine
     *
     * @param {object|object[]} tileset - Properties of the image to add.
     * @param {Image|Canvas} tileset.image - Path to the image or Image object.
     * @param {number} tileset.firstGrid - The first tile grid to start the image.
     */
    addTilesets: function addTilesets(tilesets) {
      if (!Array.isArray(tilesets)) {
        tilesets = [tilesets]
      }

      tilesets.forEach(function(tileset) {
        var image;
        // var tilesetImageName = tileset.image.substring(tileset.image.lastIndexOf('/') + 1, tileset.image.lastIndexOf('.'));

        if (kontra._isImage(tileset.image) || kontra._isCanvas(tileset.image)) {
          image = tileset.image;
        }
        else if (kontra._isString(tileset.image)) {
          // see if the image path is in kontra.images
          var i = Infinity;
          while (i >= 0) {
            var i = tileset.image.lastIndexOf('/', i);
            var path = tileset.image.substr(i);

            if (kontra.images[path]) {
              image = kontra.images[path];
              break;
            }

            i--;
          }
        }

        if (!image) {
          var error = new SyntaxError('Invalid image.');
          kontra._logError(error, 'You must provide an Image for the tile engine.');
          return;
        }

        var firstGrid = tileset.firstGrid;

        // if the width or height of the provided image is smaller than the tile size,
        // default calculation to 1
        var numTiles = ( (image.width / this.tileWidth | 0) || 1 ) *
                       ( (image.height / this.tileHeight | 0) || 1 );

        if (!firstGrid) {
          // only calculate the first grid if the tile map has a tileset already
          if (this.tilesets.length > 0) {
            var lastTileset = this.tilesets[this.tilesets.length - 1];
            var tiles = (lastTileset.image.width / this.tileWidth | 0) *
                        (lastTileset.image.height / this.tileHeight | 0);

            firstGrid = lastTileset.firstGrid + tiles;
          }
          // otherwise this is the first tile added to the tile map
          else {
            firstGrid = 1;
          }
        }

        this.tilesets.push({
          firstGrid: firstGrid,
          lastGrid: firstGrid + numTiles - 1,
          image: image
        });

        // sort the tile map so we can perform a binary search when drawing
        this.tilesets.sort(function(a, b) {
          return a.firstGrid - b.firstGrid;
        });
      }.bind(this));
    },

    /**
     * Add a layer to the tile engine.
     * @memberof kontra.tileEngine
     *
     * @param {object} properties - Properties of the layer to add.
     * @param {string} properties.name - Name of the layer.
     * @param {number[]} properties.data - Tile layer data.
     * @param {boolean} [properties.render=true] - If the layer should be drawn.
     * @param {number} [properties.zIndex] - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     */
    addLayers: function addLayers(layers) {
      if (!Array.isArray(layers)) {
        layers = [layers]
      }

      layers.forEach(function(layer) {
        layer.render = (layer.render === undefined ? true : layer.render);

        var data;

        // flatten a 2D array into a single array
        if (Array.isArray(layer.data[0])) {
          data = [];

          for (var r = 0, row; row = layer.data[r]; r++) {
            for (var c = 0; c < this.width; c++) {
              data.push(row[c] || 0);
            }
          }
        }
        else {
          data = layer.data;
        }

        this.layers[layer.name] = {
          data: data,
          zIndex: layer.zIndex || 0,
          render: layer.render
        };

        // merge properties of layer onto layer object
        for (var prop in layer.properties) {
          var value = layer.properties[prop];

          try {
            value = JSON.parse(value);
          }
          catch(e) {}

          this.layers[layer.name][prop] = value;
        }

        // only add the layer to the layer order if it should be drawn
        if (this.layers[layer.name].render) {
          this._layerOrder.push(layer.name);

          this._layerOrder.sort(function(a, b) {
            return this.layers[a].zIndex - this.layers[b].zIndex;
          }.bind(this));

        }
      }.bind(this));

      this._preRenderImage();
    },

    /**
     * Simple bounding box collision test for layer tiles.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer.
     * @param {object} object - Object to check collision against.
     * @param {number} object.x - X coordinate of the object.
     * @param {number} object.y - Y coordinate of the object.
     * @param {number} object.width - Width of the object.
     * @param {number} object.height - Height of the object.
     *
     * @returns {boolean} True if the object collides with a tile, false otherwise.
     */
    layerCollidesWith: function layerCollidesWith(name, object) {
      // calculate all tiles that the object can collide with
      var row = this.getRow(object.y);
      var col = this.getCol(object.x);

      var endRow = this.getRow(object.y + object.height);
      var endCol = this.getCol(object.x + object.width);

      // check all tiles
      var index;
      for (var r = row; r <= endRow; r++) {
        for (var c = col; c <= endCol; c++) {
          index = this._getIndex({row: r, col: c});

          if (this.layers[name].data[index]) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Get the tile from the specified layer at x, y or row, col.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer.
     * @param {object} position - Position of the tile in either x, y or row, col.
     * @param {number} position.x - X coordinate of the tile.
     * @param {number} position.y - Y coordinate of the tile.
     * @param {number} position.row - Row of the tile.
     * @param {number} position.col - Col of the tile.
     *
     * @returns {number}
     */
    tileAtLayer: function tileAtLayer(name, position) {
      var index = this._getIndex(position);

      if (index >= 0) {
        return this.layers[name].data[index];
      }
    },

    /**
     * Render the pre-rendered canvas.
     * @memberof kontra.tileEngine
     */
    render: function render() {
      // ensure sx and sy are within the image region
      this.sx = Math.min( Math.max(this.sx, 0), this.sxMax );
      this.sy = Math.min( Math.max(this.sy, 0), this.syMax );

      this.context.drawImage(
        this._offscreenCanvas,
        this.sx, this.sy, this.canvasWidth, this.canvasHeight,
        this.x, this.y, this.canvasWidth, this.canvasHeight
      );
    },

    /**
     * Render a specific layer.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer to render.
     */
    renderLayer: function renderLayer(name) {
      var layer = this.layers[name];

      // calculate the starting tile
      var row = this.getRow();
      var col = this.getCol();
      var index = this._getIndex({row: row, col: col});

      // calculate where to start drawing the tile relative to the drawing canvas
      var startX = col * this.tileWidth - this.sx;
      var startY = row * this.tileHeight - this.sy;

      // calculate how many tiles the drawing canvas can hold
      var viewWidth = Math.min(Math.ceil(this.canvasWidth / this.tileWidth) + 1, this.width);
      var viewHeight = Math.min(Math.ceil(this.canvasHeight / this.tileHeight) + 1, this.height);
      var numTiles = viewWidth * viewHeight;

      var count = 0;
      var x, y, tile, tileset, image, tileOffset, width, sx, sy;

      // draw just enough of the layer to fit inside the drawing canvas
      while (count < numTiles) {
        tile = layer.data[index];

        if (tile) {
          tileset = this._getTileset(tile);
          image = tileset.image;

          x = startX + (count % viewWidth) * this.tileWidth;
          y = startY + (count / viewWidth | 0) * this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / this.tileWidth;

          sx = (tileOffset % width) * this.tileWidth;
          sy = (tileOffset / width | 0) * this.tileHeight;

          this.context.drawImage(
            image,
            sx, sy, this.tileWidth, this.tileHeight,
            x, y, this.tileWidth, this.tileHeight
          );
        }

        if (++count % viewWidth === 0) {
          index = col + (++row * this.width);
        }
        else {
          index++;
        }
      }
    },

    /**
     * Get the row from the y coordinate.
     * @memberof kontra.tileEngine
     *
     * @param {number} y - Y coordinate.
     *
     * @return {number}
     */
    getRow: function getRow(y) {
      y = y || 0;

      return (this.sy + y) / this.tileHeight | 0;
    },

    /**
     * Get the col from the x coordinate.
     * @memberof kontra.tileEngine
     *
     * @param {number} x - X coordinate.
     *
     * @return {number}
     */
    getCol: function getCol(x) {
      x = x || 0;

      return (this.sx + x) / this.tileWidth | 0;
    },

    /**
     * Get the index of the x, y or row, col.
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} position.x - X coordinate of the tile.
     * @param {number} position.y - Y coordinate of the tile.
     * @param {number} position.row - Row of the tile.
     * @param {number} position.col - Col of the tile.
     *
     * @return {number} Returns the tile index or -1 if the x, y or row, col is outside the dimensions of the tile engine.
     */
    _getIndex: function getIndex(position) {
      var row, col;

      if (typeof position.x !== 'undefined' && typeof position.y !== 'undefined') {
        row = this.getRow(position.y);
        col = this.getCol(position.x);
      }
      else {
        row = position.row;
        col = position.col;
      }

      // don't calculate out of bound numbers
      if (row < 0 || col < 0 || row >= this.height || col >= this.width) {
        return -1;
      }

      return col + row * this.width;
    },

    /**
     * Modified binary search that will return the tileset associated with the tile
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} tile - Tile grid.
     *
     * @return {object}
     */
    _getTileset: function getTileset(tile) {
      var min = 0;
      var max = this.tilesets.length - 1;
      var index;
      var currTile;

      while (min <= max) {
        index = (min + max) / 2 | 0;
        currTile = this.tilesets[index];

        if (tile >= currTile.firstGrid && tile <= currTile.lastGrid) {
          return currTile;
        }
        else if (currTile.lastGrid < tile) {
          min = index + 1;
        }
        else {
          max = index - 1;
        }
      }
    },

    /**
     * Pre-render the tiles to make drawing fast.
     * @memberof kontra.tileEngine
     * @private
     */
    _preRenderImage: function preRenderImage() {
      var tile, tileset, image, x, y, sx, sy, tileOffset, width;

      // draw each layer in order
      for (var i = 0, layer; layer = this.layers[this._layerOrder[i]]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          tileset = this._getTileset(tile);
          image = tileset.image;

          x = (j % this.width) * this.tileWidth;
          y = (j / this.width | 0) * this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / this.tileWidth;

          sx = (tileOffset % width) * this.tileWidth;
          sy = (tileOffset / width | 0) * this.tileHeight;

          this._offscreenContext.drawImage(
            image,
            sx, sy, this.tileWidth, this.tileHeight,
            x, y, this.tileWidth, this.tileHeight
          );
        }
      }
    }
  };

  return kontra;
})(kontra || {}, Math);