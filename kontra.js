var kontra = (function () {
  'use strict';

  let imageRegex = /(jpeg|jpg|gif|png)$/;
  let audioRegex = /(wav|mp3|ogg|aac)$/;
  let noRegex = /^no$/;
  let leadingSlash = /^\//;
  let trailingSlash = /\/$/;
  let assets;
  let dataMap = new WeakMap();

  // audio playability
  // @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
  let audio = new Audio();
  let canUse = {
    wav: '',
    mp3: audio.canPlayType('audio/mpeg;').replace(noRegex,''),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"').replace(noRegex,''),
    aac: audio.canPlayType('audio/aac;').replace(noRegex,'')
  };

  /**
   * Join a base path and asset path.
   *
   * @param {string} base - The asset base path.
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  function joinPath(base, url) {
    return [base.replace(trailingSlash, ''), base ? url.replace(leadingSlash, '') : url]
      .filter(s => s)
      .join('/')
  }

  /**
   * Get the extension of an asset.
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  function getExtension(url) {
    return url.split('.').pop();
  }

  /**
   * Get the name of an asset.
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  function getName(url) {
    let name = url.replace('.' + getExtension(url), '');

    // remove leading slash if there is no folder in the path
    // @see https://stackoverflow.com/a/50592629/2124254
    return name.split('/').length == 2 ? name.replace(leadingSlash, '') : name;
  }

  /**
   * Get the full url from the base.
   * @param {}
   */
  function getUrl(url, base) {
    return new URL(url, base).href;
  }

  /**
   * Load an Image file. Uses imagePath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string} url - The URL to the Image file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Image.
   *
   * @example
   * kontra.loadImage('car.png');
   * kontra.loadImage('autobots/truck.png');
   */
  function loadImage(originalUrl, url) {
    return new Promise(function(resolve, reject) {
      let image = new Image();
      url = joinPath(assets.imagePath, originalUrl);

      image.onload = function loadImageOnLoad() {
        let fullUrl = getUrl(url, window.location.href);
        assets.images[ getName(originalUrl) ] = assets.images[url] = assets.images[fullUrl] = this;
        resolve(this);
      };

      image.onerror = function loadImageOnError() {
        reject(/* @if DEBUG */ 'Unable to load image ' + /* @endif */ url);
      };

      image.src = url;
    });
  }

  /**
   * Load an Audio file. Supports loading multiple audio formats which will be resolved by
   * the browser in the order listed. Uses audioPath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string|string[]} url - The URL to the Audio file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Audio.
   *
   * @example
   * kontra.loadAudio('sound_effects/laser.mp3');
   * kontra.loadAudio(['explosion.mp3', 'explosion.m4a', 'explosion.ogg']);
   */
  function loadAudio(originalUrl, url, undefined$1) {
    return new Promise(function(resolve, reject) {

      // determine which audio format the browser can play
      originalUrl = [].concat(originalUrl).reduce(function(a, source) {
        return canUse[ getExtension(source) ] ? source : a
      }, undefined$1);

      if (!originalUrl) {
        reject(/* @if DEBUG */ 'cannot play any of the audio formats provided' + /* @endif */ originalUrl);
      }
      else {
        let audio = new Audio();
        url = joinPath(assets.audioPath, originalUrl);

        audio.addEventListener('canplay', function loadAudioOnLoad() {
          let fullUrl = getUrl(url, window.location.href);
          assets.audio[ getName(originalUrl) ] = assets.audio[url] = assets.audio[fullUrl] = this;
          resolve(this);
        });

        audio.onerror = function loadAudioOnError() {
          reject(/* @if DEBUG */ 'Unable to load audio ' + /* @endif */ url);
        };

        audio.src = url;
        audio.load();
      }
    });
  }

  /**
   * Load a data file (be it text or JSON). Uses dataPath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string} url - The URL to the data file.
   *
   * @returns {Promise} A deferred promise. Resolves with the data or parsed JSON.
   *
   * @example
   * kontra.loadData('bio.json');
   * kontra.loadData('dialog.txt');
   */
  function loadData(originalUrl, url) {
    url = joinPath(assets.dataPath, originalUrl);

    return fetch(url).then(function(response) {
      if (!response.ok) throw response;
      return response.clone().json().catch(function() { return response.text() })
    }).then(function(data) {
      let fullUrl = getUrl(url, window.location.href);
      if (typeof data === 'object') {
        dataMap.set(data, fullUrl);
      }

      assets.data[ getName(originalUrl) ] = assets.data[url] = assets.data[fullUrl] = data;
      return data;
    });
  }

  /**
   * Object for loading assets.
   */
  assets = {
    // all assets are stored by name as well as by URL
    images: {},
    audio: {},
    data: {},

    // base asset path for determining asset URLs
    imagePath: '',
    audioPath: '',
    dataPath: '',

    // expose for tileEngine
    _d: dataMap,
    _u: getUrl,

    /**
     * Load an Image, Audio, or data file.
     * @memberOf kontra.assets
     *
     * @param {string|string[]} - Comma separated list of assets to load.
     *
     * @returns {Promise}
     *
     * @example
     * kontra.loadAsset('car.png');
     * kontra.loadAsset(['explosion.mp3', 'explosion.ogg']);
     * kontra.loadAsset('bio.json');
     * kontra.loadAsset('car.png', ['explosion.mp3', 'explosion.ogg'], 'bio.json');
     */
    load() {
      let promises = [];
      let url, extension, asset, i, promise;

      for (i = 0; (asset = arguments[i]); i++) {
        url = [].concat(asset)[0];

        extension = getExtension(url);
        if (extension.match(imageRegex)) {
          promise = loadImage(asset);
        }
        else if (extension.match(audioRegex)) {
          promise = loadAudio(asset);
        }
        else {
          promise = loadData(asset);
        }

        promises.push(promise);
      }

      return Promise.all(promises);
    }
  };

  var assets$1 = assets;

  let callbacks = {};

  /**
   * Register a callback for an event.
   * @memberof kontra
   *
   * @param {string} event - Name of the event
   * @param {function} callback - Function callback
   */
  function on(event, callback) {
    callbacks[event] = callbacks[event] || [];
    callbacks[event].push(callback);
  }

  /**
   * Remove a callback for an event.
   * @memberof kontra
   *
   * @param {string} event - Name of the event
   * @param {function} callback - Function callback
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  function off(event, callback, index) {
    if (!callbacks[event] || (index = callbacks[event].indexOf(callback)) < 0) return;
    callbacks[event].splice(index, 1);
  }

  /**
   * Call all callback functions for the event.
   * @memberof kontra
   *
   * @param {string} event - Name of the event
   * @param {...*} args - Arguments passed to all callbacks
   */
  function emit(event, ...args) {
    if (!callbacks[event]) return;
    callbacks[event].forEach(fn => fn(...args));
  }

  let kontra = {
    /**
     * Initialize the canvas.
     * @memberof kontra
     *
     * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
     */
    init(canvas) {

      // check if canvas is a string first, an element next, or default to getting
      // first canvas on page
      this.canvas = document.getElementById(canvas) ||
                    canvas ||
                    document.querySelector('canvas');

      // @if DEBUG
      if (!this.canvas) {
        throw Error('You must provide a canvas element for the game');
      }
      // @endif

      this.context = this.canvas.getContext('2d');
      this.context.imageSmoothingEnabled = false;

      emit('init');
    }
  };

  class Animation {
    /**
     * Initialize properties on the animation.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - Properties of the animation.
     * @param {object} properties.spriteSheet - Sprite sheet for the animation.
     * @param {number[]} properties.frames - List of frames of the animation.
     * @param {number}  properties.frameRate - Number of frames to display in one second.
     * @param {boolean} [properties.loop=true] - If the animation should loop.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    constructor(properties, frame) {
      properties = properties || {};

      this.spriteSheet = properties.spriteSheet;
      this.frames = properties.frames;
      this.frameRate = properties.frameRate;
      this.loop = (properties.loop === undefined ? true : properties.loop);

      frame = properties.spriteSheet.frame;
      this.width = frame.width;
      this.height = frame.height;
      this.margin = frame.margin || 0;

      // f = frame, a = accumulator
      this._f = 0;
      this._a = 0;
    }

    /**
     * Clone an animation to be used more than once.
     * @memberof kontra.animation
     *
     * @returns {object}
     */
    clone() {
      return AnimationFactory(this);
    }

    /**
     * Reset an animation to the first frame.
     * @memberof kontra.animation
     */
    reset() {
      this._f = 0;
      this._a = 0;
    }

    /**
     * Update the animation. Used when the animation is not paused or stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {number} [dt=1/60] - Time since last update.
     */
    update(dt) {

      // if the animation doesn't loop we stop at the last frame
      if (!this.loop && this._f == this.frames.length-1) return;

      dt = dt || 1 / 60;

      this._a += dt;

      // update to the next frame if it's time
      while (this._a * this.frameRate >= 1) {
        this._f = ++this._f % this.frames.length;
        this._a -= 1 / this.frameRate;
      }
    }

    /**
     * Draw the current frame. Used when the animation is not stopped.
     * @memberof kontra.animation
     * @private
     *
     * @param {object} properties - How to draw the animation.
     * @param {number} properties.x - X position to draw.
     * @param {number} properties.y - Y position to draw.
     * @param {number} properties.width - width of the sprite.
     * @param {number} properties.height - height of the sprit.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     */
    render(properties) {
      properties = properties || {};

      // get the row and col of the frame
      let row = this.frames[this._f] / this.spriteSheet._f | 0;
      let col = this.frames[this._f] % this.spriteSheet._f | 0;
      let width = (properties.width !== undefined) ? properties.width : this.width;
      let height = (properties.height !== undefined) ? properties.height : this.height;
      let context = (properties.context || kontra.context);
      context.drawImage(
        this.spriteSheet.image,
        col * this.width + (col * 2 + 1) * this.margin,
        row * this.height + (row * 2 + 1) * this.margin,
        this.width, this.height,
        properties.x, properties.y,
        width, height
      );
    }
  }

  function animation(properties) {
    return new Animation(properties);
  }
  animation.prototype = Animation.prototype;

  /**
   * Noop function
   */
  const noop = () => {};

  /**
   * Game loop that updates and renders the game every frame.
   * @memberof kontra
   *
   * @param {object}   properties - Properties of the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.render - Function called to render the game.
   */
  function gameLoop(properties) {
    properties = properties || {};

    // check for required functions
    // @if DEBUG
    if ( !(properties.update && properties.render) ) {
      throw Error('You must provide update() and render() functions');
    }
    // @endif

    // animation variables
    let fps = properties.fps || 60;
    let accumulator = 0;
    let delta = 1E3 / fps;  // delta between performance.now timings (in ms)
    let step = 1 / fps;

    let clear = (properties.clearCanvas === false ?
                noop :
                function clear() {
                  kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
                });
    let last, rAF, now, dt, loop;

    /**
     * Called every frame of the game loop.
     */
    function frame() {
      rAF = requestAnimationFrame(frame);

      now = performance.now();
      dt = now - last;
      last = now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (dt > 1E3) {
        return;
      }

      emit('tick');
      accumulator += dt;

      while (accumulator >= delta) {
        loop.update(step);

        accumulator -= delta;
      }

      clear();
      loop.render();
    }

    // game loop object
    loop = {
      update: properties.update,
      render: properties.render,
      isStopped: true,

      /**
       * Start the game loop.
       * @memberof kontra.gameLoop
       */
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },

      /**
       * Stop the game loop.
       */
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },

      // expose properties for testing
      // @if DEBUG
      _frame: frame,
      set _last(value) {
        last = value;
      }
      // @endif
    };

    return loop;
  }

  kontra.animation = animation;
  kontra.assets = assets$1;
  kontra.on = on;
  kontra.off = off;
  kontra.emit = emit;
  kontra.gameLoop = gameLoop;

  return kontra;

}());
