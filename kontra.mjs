/**
 * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
 *
 * ```js
 * import { on, off, emit } from 'kontra';
 *
 * function callback(a, b, c) {
 *   console.log({a, b, c});
 * });
 *
 * on('myEvent', callback);
 * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
 * off('myEvent', callback);
 * ```
 * @sectionName Events
 */

// expose for testing
let callbacks = {};

/**
 * There are currently only three lifecycle events:
 * - `init` - Emitted after `konta.init()` is called.
 * - `tick` - Emitted every frame of kontra.GameLoop before the loops `update()` and `render()` functions are called.
 * - `assetLoaded` - Emitted after an asset has fully loaded using the asset loader. The callback function is passed the asset and the url of the asset as parameters.
 * @sectionName Lifecycle Events
 */

/**
 * Register a callback for an event to be called whenever the event is emitted. The callback will be passed all arguments used in the `emit` call.
 * @function on
 *
 * @param {String} event - Name of the event.
 * @param {Function} callback - Function that will be called when the event is emitted.
 */
function on(event, callback) {
  callbacks[event] = callbacks[event] || [];
  callbacks[event].push(callback);
}

/**
 * Remove a callback for an event.
 * @function off
 *
 * @param {String} event - Name of the event.
 * @param {Function} callback - The function that was passed during registration.
 */
function off(event, callback) {
  let index;

  if (!callbacks[event] || (index = callbacks[event].indexOf(callback)) < 0) return;
  callbacks[event].splice(index, 1);
}

/**
 * Call all callback functions for the event. All arguments will be passed to the callback functions.
 * @function emit
 *
 * @param {String} event - Name of the event.
 * @param {*} [args] - Arguments passed to all callbacks.
 */
function emit(event, ...args) {
  if (!callbacks[event]) return;
  callbacks[event].map(fn => fn(...args));
}

/**
 * Functions for initializing the Kontra library and getting the canvas and context
 * objects.
 *
 * ```js
 * import { getCanvas, getContext, init } from 'kontra';
 *
 * let { canvas, context } = init();
 *
 * // or can get canvas and context through functions
 * canvas = getCanvas();
 * context = getContext();
 * ```
 * @sectionName Core
 */

let canvasEl;
let context;

/**
 * Return the canvas element.
 * @function getCanvas
 *
 * @returns {HTMLCanvasElement} The canvas element for the game.
 */
function getCanvas() {
  return canvasEl;
}

/**
 * Return the context object.
 * @function getContext
 *
 * @returns {CanvasRenderingContext2D} The context object the game draws to.
 */
function getContext() {
  return context;
}

/**
 * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
 *
 * ```js
 * import { init } from 'kontra';
 *
 * let { canvas, context } = init('game');
 * ```
 * @function init
 *
 * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
 *
 * @returns {Object} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
 */
function init(canvas) {

  // check if canvas is a string first, an element next, or default to getting
  // first canvas on page
  canvasEl = document.getElementById(canvas) ||
             canvas ||
             document.querySelector('canvas');

  // @if DEBUG
  if (!canvasEl) {
    throw Error('You must provide a canvas element for the game');
  }
  // @endif

  context = canvasEl.getContext('2d');
  context.imageSmoothingEnabled = false;

  emit('init');

  return { canvas: canvasEl, context };
}

/**
 * An object for drawing sprite sheet animations.
 *
 * An animation defines the sequence of frames to use from a sprite sheet. It also defines at what speed the animation should run using `frameRate`.
 *
 * Typically you don't create an kontra.Animation directly, but rather you would create them from kontra.SpriteSheet by passing the `animations` argument.
 *
 * ```js
 * import { SpriteSheet, Animation } from 'kontra';
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character_walk_sheet.png';
 * image.onload = function() {
 *   let spriteSheet = SpriteSheet({
 *     image: image,
 *     frameWidth: 72,
 *     frameHeight: 97
 *   });
 *
 *   // you typically wouldn't create an Animation this way
 *   let animation = Animation({
 *     spriteSheet: spriteSheet,
 *     frames: [1,2,3,6],
 *     frameRate: 30
 *   });
 * };
 * ```
 * @class Animation
 *
 * @param {Object} properties - Properties of the animation.
 * @param {kontra.SpriteSheet} properties.spriteSheet - Sprite sheet for the animation.
 * @param {Number[]} properties.frames - List of frames of the animation.
 * @param {Number}  properties.frameRate - Number of frames to display in one second.
 * @param {Boolean} [properties.loop=true] - If the animation should loop.
 */
class Animation {
  constructor({spriteSheet, frames, frameRate, loop = true} = {}) {

    /**
     * The sprite sheet to use for the animation.
     * @memberof Animation
     * @property {kontra.SpriteSheet} spriteSheet
     */
    this.spriteSheet = spriteSheet;

    /**
     * Sequence of frames to use from the sprite sheet.
     * @memberof Animation
     * @property {Number[]} frames
     */
    this.frames = frames;

    /**
     * Number of frames to display per second. Adjusting this value will change the speed of the animation.
     * @memberof Animation
     * @property {Number} frameRate
     */
    this.frameRate = frameRate;

    /**
     * If the animation should loop back to the beginning once completed.
     * @memberof Animation
     * @property {Boolean} loop
     */
    this.loop = loop;

    let { width, height, margin = 0 } = spriteSheet.frame;

    /**
     * The width of an individual frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
     * @memberof Animation
     * @property {Number} width
     */
    this.width = width;

    /**
     * The height of an individual frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
     * @memberof Animation
     * @property {Number} height
     */
    this.height = height;

    /**
     * The space between each frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
     * @memberof Animation
     * @property {Number} margin
     */
    this.margin = margin;

    // f = frame, a = accumulator
    this._f = 0;
    this._a = 0;
  }

  /**
   * Clone an animation so it can be used more than once. By default animations passed to kontra.Sprite will be cloned so no two sprites update the same animation. Otherwise two sprites who shared the same animation would make it update twice as fast.
   * @memberof Animation
   * @function clone
   *
   * @returns {kontra.Animation} A new kontra.Animation instance.
   */
  clone() {
    return animationFactory(this);
  }

  /**
   * Reset an animation to the first frame.
   * @memberof Animation
   * @function reset
   */
  reset() {
    this._f = 0;
    this._a = 0;
  }

  /**
   * Update the animation.
   * @memberof Animation
   * @function update
   *
   * @param {Number} [dt=1/60] - Time since last update.
   */
  update(dt = 1/60) {

    // if the animation doesn't loop we stop at the last frame
    if (!this.loop && this._f == this.frames.length-1) return;

    this._a += dt;

    // update to the next frame if it's time
    while (this._a * this.frameRate >= 1) {
      this._f = ++this._f % this.frames.length;
      this._a -= 1 / this.frameRate;
    }
  }

  /**
   * Draw the current frame of the animation.
   * @memberof Animation
   * @function render
   *
   * @param {Object} properties - Properties to draw the animation.
   * @param {Number} properties.x - X position to draw the animation.
   * @param {Number} properties.y - Y position to draw the animation.
   * @param {Number} [properties.width] - width of the sprite. Defaults to [Animation.width](api/animation#width).
   * @param {Number} [properties.height] - height of the sprite. Defaults to [Animation.height](api/animation#height).
   * @param {Canvas​Rendering​Context2D} [properties.context] - The context the animation should draw to. Defaults to [core.getContext()](api/core#getContext).
   */
  render({x, y, width = this.width, height = this.height, context = getContext()} = {}) {

    // get the row and col of the frame
    let row = this.frames[this._f] / this.spriteSheet._f | 0;
    let col = this.frames[this._f] % this.spriteSheet._f | 0;

    context.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width, this.height,
      x, y,
      width, height
    );
  }
}

function animationFactory(properties) {
  return new Animation(properties);
}
animationFactory.prototype = Animation.prototype;
animationFactory.class = Animation;

/**
 * A promise based asset loader for loading images, audio, and data files. An `assetLoaded` event is emitted after each asset is fully loaded. The callback for the event is passed the asset and the url to the asset as parameters.
 *
 * ```js
 * import { load, on } from 'kontra';
 *
 * let numAssets = 3;
 * let assetsLoaded = 0;
 * on('assetLoaded', (asset, url) => {
 *   assetsLoaded++;
 *
 *   // inform user or update progress bar
 * });
 *
 * load(
 *   'assets/imgs/character.png',
 *   'assets/data/tile_engine_basic.json',
 *   ['/audio/music.ogg', '/audio/music.mp3']
 * ).then(function(assets) {
 *   // all assets have loaded
 * }).catch(function(err) {
 *   // error loading an asset
 * });
 * ```
 * @sectionName Assets
 */

let imageRegex = /(jpeg|jpg|gif|png)$/;
let audioRegex = /(wav|mp3|ogg|aac)$/;
let leadingSlash = /^\//;
let trailingSlash = /\/$/;
let dataMap = new WeakMap();

let imagePath = '';
let audioPath = '';
let dataPath = '';

/**
 * Get the full URL from the base.
 *
 * @param {String} url - The URL to the asset.
 * @param {String} base - Base URL.
 *
 * @returns {String}
 */
function getUrl(url, base) {
  return new URL(url, base).href;
}

/**
 * Join a base path and asset path.
 *
 * @param {String} base - The asset base path.
 * @param {String} url - The URL to the asset.
 *
 * @returns {String}
 */
function joinPath(base, url) {
  return [base.replace(trailingSlash, ''), base ? url.replace(leadingSlash, '') : url]
    .filter(s => s)
    .join('/')
}

/**
 * Get the extension of an asset.
 *
 * @param {String} url - The URL to the asset.
 *
 * @returns {String}
 */
function getExtension(url) {
  return url.split('.').pop();
}

/**
 * Get the name of an asset.
 *
 * @param {String} url - The URL to the asset.
 *
 * @returns {String}
 */
function getName(url) {
  let name = url.replace('.' + getExtension(url), '');

  // remove leading slash if there is no folder in the path
  // @see https://stackoverflow.com/a/50592629/2124254
  return name.split('/').length == 2 ? name.replace(leadingSlash, '') : name;
}

/**
 * Get browser audio playability.
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
 *
 * @param {HTMLMediaElement} audio - Audio element.
 *
 * @returns {object}
 */
function getCanPlay(audio) {
  return {
    wav: '',
    mp3: audio.canPlayType('audio/mpeg;'),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"'),
    aac: audio.canPlayType('audio/aac;')
  };
}

/**
 * Object of all loaded image assets by both file name and path. If the base [image path](api/assets#setImagePath) was set before the image was loaded, the file name and path will not include the base image path.
 *
 * ```js
 * import { load, setImagePath, imageAssets } from 'kontra';
 *
 * load('assets/imgs/character.png').then(function() {
 *   // Image asset can be accessed by both
 *   // name: imageAssets['assets/imgs/character']
 *   // path: imageAssets['assets/imgs/character.png']
 * });
 *
 * setImagePath('assets/imgs');
 * load('character_walk_sheet.png').then(function() {
 *   // Image asset can be accessed by both
 *   // name: imageAssets['character_walk_sheet']
 *   // path: imageAssets['character_walk_sheet.png']
 * });
 * ```
 * @property {Object} imageAssets
 */
let imageAssets = {};

/**
 * Object of all loaded audio assets by both file name and path. If the base [audio path](api/assets#setAudioPath) was set before the audio was loaded, the file name and path will not include the base audio path.
 *
 * ```js
 * import { load, setAudioPath, audioAssets } from 'kontra';
 *
 * load('/audio/music.ogg').then(function() {
 *   // Audio asset can be accessed by both
 *   // name: audioAssets['/audio/music']
 *   // path: audioAssets['/audio/music.ogg']
 * });
 *
 * setAudioPath('/audio');
 * load('sound.ogg').then(function() {
 *   // Audio asset can be accessed by both
 *   // name: audioAssets['sound']
 *   // path: audioAssets['sound.ogg']
 * });
 * ```
 * @property {Object} audioAssets
 */
let audioAssets = {};

/**
 * Object of all loaded data assets by both file name and path. If the base [data path](api/assets#setDataPath) was set before the data was loaded, the file name and path will not include the base data path.
 *
 * ```js
 * import { load, setDataPath, dataAssets } from 'kontra';
 *
 * load('assets/data/file.txt').then(function() {
 *   // Audio asset can be accessed by both
 *   // name: dataAssets['assets/data/file']
 *   // path: dataAssets['assets/data/file.txt']
 * });
 *
 * setDataPath('assets/data');
 * load('info.json').then(function() {
 *   // Audio asset can be accessed by both
 *   // name: dataAssets['info']
 *   // path: dataAssets['info.json']
 * });
 * ```
 * @property {Object} dataAssets
 */
let dataAssets = {};

/**
 * Add a global kontra object so TileEngine can access information about the
 * loaded assets when kontra is loaded in parts rather than as a whole (e.g.
 * `import { load, TileEngine } from 'kontra';`)
 */
function addGlobal() {
  if (!window.__k) {
    window.__k = {
      dm: dataMap,
      u: getUrl,
      d: dataAssets,
      i: imageAssets
    };
  }
}

/**
 * Sets the base path for all image assets. If a base path is set, all load calls for image assets will prepend the base path to the URL.
 *
 * ```js
 * import { setImagePath, load } from 'kontra';
 *
 * setImagePath('/imgs');
 * load('character.png');  // loads '/imgs/character.png'
 * ```
 * @function setImagePath
 *
 * @param {String} path - Base image path.
 */
function setImagePath(path) {
  imagePath = path;
}

/**
 * Sets the base path for all audio assets. If a base path is set, all load calls for audio assets will prepend the base path to the URL.
 *
 * ```js
 * import { setAudioPath, load } from 'kontra';
 *
 * setAudioPath('/audio');
 * load('music.ogg');  // loads '/audio/music.ogg'
 * ```
 * @function setAudioPath
 *
 * @param {String} path - Base audio path.
 */
function setAudioPath(path) {
  audioPath = path;
}

/**
 * Sets the base path for all data assets. If a base path is set, all load calls for data assets will prepend the base path to the URL.
 *
 * ```js
 * import { setDataPath, load } from 'kontra';
 *
 * setDataPath('/data');
 * load('file.json');  // loads '/data/file.json'
 * ```
 * @function setDataPath
 *
 * @param {String} path - Base data path.
 */
function setDataPath(path) {
  dataPath = path;
}

/**
 * Load a single Image asset. Uses the base [image path](api/assets#setImagePath) to resolve the URL.
 *
 * Once loaded, the asset will be accessible on the the [imageAssets](api/assets#imageAssets) property.
 *
 * ```js
 * import { loadImage } from 'kontra';
 *
 * loadImage('car.png').then(function(image) {
 *   console.log(image.src);  //=> 'car.png'
 * })
 * ```
 * @function loadImage
 *
 * @param {String} url - The URL to the Image file.
 *
 * @returns {Promise} A deferred promise. Promise resolves with the Image.
 */
function loadImage(url) {
  addGlobal();

  return new Promise((resolve, reject) => {
    let resolvedUrl, image, fullUrl;

    resolvedUrl = joinPath(imagePath, url);
    if (imageAssets[resolvedUrl]) return resolve(imageAssets[resolvedUrl]);

    image = new Image();

    image.onload = function loadImageOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      imageAssets[ getName(url) ] = imageAssets[resolvedUrl] = imageAssets[fullUrl] = this;
      emit('assetLoaded', this, url);
      resolve(this);
    };

    image.onerror = function loadImageOnError() {
      reject(/* @if DEBUG */ 'Unable to load image ' + /* @endif */ resolvedUrl);
    };

    image.src = resolvedUrl;
  });
}

/**
 * Load a single Audio asset. Supports loading multiple audio formats which the loader will use to load the first audio format supported by the browser in the order listed. Uses the base [audio path](api/assets#setAudioPath) to resolve the URL.
 *
 * Once loaded, the asset will be accessible on the the [audioAssets](api/assets#audioAssets) property. Since the loader determines which audio asset to load based on browser support, you should only reference the audio by its name and not by its file path since there's no guarantee which asset was loaded.
 *
 * ```js
 * import { loadAudio, audioAssets } from 'kontra';
 *
 * loadAudio([
 *   '/audio/music.mp3',
 *   '/audio/music.ogg'
 * ]).then(function(audio) {
 *
 *   // access audio by its name only (not by its .mp3 or .ogg path)
 *   audioAssets['/audio/music'].play();
 * })
 * ```
 * @function loadAudio
 *
 * @param {String} url - The URL to the Audio file.
 *
 * @returns {Promise} A deferred promise. Promise resolves with the Audio.
 */
function loadAudio(url) {
  return new Promise((resolve, reject) => {
    let audioEl, canPlay, resolvedUrl, fullUrl;

    audioEl = new Audio();
    canPlay = getCanPlay(audioEl);

    // determine the first audio format the browser can play
    url = [].concat(url)
            .reduce((playableSource, source) => playableSource
              ? playableSource
              : canPlay[ getExtension(source) ]
                ? source
                : null
            , 0);  // 0 is the shortest falsy value

    if (!url) {
      return reject(/* @if DEBUG */ 'cannot play any of the audio formats provided' + /* @endif */ url);
    }

    resolvedUrl = joinPath(audioPath, url);
    if (audioAssets[resolvedUrl]) return resolve(audioAssets[resolvedUrl]);

    audioEl.addEventListener('canplay', function loadAudioOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      audioAssets[ getName(url) ] = audioAssets[resolvedUrl] = audioAssets[fullUrl] = this;
      emit('assetLoaded', this, url);
      resolve(this);
    });

    audioEl.onerror = function loadAudioOnError() {
      reject(/* @if DEBUG */ 'Unable to load audio ' + /* @endif */ resolvedUrl);
    };

    audioEl.src = resolvedUrl;
    audioEl.load();
  });
}

/**
 * Load a single Data asset. Uses the base [data path](api/assets#setDataPath) to resolve the URL.
 *
 * Once loaded, the asset will be accessible on the the [dataAssets](api/assets#dataAssets) property.
 *
 * ```js
 * import { loadData } from 'kontra';
 *
 * loadData('assets/data/tile_engine_basic.json').then(function(data) {
 *   // data contains the parsed JSON data
 * })
 * ```
 * @function loadData
 *
 * @param {String} url - The URL to the Data file.
 *
 * @returns {Promise} A deferred promise. Promise resolves with the contents of the file. If the file is a JSON file, the contents will be parsed as JSON.
 */
function loadData(url) {
  addGlobal();
  let resolvedUrl, fullUrl;

  resolvedUrl = joinPath(dataPath, url);
  if (dataAssets[resolvedUrl]) return Promise.resolve(dataAssets[resolvedUrl]);

  return fetch(resolvedUrl).then(response => {
    if (!response.ok) throw response;
    return response.clone().json().catch(() => response.text())
  }).then(response => {
    fullUrl = getUrl(resolvedUrl, window.location.href);
    if (typeof response === 'object') {
      dataMap.set(response, fullUrl);
    }

    dataAssets[ getName(url) ] = dataAssets[resolvedUrl] = dataAssets[fullUrl] = response;
    emit('assetLoaded', response, url);
    return response;
  });
}

/**
 * Load Image, Audio, or data files. Uses the [loadImage](api/assets#loadImage), [loadAudio](api/assets#loadAudio), and [loadData](api/assets#loadData) functions to load each asset type.
 *
 * ```js
 * import { load } from 'kontra';
 *
 * load(
 *   'assets/imgs/character.png',
 *   'assets/data/tile_engine_basic.json',
 *   ['/audio/music.ogg', '/audio/music.mp3']
 * ).then(function(assets) {
 *   // all assets have loaded
 * }).catch(function(err) {
 *   // error loading an asset
 * });
 * ```
 * @function load
 *
 * @param {String|String[]} urls - Comma separated list of asset urls to load.
 *
 * @returns {Promise} A deferred promise. Resolves with all the loaded assets.
 */
function load(...urls) {
  addGlobal();

  return Promise.all(
    urls.map(asset => {
      // account for a string or an array for the url
      let extension = getExtension( [].concat(asset)[0] );

      return extension.match(imageRegex)
        ? loadImage(asset)
        : extension.match(audioRegex)
          ? loadAudio(asset)
          : loadData(asset);
    })
  );
}

// expose for testing


// Override the getCanPlay function to provide a specific return type for tests

/**
 * Noop function
 */
const noop = () => {};

/**
 * Clear the canvas.
 */
function clear() {
  let canvas = getCanvas();
  getContext().clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * The game loop updates and renders the game every frame. The game loop is stopped by default and will not start until the loops `start()` function is called.
 *
 * The game loop uses a time-based animation with a fixed `dt` to [avoid frame rate issues](http://blog.sklambert.com/using-time-based-animation-implement/). Each update call is guaranteed to equal 1/60 of a second.
 *
 * This means that you can avoid having to do time based calculations in your update functions  and instead do fixed updates.
 *
 * ```js
 * import { Sprite, GameLoop } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40,
 *   color: 'red'
 * });
 *
 * let loop = GameLoop({
 *   update: function(dt) {
 *     // no need to determine how many pixels you want to
 *     // move every second and multiple by dt
 *     // sprite.x += 180 * dt;
 *
 *     // instead just update by how many pixels you want
 *     // to move every frame and the loop will ensure 60FPS
 *     sprite.x += 3;
 *   },
 *   render: function() {
 *     sprite.render();
 *   }
 * });
 *
 * loop.start();
 * ```
 * @sectionName GameLoop
 *
 * @param {Object}   properties - Properties of the game loop.
 * @param {Function} properties.update - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
 * @param {Function} properties.render - Function called every frame to render the game.
 * @param {Number}   [properties.fps=60] - Desired frame rate.
 * @param {Boolean}  [properties.clearCanvas=true] - Clear the canvas every frame before the `render()` function is called.
 */
function GameLoop({fps = 60, clearCanvas = true, update, render} = {}) {
  // check for required functions
  // @if DEBUG
  if ( !(update && render) ) {
    throw Error('You must provide update() and render() functions');
  }
  // @endif

  // animation variables
  let accumulator = 0;
  let delta = 1E3 / fps;  // delta between performance.now timings (in ms)
  let step = 1 / fps;
  let clearFn = clearCanvas ? clear : noop;
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

    clearFn();
    loop.render();
  }

  // game loop object
  loop = {
    /**
     * Called every frame to update the game. Put all of your games update logic here.
     * @memberof GameLoop
     * @function update
     *
     * @param {Number} dt - The fixed dt time of 1/60 of a frame.
     */
    update,

    /**
     * Called every frame to render the game. Put all of your games render logic here.
     * @memberof GameLoop
     * @function render
     */
    render,

    /**
     * If the game loop is currently stopped.
     *
     * ```js
     * import { GameLoop } from 'kontra';
     *
     * let loop = GameLoop({
     *   // ...
     * });
     * console.log(loop.isStopped);  //=> true
     *
     * loop.start();
     * console.log(loop.isStopped);  //=> false
     *
     * loop.stop();
     * console.log(loop.isStopped);  //=> true
     * ```
     * @memberof GameLoop
     * @property {Boolean} isStopped
     */
    isStopped: true,

    /**
     * Start the game loop.
     * @memberof GameLoop
     * @function start
     */
    start() {
      last = performance.now();
      this.isStopped = false;
      requestAnimationFrame(frame);
    },

    /**
     * Stop the game loop.
     * @memberof GameLoop
     * @function stop
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

/**
 * A minimalistic keyboard API. You can use it move the main sprite or respond to a key press.
 *
 * ```js
 * import { initKeys, keyPressed } from 'kontra';
 *
 * // this function must be called first before keyboard
 * // functions will work
 * initKeys();
 *
 * function update() {
 *   if (keyPressed('left')) {
 *     // move left
 *   }
 * }
 * ```
 * @sectionName Keyboard
 */

/**
 * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](api/keyboard#keyMap) property.
 *
 * - a-z
 * - 0-9
 * - enter, esc, space, left, up, right, down
 * @sectionName Available Keys
 */

let callbacks$1 = {};
let pressedKeys = {};

/**
 * A map of keycodes to key names. Add to this object to expand the list of [available keys](api/keyboard#available-keys).
 *
 * ```js
 * import { keyMap, bindKeys } from 'kontra';
 *
 * keyMap[34] = 'pageDown';
 *
 * bindKeys('pageDown', function(e) {
 *   // handle pageDown key
 * });
 * ```
 * @property {Object} keyMap
 */
let keyMap = {
  // named keys
  'Enter': 'enter',
  'Escape': 'esc',
  'Space': 'space',
  'ArrowLeft': 'left',
  'ArrowUp': 'up',
  'ArrowRight': 'right',
  'ArrowDown': 'down',
  // for Edge compatibility
  13: 'enter',
  27: 'esc',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  let key = keyMap[evt.code || evt.which];
  pressedKeys[key] = true;

  if (callbacks$1[key]) {
    callbacks$1[key](evt);
  }
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  pressedKeys[ keyMap[evt.code || evt.which] ] = false;
}

/**
 * Reset pressed keys.
 */
function blurEventHandler() {
  pressedKeys = {};
}

/**
 * Initialize keyboard event listeners. This function must be called before using other keyboard functions.
 * @function initKeys
 */
function initKeys() {
  let i;

  // alpha keys
  // @see https://stackoverflow.com/a/43095772/2124254
  for (i = 0; i < 26; i++) {
    // rollupjs considers this a side-effect (for now), so we'll do it in the
    // initKeys function
    keyMap[i + 65] = keyMap['Key' + String.fromCharCode(i + 65)] = String.fromCharCode(i + 97);
  }

  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap[48+i] = keyMap['Digit'+i] = ''+i;
  }

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler);
}

/**
 * Bind a set of keys that will call the callback function when they are pressed. Takes a single key or an array of keys. Is passed the original KeyboardEvent as a parameter.
 *
 * ```js
 * import { initKeys, bindKeys } from 'kontra';
 *
 * initKeys();
 *
 * bindKeys('p', function(e) {
 *   // pause the game
 * });
 * bindKeys(['enter', 'space'], function(e) {
 *   e.preventDefault();
 *   // fire gun
 * });
 * ```
 * @function bindKeys
 *
 * @param {String|String[]} keys - Key or keys to bind.
 */
function bindKeys(keys, callback) {
  // smaller than doing `Array.isArray(keys) ? keys : [keys]`
  [].concat(keys).map(key => callbacks$1[key] = callback);
}

/**
 * Remove the callback function for a bound set of keys. Takes a single key or an array of keys.
 *
 * ```js
 * import { unbindKeys } from 'kontra';
 *
 * unbindKeys('left');
 * unbindKeys(['enter', 'space']);
 * ```
 * @function unbindKeys
 *
 * @param {String|String[]} keys - Key or keys to unbind.
 */
function unbindKeys(keys) {
  // 0 is the smallest falsy value
  [].concat(keys).map(key => callbacks$1[key] = 0);
}

/**
 * Check if a key is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * ```js
 * import { Sprite, initKeys, keyPressed } from 'kontra';
 *
 * initKeys();
 *
 * let sprite = Sprite({
 *   update: function() {
 *     if (keyPressed('left')){
 *       // left arrow pressed
 *     }
 *     else if (keyPressed('right')) {
 *       // right arrow pressed
 *     }
 *
 *     if (keyPressed('up')) {
 *       // up arrow pressed
 *     }
 *     else if (keyPressed('down')) {
 *       // down arrow pressed
 *     }
 *   }
 * });
 * ```
 * @function keyPressed
 *
 * @param {String} key - Key to check for pressed state.
 *
 * @returns {Boolean} `true` if the key is pressed, `false` otherwise.
 */
function keyPressed(key) {
  return !!pressedKeys[key];
}

/**
 * A plugin system based on the [interceptor pattern](https://en.wikipedia.org/wiki/Interceptor_pattern), designed to share reusable code such as more advance collision detection or a 2D physics engine.
 *
 * ```js
 * import { registerPlugin, Sprite } from 'kontra';
 * import loggingPlugin from 'path/to/plugin/code.js'
 *
 * // register a plugin that adds logging to all Sprites
 * registerPlugin(Sprite, loggingPlugin);
 * ```
 * @sectionName Plugin
 */

/**
 * @docs docs/api_docs/plugin.js
 */

/**
 * Get the kontra object method name from the plugin.
 *
 * @param {String} methodName - Before/After function name
 *
 * @returns {String}
 */
function getMethod(methodName) {
  let methodTitle = methodName.substr( methodName.search(/[A-Z]/) );
  return methodTitle[0].toLowerCase() + methodTitle.substr(1);
}

/**
 * Remove an interceptor.
 *
 * @param {function[]} interceptors - Before/After interceptor list
 * @param {function} fn - Interceptor function
 */
function removeInterceptor(interceptors, fn) {
  let index = interceptors.indexOf(fn);
  if (index !== -1) {
    interceptors.splice(index, 1);
  }
}

/**
 * Register a plugin to run a set of functions before or after the Kontra object functions.
 * @function registerPlugin
 *
 * @param {Object} kontraObj - Kontra object to attach the plugin to.
 * @param {Object} pluginObj - Plugin object with before and after intercept functions.
 */
function registerPlugin(kontraObj, pluginObj) {
  let objectProto = kontraObj.prototype;

  if (!objectProto) return;

  // create interceptor list and functions
  if (!objectProto._inc) {
    objectProto._inc = {};
    objectProto._bInc = function beforePlugins(context, method, ...args) {
      return this._inc[method].before.reduce((acc, fn) => {
        let newArgs = fn(context, ...acc);
        return newArgs ? newArgs : acc;
      }, args);
    };
    objectProto._aInc = function afterPlugins(context, method, result, ...args) {
      return this._inc[method].after.reduce((acc, fn) => {
        let newResult = fn(context, acc, ...args);
        return newResult ? newResult : acc;
      }, result);
    };
  }

  // add plugin to interceptors
  Object.getOwnPropertyNames(pluginObj).forEach(methodName => {
    let method = getMethod(methodName);

    if (!objectProto[method]) return;

    // override original method
    if (!objectProto['_o' + method]) {
      objectProto['_o' + method] = objectProto[method];

      objectProto[method] = function interceptedFn(...args) {

        // call before interceptors
        let alteredArgs = this._bInc(this, method, ...args);

        let result = objectProto['_o' + method].call(this, ...alteredArgs);

        // call after interceptors
        return this._aInc(this, method, result, ...args);
      };
    }

    // create interceptors for the method
    if (!objectProto._inc[method]) {
      objectProto._inc[method] = {
        before: [],
        after: []
      };
    }

    if (methodName.startsWith('before')) {
      objectProto._inc[method].before.push(pluginObj[methodName]);
    }
    else if (methodName.startsWith('after')) {
      objectProto._inc[method].after.push(pluginObj[methodName]);
    }
  });
}

/**
 * Unregister a plugin from a Kontra object.
 * @function unregisterPlugin
 *
 * @param {Object} kontraObj - Kontra object to detach plugin from.
 * @param {Object} pluginObj - The plugin object that was passed during registration.
 */
function unregisterPlugin(kontraObj, pluginObj) {
  let objectProto = kontraObj.prototype;

  if (!objectProto || !objectProto._inc) return;

  // remove plugin from interceptors
  Object.getOwnPropertyNames(pluginObj).forEach(methodName => {
    let method = getMethod(methodName);

    if (methodName.startsWith('before')) {
      removeInterceptor(objectProto._inc[method].before, pluginObj[methodName]);
    }
    else if (methodName.startsWith('after')) {
      removeInterceptor(objectProto._inc[method].after, pluginObj[methodName]);
    }
  });
}

/**
 * Safely extend the functionality of a Kontra object. Any properties that already exist on the Kontra object will not be added.
 *
 * ```js
 * import { extendObject, Vector } from 'kontra';
 *
 * // add a subtract function to all Vectors
 * extendObject(Vector, {
 *   subtract(vec) {
 *     return Vector(this.x - vec.x, this.y - vec.y);
 *   }
 * });
 * ```
 * @function extendObject
 *
 * @param {Object} kontraObj - Kontra object to extend
 * @param {Object} properties - Properties to add.
 */
function extendObject(kontraObj, properties) {
  let objectProto = kontraObj.prototype;

  if (!objectProto) return;

  Object.getOwnPropertyNames(properties).forEach(prop => {
    if (!objectProto[prop]) {
      objectProto[prop] = properties[prop];
    }
  });
}

/**
 * A simple pointer API. You can use it move the main sprite or respond to a pointer event. Works with both mouse and touch events.
 *
 * Pointer events can be added on a global level or on individual sprites or objects. Before an object can receive pointer events, you must tell the pointer which objects to track and the object must haven been rendered to the canvas using `object.render()`.
 *
 * After an object is tracked and rendered, you can assign it an `onDown()`, `onUp()`, or `onOver()` functions which will be called whenever a pointer down, up, or over event happens on the object.
 *
 * ```js
 * import { initPointer, track, Sprite } from 'kontra';
 *
 * // this function must be called first before pointer
 * // functions will work
 * initPointer();
 *
 * let sprite = Sprite({
 *   onDown: function() {
 *     // handle on down events on the sprite
 *   },
 *   onUp: function() {
 *     // handle on up events on the sprite
 *   },
 *   onOver: function() {
 *     // handle on over events on the sprite
 *   }
 * });
 *
 * track(sprite);
 * sprite.render();
 * ```
 *
 * By default, the pointer is treated as a circle and will check for collisions against objects assuming they are rectangular (have a width and height property).
 *
 * If you need to perform a different type of collision detection, assign the object a `collidesWithPointer()` function and it will be called instead. The function is passed the pointer object. Use this function to determine how the pointer circle should collide with the object.
 *
 * ```js
 * import { Sprite } from 'kontra';

 * let sprite = Srite({
 *   x: 10,
 *   y: 10,
 *   radius: 10
 *   collidesWithPointer: function(pointer) {
 *     // perform a circle v circle collision test
 *     let dx = pointer.x - this.x;
 *     let dy = pointer.y - this.y;
 *     return Math.sqrt(dx * dx + dy * dy) < this.radius;
 *   }
 * });
 * ```
 * @sectionName Pointer
 */

// save each object as they are rendered to determine which object
// is on top when multiple objects are the target of an event.
// we'll always use the last frame's object order so we know
// the finalized order of all objects, otherwise an object could ask
// if it's being hovered when it's rendered first even if other objects
// would block it later in the render order
let thisFrameRenderOrder = [];
let lastFrameRenderOrder = [];

let callbacks$2 = {};
let trackedObjects = [];
let pressedButtons = {};

/**
 * Below is a list of buttons that you can use.
 *
 * - left, middle, right
 * @sectionName Available Buttons
 */
let buttonMap = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

/**
 * Object containing the `radius` and current `x` and `y` position of the pointer relative to the top-left corner of the canvas.
 *
 * ```js
 * import { initPointer, pointer } from 'kontra';
 *
 * initPointer();
 *
 * console.log(pointer);  //=> { x: 100, y: 200, radius: 5 };
 * ```
 * @property {Object} pointer
 */
let pointer = {
  x: 0,
  y: 0,
  radius: 5  // arbitrary size
};

/**
 * Detection collision between a rectangle and a circlevt.
 * @see https://yal.cc/rectangle-circle-intersection-test/
 *
 * @param {Object} object - Object to check collision against.
 */
function circleRectCollision(object) {
  let x = object.x;
  let y = object.y;
  if (object.anchor) {
    x -= object.width * object.anchor.x;
    y -= object.height * object.anchor.y;
  }

  let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + object.width));
  let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + object.height));
  return (dx * dx + dy * dy) < (pointer.radius * pointer.radius);
}

/**
 * Get the first on top object that the pointer collides with.
 *
 * @returns {Object} First object to collide with the pointer.
 */
function getCurrentObject() {

  // if pointer events are required on the very first frame or without a game
  // loop, use the current frame order array
  let frameOrder = (lastFrameRenderOrder.length ? lastFrameRenderOrder : thisFrameRenderOrder);
  let length = frameOrder.length - 1;
  let object, collides;

  for (let i = length; i >= 0; i--) {
    object = frameOrder[i];

    if (object.collidesWithPointer) {
      collides = object.collidesWithPointer(pointer);
    }
    else {
      collides = circleRectCollision(object);
    }

    if (collides) {
      return object;
    }
  }
}

/**
 * Execute the onDown callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerDownHandler(evt) {

  // touchstart should be treated like a left mouse button
  let button = evt.button !== undefined ? buttonMap[evt.button] : 'left';
  pressedButtons[button] = true;
  pointerHandler(evt, 'onDown');
}

/**
 * Execute the onUp callback for an object.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function pointerUpHandler(evt) {
  let button = evt.button !== undefined ? buttonMap[evt.button] : 'left';
  pressedButtons[button] = false;
  pointerHandler(evt, 'onUp');
}

/**
 * Track the position of the mousevt.
 *
 * @param {MouseEvent|TouchEvent} evt
 */
function mouseMoveHandler(evt) {
  pointerHandler(evt, 'onOver');
}

/**
 * Reset pressed buttons.
 */
function blurEventHandler$1() {
  pressedButtons = {};
}

/**
 * Find the first object for the event and execute it's callback function
 *
 * @param {MouseEvent|TouchEvent} evt
 * @param {string} eventName - Which event was called.
 */
function pointerHandler(evt, eventName) {
  let canvas = getCanvas();

  if (!canvas) return;

  let clientX, clientY;

  if (['touchstart', 'touchmove', 'touchend'].indexOf(evt.type) !== -1) {
    clientX = (evt.touches[0] || evt.changedTouches[0]).clientX;
    clientY = (evt.touches[0] || evt.changedTouches[0]).clientY;
  } else {
    clientX = evt.clientX;
    clientY = evt.clientY;
  }

  let ratio = canvas.height / canvas.offsetHeight;
  let rect = canvas.getBoundingClientRect();
  let x = (clientX - rect.left) * ratio;
  let y = (clientY - rect.top) * ratio;

  pointer.x = x;
  pointer.y = y;

  evt.preventDefault();
  let object = getCurrentObject();
  if (object && object[eventName]) {
    object[eventName](evt);
  }

  if (callbacks$2[eventName]) {
    callbacks$2[eventName](evt, object);
  }
}

/**
 * Initialize pointer event listeners. This function must be called before using other pointer functions.
 * @function initPointer
 */
function initPointer() {
  let canvas = getCanvas();

  canvas.addEventListener('mousedown', pointerDownHandler);
  canvas.addEventListener('touchstart', pointerDownHandler);
  canvas.addEventListener('mouseup', pointerUpHandler);
  canvas.addEventListener('touchend', pointerUpHandler);
  canvas.addEventListener('blur', blurEventHandler$1);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', mouseMoveHandler);

  // reset object render order on every new frame
  on('tick', () => {
    lastFrameRenderOrder.length = 0;

    thisFrameRenderOrder.map(object => {
      lastFrameRenderOrder.push(object);
    });

    thisFrameRenderOrder.length = 0;
  });
}

/**
 * Begin tracking pointer events for a set of objects. Takes a single object or an array of objects.
 *
 * ```js
 * import { initPointer, track } from 'kontra';
 *
 * initPointer();
 *
 * track(obj);
 * track([obj1, obj2]);
 * ```
 * @function track
 *
 * @param {Object|Object[]} objects - Objects to track.
 */
function track(objects) {
  [].concat(objects).map(object => {

    // override the objects render function to keep track of render order
    if (!object._r) {
      object._r = object.render;

      object.render = function() {
        thisFrameRenderOrder.push(this);
        this._r();
      };

      trackedObjects.push(object);
    }
  });
}

/**
* Remove the callback function for a bound set of objects.
 *
 * ```js
 * import { untrack } from 'kontra';
 *
 * untrack(obj);
 * untrack([obj1, obj2]);
 * ```
 * @function untrack
 *
 * @param {Object|Object[]} objects - Object or objects to stop tracking.
 */
function untrack(objects) {
  [].concat(objects).map(object => {

    // restore original render function to no longer track render order
    object.render = object._r;
    object._r = 0;  // 0 is the shortest falsy value

    let index = trackedObjects.indexOf(object);
    if (index !== -1) {
      trackedObjects.splice(index, 1);
    }
  });
}

/**
 * Check to see if the pointer is currently over the object. Since multiple objects may be rendered on top of one another, only the top most object under the pointer will return true.
 *
 * ```js
 * import { initPointer, track, pointer, pointerOver, Sprite } from 'kontra';
 *
 * initPointer();
 *
 * let sprite1 = Sprite({
 *   x: 10,
 *   y: 10,
 *   width: 10,
 *   height: 10
 * });
 * let sprite2 = Sprite({
 *   x: 15,
 *   y: 10,
 *   width: 10,
 *   height: 10
 * });
 *
 * track([sprite1, sprite2]);
 *
 * sprite1.render();
 * sprite2.render();
 *
 * pointer.x = 14;
 * pointer.y = 15;
 *
 * console.log(pointerOver(sprite1));  //=> false
 * console.log(pointerOver(sprite2));  //=> true
 * ```
 * @function pointerOver
 *
 * @param {Object} object - The object to check if the pointer is over.
 *
 * @returns {Boolean} `true` if the pointer is currently over the object, `false` otherwise.
 */
function pointerOver(object) {
  if (!trackedObjects.includes(object)) return false;

  return getCurrentObject() === object;
}

/**
 * Register a function to be called on all pointer down events. Is passed the original Event and the target object (if there is one).
 *
 * ```js
 * import { initPointer, onPointerDown } from 'kontra';
 *
 * initPointer();
 *
 * onPointerDown(function(e, object) {
 *   // handle pointer down
 * })
 * ```
 * @function onPointerDown
 *
 * @param {Function} callback - Function to call on pointer down.
 */
function onPointerDown(callback) {
  callbacks$2.onDown = callback;
}

/**
* Register a function to be called on all pointer up events. Is passed the original Event and the target object (if there is one).
 *
 * ```js
 * import { initPointer, onPointerUp } from 'kontra';
 *
 * initPointer();
 *
 * onPointerUp(function(e, object) {
 *   // handle pointer up
 * })
 * ```
 * @function onPointerUp
 *
 * @param {Function} callback - Function to call on pointer up.
 */
function onPointerUp(callback) {
  callbacks$2.onUp = callback;
}

/**
 * Check if a button is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * ```js
 * import { initPointer, pointerPressed } from 'kontra';
 *
 * initPointer();
 *
 * Sprite({
 *   update: function() {
 *     if (pointerPressed('left')){
 *       // left mouse button pressed
 *     }
 *     else if (pointerPressed('right')) {
 *       // right mouse button pressed
 *     }
 *   }
 * });
 * ```
 * @function pointerPressed
 *
 * @param {String} button - Button to check for pressed state.
 *
 * @returns {Boolean} `true` if the button is pressed, `false` otherwise.
 */
function pointerPressed(button) {
  return !!pressedButtons[button]
}

/**
 * A fast and memory efficient [object pool](https://gameprogrammingpatterns.com/object-pool.html) for sprite reuse. Perfect for particle systems or SHUMPs. The pool starts out with just one object, but will grow in size to accommodate as many objects as are needed.
 *
 * <canvas width="600" height="200" id="pool-example"></canvas>
 * <script src="assets/js/pool.js"></script>
 * @class Pool
 *
 * @param {Object} properties - Properties of the pool.
 * @param {Function} properties.create - Function that returns a new object to be added to the pool when there are no more alive objects.
 * @param {Number} [properties.maxSize=1024] - The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
 */
class Pool {
  /**
   * @docs docs/api_docs/pool.js
   */

  constructor({create, maxSize = 1024} = {}) {

    // check for the correct structure of the objects added to pools so we know that the
    // rest of the pool code will work without errors
    // @if DEBUG
    let obj;
    if (!create ||
        ( !( obj = create() ) ||
          !( obj.update && obj.init &&
             obj.isAlive )
       )) {
      throw Error('Must provide create() function which returns an object with init(), update(), and isAlive() functions');
    }
    // @endif

    // c = create
    this._c = create;

    /**
     * All objects currently in the pool, both alive and not alive.
     * @memberof Pool
     * @property {Object[]} objects
     */
    this.objects = [create()]; // start the pool with an object

    /**
     * The number of alive objects.
     * @memberof Pool
     * @property {Number} size
     */
    this.size = 0;

    /**
     * The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
     * @memberof Pool
     * @property {Number} maxSize
     */
    this.maxSize = maxSize;
  }

  /**
   * Get and return an object from the pool. The properties parameter will be passed directly to the objects `init()` function. If you're using a kontra.Sprite, you should also pass the `ttl` property to designate how many frames you want the object to be alive for.
   *
   * If you want to control when the sprite is ready for reuse, pass `Infinity` for `ttl`. You'll need to set the sprites `ttl` to `0` when you're ready for the sprite to be reused.
   *
   * ```js
   * // exclude-tablist
   * let sprite = pool.get({
   *   // the object will get these properties and values
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red',
   *
   *   // pass Infinity for ttl to prevent the object from being reused
   *   // until you set it back to 0
   *   ttl: Infinity
   * });
   * ```
   * @memberof Pool
   * @function get
   *
   * @param {Object} properties - Properties to pass to the objects `init()` function.
   *
   * @returns {Object} The newly initialized object.
   */
  get(properties = {}) {
    // the pool is out of objects if the first object is in use and it can't grow
    if (this.size === this.objects.length) {
      if (this.size === this.maxSize) {
        return;
      }
      // double the size of the array by adding twice as many new objects to the end
      else {
        for (let i = 0; i < this.size && this.objects.length < this.maxSize; i++) {
          this.objects.push(this._c());
        }
      }
    }

    // save off first object in pool to reassign to last object after unshift
    let obj = this.objects[this.size];
    this.size++;
    obj.init(properties);
    return obj;
  }

  /**
   * Returns an array of all alive objects. Useful if you need to do special processing on all alive objects outside of the pool, such as add all alive objects to a kontra.Quadtree.
   * @memberof Pool
   * @function getAliveObjects
   *
   * @returns {Object[]} An Array of all alive objects.
   */
  getAliveObjects() {
    return this.objects.slice(0, this.size);
  }

  /**
   * Clear the object pool. Removes all objects from the pool and resets its [size](api/pool#size) to 1.
   * @memberof Pool
   * @function clear
   */
  clear() {
    this.size = this.objects.length = 0;
    this.objects.push(this._c());
  }

  /**
   * Update all alive objects in the pool by calling the objects `update()` function. This function also manages when each object should be recycled, so it is recommended that you do not call the objects `update()` function outside of this function.
   * @memberof Pool
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    let obj;
    let doSort = false;
    for (let i = this.size; i--; ) {
      obj = this.objects[i];

      obj.update(dt);

      if (!obj.isAlive()) {
        doSort = true;
        this.size--;
      }
    }
    // sort all dead elements to the end of the pool
    if (doSort) {
      this.objects.sort((a, b) => b.isAlive() - a.isAlive());
    }
  }

  /**
   * Render all alive objects in the pool by calling the objects `render()` function.
   * @memberof Pool
   * @function render
   */
  render() {
    for (let i = this.size; i--; ) {
      this.objects[i].render();
    }
  }
}

function poolFactory(properties) {
  return new Pool(properties);
}
poolFactory.prototype = Pool.prototype;
poolFactory.class = Pool;

/**
 * Determine which subnodes the object intersects with
 *
 * @param {Object} object - Object to check.
 * @param {Object} bounds - Bounds of the quadtree.
 *
 * @returns {Number[]} List of all subnodes object intersects.
 */
function getIndices(object, bounds) {
  let indices = [];

  let verticalMidpoint = bounds.x + bounds.width / 2;
  let horizontalMidpoint = bounds.y + bounds.height / 2;

  // save off quadrant checks for reuse
  let intersectsTopQuadrants = object.y < horizontalMidpoint && object.y + object.height >= bounds.y;
  let intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint && object.y < bounds.y + bounds.height;

  // object intersects with the left quadrants
  if (object.x < verticalMidpoint && object.x + object.width >= bounds.x) {
    if (intersectsTopQuadrants) {  // top left
      indices.push(0);
    }

    if (intersectsBottomQuadrants) {  // bottom left
      indices.push(2);
    }
  }

  // object intersects with the right quadrants
  if (object.x + object.width >= verticalMidpoint && object.x < bounds.x + bounds.width) {  // top right
    if (intersectsTopQuadrants) {
      indices.push(1);
    }

    if (intersectsBottomQuadrants) {  // bottom right
      indices.push(3);
    }
  }

  return indices;
}

/*
The quadtree acts like an object pool in that it will create subnodes as objects are needed but it won't clean up the subnodes when it collapses to avoid garbage collection.

The quadrant indices are numbered as follows (following a z-order curve):
     |
  0  |  1
 ----+----
  2  |  3
     |
*/


/**
 * A 2D [spatial partitioning](https://gameprogrammingpatterns.com/spatial-partition.html) data structure. Use it to quickly group objects by their position for faster access and collision checking.
 *
 * <canvas width="600" height="200" id="quadtree-example"></canvas>
 * <script src="assets/js/quadtree.js"></script>
 * @class Quadtree
 *
 * @param {Object} properties - Properties of the quadtree.
 * @param {Number} [properties.maxDepth=3] - Maximum node depth of the quadtree.
 * @param {Number} [properties.maxObjects=25] - Maximum number of objects a node can have before splitting.
 * @param {Object} [properties.bounds] - The 2D space (x, y, width, height) the quadtree occupies. Defaults to the entire canvas width and height.
 */
class Quadtree {
  /**
   * @docs docs/api_docs/quadtree.js
   */

  constructor({maxDepth = 3, maxObjects = 25, bounds} = {}) {

    /**
     * Maximum node depth of the quadtree.
     * @memberof Quadtree
     * @property {Number} maxDepth
     */
    this.maxDepth = maxDepth;

    /**
     * Maximum number of objects a node can have before splitting.
     * @memberof Quadtree
     * @property {Number} maxObjects
     */
    this.maxObjects = maxObjects;

    /**
     * The 2D space (x, y, width, height) the quadtree occupies.
     * @memberof Quadtree
     * @property {Object} bounds
     */
    let canvas = getCanvas();
    this.bounds = bounds || {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };

    // since we won't clean up any subnodes, we need to keep track of which nodes are
    // currently the leaf node so we know which nodes to add objects to
    // b = branch, d = depth, o = objects, s = subnodes, p = parent
    this._b = false;
    this._d = 0;
    this._o = [];
    this._s = [];
    this._p = null;
  }

  /**
   * Removes all objects from the quadtree. You should clear the quadtree every frame before adding all objects back into it.
   * @memberof Quadtree
   * @function clear
   */
  clear() {
    this._s.map(function(subnode) {
      subnode.clear();
    });

    this._b = false;
    this._o.length = 0;
  }

  /**
   * Get an array of all objects that belong to the same node as the passed in object.
   *
   * **Note:** if the passed in object is also part of the quadtree, it will not be returned in the results.
   *
   * ```js
   * import { Sprite, Quadtree } from 'kontra';
   *
   * let quadtree = Quadtree();
   * let player = Sprite({
   *   // ...
   * });
   * let enemy1 = Sprite({
   *   // ...
   * });
   * let enemy2 = Sprite({
   *   // ...
   * });
   *
   * quadtree.add(player, enemy1, enemy2);
   * quadtree.get(player);  //=> [enemy1]
   * ```
   * @memberof Quadtree
   * @function get
   *
   * @param {Object} object - Object to use for finding other objects. The object must have the properties `x`, `y`, `width`, and `height` so that its position in the quadtree can be calculated.
   *
   * @returns {Object[]} A list of objects in the same node as the object, not including the object itself.
   */
  get(object) {
    // since an object can belong to multiple nodes we should not add it multiple times
    let objects = new Set();
    let indices, i;

    // traverse the tree until we get to a leaf node
    while (this._s.length && this._b) {
      indices = getIndices(object, this.bounds);

      for (i = 0; i < indices.length; i++) {
        this._s[ indices[i] ].get(object).forEach(obj => objects.add(obj));
      }

      return Array.from(objects);
    }

    // don't add the object to the return list
    return this._o.filter(obj => obj !== object);
  }

  /**
   * Add objects to the quadtree and group them by their position. Can take a single object, a list of objects, and an array of objects.
   *
   * ```js
   * import { Quadtree, Sprite, Pool, GameLoop } from 'kontra';
   *
   * let quadtree = Quadtree();
   * let bulletPool = Pool({
   *   create: Sprite
   * });
   *
   * let player = Sprite({
   *   // ...
   * });
   * let enemy = Sprite({
   *   // ...
   * });
   *
   * // create some bullets
   * for (let i = 0; i < 100; i++) {
   *   bulletPool.get({
   *     // ...
   *   });
   * }
   *
   * let loop = GameLoop({
   *   update: function() {
   *     quadtree.clear();
   *     quadtree.add(player, enemy, bulletPool.getAliveObjects());
   *   }
   * });
   * ```
   * @memberof Quadtree
   * @function add
   *
   * @param {Object|Object[]} objectsN - Objects to add to the quadtree.
   */
  add() {
    let i, j, object, obj;

    for (j = 0; j < arguments.length; j++) {
      object = arguments[j];

      // add a group of objects separately
      if (Array.isArray(object)) {
        this.add.apply(this, object);

        continue;
      }

      // current node has subnodes, so we need to add this object into a subnode
      if (this._b) {
        this._a(object);

        continue;
      }

      // this node is a leaf node so add the object to it
      this._o.push(object);

      // split the node if there are too many objects
      if (this._o.length > this.maxObjects && this._d < this.maxDepth) {
        this._sp();

        // move all objects to their corresponding subnodes
        for (i = 0; (obj = this._o[i]); i++) {
          this._a(obj);
        }

        this._o.length = 0;
      }
    }
  }

  /**
   * Add an object to a subnode.
   *
   * @param {Object} object - Object to add into a subnode
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  _a(object, indices, i) {
    indices = getIndices(object, this.bounds);

    // add the object to all subnodes it intersects
    for (i = 0; i < indices.length; i++) {
      this._s[ indices[i] ].add(object);
    }
  }

  /**
   * Split the node into four subnodes.
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  _sp(subWidth, subHeight, i) {
    this._b = true;

    // only split if we haven't split before
    if (this._s.length) {
      return;
    }

    subWidth = this.bounds.width / 2 | 0;
    subHeight = this.bounds.height / 2 | 0;

    for (i = 0; i < 4; i++) {
      this._s[i] = quadtreeFactory({
        bounds: {
          x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
          y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
          width: subWidth,
          height: subHeight
        },
        maxDepth: this.maxDepth,
        maxObjects: this.maxObjects,
      });

      // d = depth, p = parent
      this._s[i]._d = this._d+1;
      /* @if VISUAL_DEBUG */
      this._s[i]._p = this;
      /* @endif */
    }
  }

  /**
   * Draw the quadtree. Useful for visual debugging.
   */
   /* @if VISUAL_DEBUG **
   render() {
     // don't draw empty leaf nodes, always draw branch nodes and the first node
     if (this._o.length || this._d === 0 ||
         (this._p && this._p._b)) {

       context.strokeStyle = 'red';
       context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

       if (this._s.length) {
         for (let i = 0; i < 4; i++) {
           this._s[i].render();
         }
       }
     }
   }
   /* @endif */
}

function quadtreeFactory(properties) {
  return new Quadtree(properties);
}
quadtreeFactory.prototype = Quadtree.prototype;
quadtreeFactory.class = Quadtree;

/**
 * A simple 2d vector object.
 *
 * ```js
 * import { Vector } from 'kontra';
 *
 * let vector = Vector(100, 200);
 * ```
 * @class Vector
 *
 * @param {Number} [x=0] - X coordinate of the vector.
 * @param {Number} [y=0] - Y coordinate of the vector.
 */
class Vector {
  constructor(x = 0, y = 0) {
    this._x = x;
    this._y = y;
  }

  /**
   * Return a new Vector whose value is the addition of the current Vector and the passed in Vector. If `dt` is provided, the result is multiplied by the value.
   * @memberof Vector
   * @function add
   *
   * @param {kontra.Vector} vector - Vector to add to the current Vector.
   * @param {Number} [dt=1] - Time since last update.
   *
   * @returns {kontra.Vector} A new kontra.Vector instance.
   */
  add(vec, dt = 1) {
    return vectorFactory(
      this.x + (vec.x || 0) * dt,
      this.y + (vec.y || 0) * dt,
      this
    );
  }

  /**
   * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * vector.clamp(0, 0, 200, 300);
   *
   * vector.x += 200;
   * console.log(vector.x);  //=> 200
   *
   * vector.y -= 300;
   * console.log(vector.y);  //=> 0
   *
   * vector.add({x: -500, y: 500});
   * console.log(vector);    //=> {x: 0, y: 300}
   * ```
   * @memberof Vector
   * @function clamp
   *
   * @param {Number} xMin - Minimum x value.
   * @param {Number} yMin - Minimum y value.
   * @param {Number} xMax - Maximum x value.
   * @param {Number} yMax - Maximum y value.
   */
  clamp(xMin, yMin, xMax, yMax) {
    this._c = true;
    this._a = xMin;
    this._b = yMin;
    this._d = xMax;
    this._e = yMax;
  }

  /**
   * X coordinate of the vector.
   * @memberof Vector
   * @property {Number} x
   */
  get x() {
    return this._x;
  }

  /**
   * Y coordinate of the vector.
   * @memberof Vector
   * @property {Number} y
   */
  get y() {
    return this._y;
  }

  set x(value) {
    this._x = (this._c ? Math.min( Math.max(this._a, value), this._d ) : value);
  }

  set y(value) {
    this._y = (this._c ? Math.min( Math.max(this._b, value), this._e ) : value);
  }
}

function vectorFactory(x, y, vec = {}) {
  let vector = new Vector(x, y);

  // preserve vector clamping when creating new vectors
  if (vec._c) {
    vector.clamp(vec._a, vec._b, vec._d, vec._e);

    // reset x and y so clamping takes effect
    vector.x = x;
    vector.y = y;
  }

  return vector;
}
vectorFactory.prototype = Vector.prototype;
vectorFactory.class = Vector;

/**
 * A versatile way to update and draw your game objects. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class Sprite
 *
 * @param {Object} properties - Properties of the sprite.
 * @param {Number} properties.x - X coordinate of the position vector.
 * @param {Number} properties.y - Y coordinate of the position vector.
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 *
 * @param {String} [properties.color] - Fill color for the sprite if no image or animation is provided.
 * @param {Number} [properties.width] - Width of the sprite.
 * @param {Number} [properties.height] - Height of the sprite.
 *
 * @param {Number} [properties.ttl=Infinity] - How many frames the sprite should be alive. Used by kontra.Pool.
 * @param {Number} [properties.rotation=0] - Sprites rotation around the origin in radians.
 * @param {Number} [properties.anchor={x:0,y:0}] - The x and y origin of the sprite. {x:0, y:0} is the top left corner of the sprite, {x:1, y:1} is the bottom right corner.
 *
 * @param {Canvas​Rendering​Context2D} [properties.context] - The context the sprite should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Image|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
 * @param {Object} [properties.animations] - An object of [Animations](api/animation) from a kontra.Spritesheet to animate the sprite.
 *
 * @param {Function} [properties.update] - Function called every frame to update the sprite.
 * @param {Function} [properties.render] - Function called every frame to render the sprite.
 * @param {*} [properties.*] - Any additional properties you need added to the sprite. For example, if you pass `Sprite({type: 'player'})` then the sprite will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class Sprite {
  /**
   * @docs docs/api_docs/sprite.js
   */

  constructor(properties) {
    this.init(properties);
  }

  /**
   * Use this function to reinitialize a sprite. It takes the same properties object as the constructor. Useful it you want to repurpose a sprite.
   * @memberof Sprite
   * @function init
   *
   * @param {Object} properties - Properties of the sprite.
   */
  init(properties = {}) {
    let { x, y, dx, dy, ddx, ddy, width, height, image } = properties;

    /**
     * The sprites position vector. The sprites position is its position in the world, as opposed to the position in the [viewport](api/sprite#viewX). Typically the position in the world and the viewport are the same value. If the sprite has been [added to a tileEngine](/api/tileEngine#addObject), the position vector represents where in the tile world the sprite is while the viewport represents where to draw the sprite in relation to the top-left corner of the canvas.
     * @memberof Sprite
     * @property {kontra.Vector} position
     */
    this.position = vectorFactory(x, y);

    /**
     * The sprites velocity vector.
     * @memberof Sprite
     * @property {kontra.Vector} velocity
     */
    this.velocity = vectorFactory(dx, dy);

    /**
     * The sprites acceleration vector.
     * @memberof Sprite
     * @property {kontra.Vector} acceleration
     */
    this.acceleration = vectorFactory(ddx, ddy);

    // defaults

    // sx = flipX, sy = flipY
    this._fx = this._fy = 1;

    /**
     * The rotation of the sprite around the origin in radians.
     * @memberof Sprite
     * @property {Number} rotation
     */
    this.width = this.height = this.rotation = 0;

    /**
     * How may frames the sprite should be alive. Primarily used by kontra.Pool to know when to recycle an object.
     * @memberof Sprite
     * @property {Number} ttl
     */
    this.ttl = Infinity;

    /**
     * The x and y origin of the sprite. {x:0, y:0} is the top left corner of the sprite, {x:1, y:1} is the bottom right corner.
     * @memberof Sprite
     * @property {Object} anchor
     *
     * @example
     * // exclude-code:start
     * let { Sprite } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { Sprite } from 'kontra';
     * // exclude-script:end
     *
     * let sprite = Sprite({
     *   x: 150,
     *   y: 100,
     *   color: 'red',
     *   width: 50,
     *   height: 50,
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.draw();
     *
     *     // draw origin
     *     this.context.fillStyle = 'yellow';
     *     this.context.beginPath();
     *     this.context.arc(this.x, this.y, 3, 0, 2*Math.PI);
     *     this.context.fill();
     *   }
     * });
     * sprite.render();
     *
     * sprite.anchor = {x: 0.5, y: 0.5};
     * sprite.x = 300;
     * sprite.render();
     *
     * sprite.anchor = {x: 1, y: 1};
     * sprite.x = 450;
     * sprite.render();
     */
    this.anchor = {x: 0, y: 0};

    /**
     * The context the sprite will draw to.
     * @memberof Sprite
     * @property {Canvas​Rendering​Context2D} context
     */
    this.context = getContext();

    /**
     * The color of the sprite if it was passed as an argument.
     * @memberof Sprite
     * @property {String} color
     */

     /**
     * The image the sprite will use when drawn if passed as an argument.
     * @memberof Sprite
     * @property {Image|HTMLCanvasElement} image
     */

    // add all properties to the sprite, overriding any defaults
    for (let prop in properties) {
      this[prop] = properties[prop];
    }

    // image sprite
    if (image) {
      this.width = (width !== undefined) ? width : image.width;
      this.height = (height !== undefined) ? height : image.height;
    }

    /**
     * The X coordinate of the camera. Used to determine [viewX](api/sprite#viewX).
     * @memberof Sprite
     * @property {Number} sx
     */
    this.sx = 0;

    /**
     * The Y coordinate of the camera. Used to determine [viewY](api/sprite#viewY).
     * @memberof Sprite
     * @property {Number} sy
     */
    this.sy = 0;
  }

  // define getter and setter shortcut functions to make it easier to work with the
  // position, velocity, and acceleration vectors.

  /**
   * X coordinate of the position vector.
   * @memberof Sprite
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Y coordinate of the position vector.
   * @memberof Sprite
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }

  /**
   * X coordinate of the velocity vector.
   * @memberof Sprite
   * @property {Number} dx
   */
  get dx() {
    return this.velocity.x;
  }

  /**
   * Y coordinate of the velocity vector.
   * @memberof Sprite
   * @property {Number} dy
   */
  get dy() {
    return this.velocity.y;
  }

  /**
   * X coordinate of the acceleration vector.
   * @memberof Sprite
   * @property {Number} ddx
   */
  get ddx() {
    return this.acceleration.x;
  }

  /**
   * Y coordinate of the acceleration vector.
   * @memberof Sprite
   * @property {Number} ddy
   */
  get ddy() {
    return this.acceleration.y;
  }

  /**
   * An object of [Animations](api/animation) from a kontra.SpriteSheet to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1,
   *       loop: false,
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @property {Object} animations
   */
  get animations() {
    return this._a;
  }

  /**
   * Readonly. X coordinate of where to draw the sprite. Typically the same value as the [position vector](api/sprite#position) unless the sprite has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof Sprite
   * @property {Number} viewX
   */
  get viewX() {
    return this.x - this.sx;
  }

  /**
   * Readonly. Y coordinate of where to draw the sprite. Typically the same value as the [position vector](api/sprite#position) unless the sprite has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof Sprite
   * @property {Number} viewY
   */
  get viewY() {
    return this.y - this.sy;
  }

  /**
   * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
   *
   * Setting the value to a negative number will result in the sprite being flipped across the vertical axis while the width will remain a positive value.
   * @memberof Sprite
   * @property {Number} width
   */
  get width() {
    return this._w;
  }

  /**
   * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
   *
   * Setting the value to a negative number will result in the sprite being flipped across the horizontal axis while the height will remain a positive value.
   * @memberof Sprite
   * @property {Number} height
   */
  get height() {
    return this._h;
  }

  set x(value) {
    this.position.x = value;
  }
  set y(value) {
    this.position.y = value;
  }
  set dx(value) {
    this.velocity.x = value;
  }
  set dy(value) {
    this.velocity.y = value;
  }
  set ddx(value) {
    this.acceleration.x = value;
  }
  set ddy(value) {
    this.acceleration.y = value;
  }

  set animations(value) {
    let prop, firstAnimation;
    // a = animations
    this._a = {};

    // clone each animation so no sprite shares an animation
    for (prop in value) {
      this._a[prop] = value[prop].clone();

      // default the current animation to the first one in the list
      firstAnimation = firstAnimation || this._a[prop];
    }

    /**
     * The currently playing Animation object if `animations` was passed as an argument.
     * @memberof Sprite
     * @property {kontra.Animation} currentAnimation
     */
    this.currentAnimation = firstAnimation;
    this.width = this.width || firstAnimation.width;
    this.height = this.height || firstAnimation.height;
  }

  // readonly
  set viewX(value) {
    return;
  }
  set viewY(value) {
    return;
  }

  set width(value) {
    let sign = value < 0 ? -1 : 1;

    this._fx = sign;
    this._w = value * sign;
  }
  set height(value) {
    let sign = value < 0 ? -1 : 1;

    this._fy = sign;
    this._h = value * sign;
  }

  /**
   * Check if the sprite is alive. Primarily used by kontra.Pool to know when to recycle an object.
   * @memberof Sprite
   * @function isAlive
   *
   * @returns {Boolean} `true` if the sprites [ttl](api/sprite#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }

  /**
   * Check if the sprite collide with the object. Uses a simple [Axis-Aligned Bounding Box (AABB) collision check](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#Axis-Aligned_Bounding_Box). Takes into account the sprites [anchor](api/sprite#anchor).
   *
   * **NOTE:** Does not take into account sprite rotation. If you need collision detection between rotated sprites you will need to implement your own `collidesWith()` function. I suggest looking at the Separate Axis Theorem.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40
   * });
   *
   * let sprite2 = Sprite({
   *   x: 150,
   *   y: 200,
   *   width: 20,
   *   height: 20
   * });
   *
   * sprite.collidesWith(sprite2);  //=> false
   *
   * sprite2.x = 115;
   *
   * sprite.collidesWith(sprite2);  //=> true
   * ```
   *
   * If you need a different type of collision check, you can override this function by passing an argument by the same name.
   *
   * ```js
   * // circle collision
   * function collidesWith(object) {
   *   let dx = this.x - object.x;
   *   let dy = this.y - object.y;
   *   let distance = Math.sqrt(dx * dx + dy * dy);
   *
   *   return distance < this.radius + object.radius;
   * }
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   radius: 25,
   *   collidesWith: collidesWith
   * });
   *
   * let sprite2 = Sprite({
   *   x: 150,
   *   y: 200,
   *   radius: 30,
   *   collidesWith: collidesWith
   * });
   *
   * sprite.collidesWith(sprite2);  //=> true
   * ```
   * @memberof Sprite
   * @function collidesWith
   *
   * @param {Object} object - Object to check collision against.
   *
   * @returns {Boolean|null} `true` if the objects collide, `false` otherwise. Will return `null` if the either of the two objects are rotated.
   */
  collidesWith(object) {
    if (this.rotation || object.rotation) return null;

    // take into account sprite anchors
    let x = this.x - this.width * this.anchor.x;
    let y = this.y - this.height * this.anchor.y;

    let objX = object.x;
    let objY = object.y;
    if (object.anchor) {
      objX -= object.width * object.anchor.x;
      objY -= object.height * object.anchor.y;
    }

    return x < objX + object.width &&
           x + this.width > objX &&
           y < objY + object.height &&
           y + this.height > objY;
  }

  /**
   * Update the sprites position based on its velocity and acceleration. Calls the sprites [advance()](api/sprite#advance) function.
   * @memberof Sprite
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    this.advance(dt);
  }

  /**
   * Render the sprite. Calls the sprites [draw()](api/sprite#draw) function.
   * @memberof Sprite
   * @function render
   */
  render() {
    this.draw();
  }

  /**
   * Set the currently playing animation of an animation sprite.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @function playAnimation
   *
   * @param {String} name - Name of the animation to play.
   */
  playAnimation(name) {
    this.currentAnimation = this.animations[name];

    if (!this.currentAnimation.loop) {
      this.currentAnimation.reset();
    }
  }

  /**
   * Move the sprite by its acceleration and velocity. If the sprite is an [animation sprite](api/sprite#animation-sprite), it also advances the animation every frame.
   *
   * If you override the sprites [update()](api/sprite#update) function with your own update function, you can call this function to move the sprite normally.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the sprite normally
   *     sprite.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof Sprite
   * @function advance
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {
    this.velocity = this.velocity.add(this.acceleration, dt);
    this.position = this.position.add(this.velocity, dt);

    this.ttl--;

    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
  }

  /**
   * Draw the sprite at its X and Y position. This function changes based on the type of the sprite. For a [rectangle sprite](api/sprite#rectangle-sprite), it uses `context.fillRect()`, for an [image sprite](api/sprite#image-sprite) it uses `context.drawImage()`, and for an [animation sprite](api/sprite#animation-sprite) it uses the [currentAnimation](api/sprite#currentAnimation) `render()` function.
   *
   * If you override the sprites `render()` function with your own render function, you can call this function to draw the sprite normally.
   *
   * ```js
   * import { Sprite } from 'kontra';
   *
   * let sprite = Sprite({
   *  x: 290,
   *  y: 80,
   *  color: 'red',
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the rectangle sprite normally
   *    this.draw();
   *
   *    // outline the sprite
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(this.x, this.y, this.width, this.height);
   *  }
   * });
   *
   * sprite.render();
   * ```
   * @memberof Sprite
   * @function draw
   */
  draw() {
    let anchorWidth = -this.width * this.anchor.x;
    let anchorHeight = -this.height * this.anchor.y;

    this.context.save();
    this.context.translate(this.viewX, this.viewY);

    // rotate around the anchor
    if (this.rotation) {
      this.context.rotate(this.rotation);
    }

    // flip sprite around the center so the x/y position does not change
    if (this._fx == -1 || this._fy == -1) {
      let x = this.width / 2 + anchorWidth;
      let y = this.height / 2 + anchorHeight;

      this.context.translate(x, y);
      this.context.scale(this._fx, this._fy);
      this.context.translate(-x, -y);
    }

    if (this.image) {
      this.context.drawImage(
        this.image,
        0, 0, this.image.width, this.image.height,
        anchorWidth, anchorHeight, this.width, this.height
      );
    }
    else if (this.currentAnimation) {
      this.currentAnimation.render({
        x: anchorWidth,
        y: anchorHeight,
        width: this.width,
        height: this.height,
        context: this.context
      });
    }
    else {
      this.context.fillStyle = this.color;
      this.context.fillRect(anchorWidth, anchorHeight, this.width, this.height);
    }

    this.context.restore();
  }
}

function spriteFactory(properties) {
  return new Sprite(properties);
}
spriteFactory.prototype = Sprite.prototype;
spriteFactory.class = Sprite;

/**
 * Parse a string of consecutive frames.
 *
 * @param {Number|String} frames - Start and end frame.
 *
 * @returns {Number|Number[]} List of frames.
 */
function parseFrames(consecutiveFrames) {
  // return a single number frame
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  if (+consecutiveFrames === consecutiveFrames) {
    return consecutiveFrames;
  }

  let sequence = [];
  let frames = consecutiveFrames.split('..');

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let start = +frames[0];
  let end = +frames[1];
  let i = start;

  // ascending frame order
  if (start < end) {
    for (; i <= end; i++) {
      sequence.push(i);
    }
  }
  // descending order
  else {
    for (; i >= end; i--) {
      sequence.push(i);
    }
  }

  return sequence;
}

/**
 * A sprite sheet to animate a sequence of images. Used to create [animation sprites](api/sprite#animation-sprite).
 *
 * <figure>
 *   <a href="assets/imgs/character_walk_sheet.png">
 *     <img src="assets/imgs/character_walk_sheet.png" alt="11 frames of a walking pill-like alien wearing a space helmet.">
 *   </a>
 *   <figcaption>Sprite sheet image courtesy of <a href="https://kenney.nl/assets">Kenney</a>.</figcaption>
 * </figure>
 *
 * Typically you create a sprite sheet just to create animations and then use the animations for your sprite.
 *
 * ```js
 * import { Sprite, SpriteSheet } from 'kontra';
 *
 * let image = new Image();
 * image.src = 'assets/imgs/character_walk_sheet.png';
 * image.onload = function() {
 *   let spriteSheet = SpriteSheet({
 *     image: image,
 *     frameWidth: 72,
 *     frameHeight: 97,
 *     animations: {
 *       // create a named animation: walk
 *       walk: {
 *         frames: '0..9',  // frames 0 through 9
 *         frameRate: 30
 *       }
 *     }
 *   });
 *
 *   let sprite = Sprite({
 *     x: 200,
 *     y: 100,
 *
 *     // use the sprite sheet animations for the sprite
 *     animations: spriteSheet.animations
 *   });
 * };
 * ```
 * @class SpriteSheet
 *
 * @param {Object} properties - Properties of the sprite sheet.
 * @param {Image|HTMLCanvasElement} properties.image - The sprite sheet image.
 * @param {Number} properties.frameWidth - The width of a single frame.
 * @param {Number} properties.frameHeight - The height of a single frame.
 * @param {Number} [properties.frameMargin=0] - The amount of whitespace between each frame.
 * @param {Object} [properties.animations] - Animations to create from the sprite sheet using kontra.Animation. Passed directly into the sprite sheets [createAnimations()](api/spriteSheet#createAnimations) function.
 */
class SpriteSheet {
  constructor({image, frameWidth, frameHeight, frameMargin, animations} = {}) {
    // @if DEBUG
    if (!image) {
      throw Error('You must provide an Image for the SpriteSheet');
    }
    // @endif

    /**
     * An object of named kontra.Animation objects. Typically you pass this object into kontra.Sprite to create an [animation sprites](api/spriteSheet#animation-sprite).
     * @memberof SpriteSheet
     * @property {Object} animations
     */
    this.animations = {};

    /**
     * The sprite sheet image.
     * @memberof SpriteSheet
     * @property {Image|HTMLCanvasElement} image
     */
    this.image = image;

    /**
     * An object that defines properties of a single frame in the sprite sheet. It has properties of `width`, `height`, and `margin`.
     *
     * `width` and `height` are the width of a single frame, while `margin` defines the amount of whitespace between each frame.
     * @memberof SpriteSheet
     * @property {Object} frame
     */
    this.frame = {
      width: frameWidth,
      height: frameHeight,
      margin: frameMargin
    };

    // f = framesPerRow
    this._f = image.width / frameWidth | 0;

    this.createAnimations(animations);
  }

  /**
   * Create named animations from the sprite sheet. Called from the constructor if the `animations` argument is passed.
   *
   * This function populates the sprite sheets `animations` property with kontra.Animation objects. Each animation is accessible by its name.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let image = new Image();
   * image.src = 'assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97,
   *
   *     // this will also call createAnimations()
   *     animations: {
   *       // create 1 animation: idle
   *       idle: {
   *         // a single frame
   *         frames: 1
   *       }
   *     }
   *   });
   *
   *   spriteSheet.createAnimations({
   *     // create 4 animations: jump, walk, moonWalk, attack
   *     jump: {
   *       // sequence of frames (can be non-consecutive)
   *       frames: [1, 10, 1],
   *       frameRate: 10,
   *       loop: false,
   *     },
   *     walk: {
   *       // ascending consecutive frame animation (frames 2-6, inclusive)
   *       frames: '2..6',
   *       frameRate: 20
   *     },
   *     moonWalk: {
   *       // descending consecutive frame animation (frames 6-2, inclusive)
   *       frames: '6..2',
   *       frameRate: 20
   *     },
   *     attack: {
   *       // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *       frames: ['8..10', 13, '10..8'],
   *       frameRate: 10,
   *       loop: false,
   *     }
   *   });
   * };
   * ```
   * @memberof SpriteSheet
   * @function createAnimations
   *
   * @param {Object} animations - Object of named animations to create from the sprite sheet.
   * @param {Number|String|Number[]|String[]} animations.<name>.frames - The sequence of frames to use from the sprite sheet. It can either be a single frame (`1`), a sequence of frames (`[1,2,3,4]`), or a consecutive frame notation (`'1..4'`). Sprite sheet frames are `0` indexed.
   * @param {Number} animations.<name>.frameRate - The number frames to display per second.
   * @param {Boolean} [animations.<name>.loop=true] - If the animation should loop back to the beginning once completed.
   */
  createAnimations(animations) {
    let sequence, name;

    for (name in animations) {
      let { frames, frameRate, loop } = animations[name];

      // array that holds the order of the animation
      sequence = [];

      // @if DEBUG
      if (frames === undefined) {
        throw Error('Animation ' + name + ' must provide a frames property');
      }
      // @endif

      // add new frames to the end of the array
      [].concat(frames).map(frame => {
        sequence = sequence.concat(parseFrames(frame));
      });

      this.animations[name] = animationFactory({
        spriteSheet: this,
        frames: sequence,
        frameRate,
        loop
      });
    }
  }
}

function spriteSheetFactory(properties) {
  return new SpriteSheet(properties);
}
spriteSheetFactory.prototype = SpriteSheet.prototype;
spriteSheetFactory.class = SpriteSheet;

/**
 * A simple interface to LocalStorage based on [store.js](https://github.com/marcuswestin/store.js), whose sole purpose is to ensure that any keys you save to LocalStorage come out the same type as when they went in.
 *
 * Normally when you save something to LocalStorage, it converts it into a string. So if you were to save a number, it would be saved as `"12"` instead of `12`. This means when you retrieved the number, it would now be a string.
 *
 * ```js
 * import { setStoreItem, getStoreItem } from 'kontra';
 *
 * setStoreItem('highScore', 100);
 * getStoreItem('highScore');  //=> 100
 * ```
 * @sectionName Store
 */

/**
 * Save an item to localStorage.
 * @function setStoreItem
 *
 * @param {String} key - The name of the key.
 * @param {*} value - The value to store.
 */
function setStoreItem(key, value) {
  if (value === undefined) {
    localStorage.removeItem(key);
  }
  else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Retrieve an item from localStorage and convert it back to its original type.
 * @function getStoreItem
 *
 * @param {String} key - Name of the key of the item to retrieve.
 *
 * @returns {*} The retrieved item.
 */
function getStoreItem(key) {
  let value = localStorage.getItem(key);

  try {
    value = JSON.parse(value);
  }
  catch(e) {}

  return value;
}

/**
 * A tile engine for managing and drawing tilesets.
 *
 * <figure>
 *   <a href="assets/imgs/mapPack_tilesheet.png">
 *     <img src="assets/imgs/mapPack_tilesheet.png" alt="Tileset to create an overworld map in various seasons.">
 *   </a>
 *   <figcaption>Tileset image courtesy of <a href="https://kenney.nl/assets">Kenney</a>.</figcaption>
 * </figure>
 * @sectionName TileEngine
 *
 * @param {Object} properties - Properties of the tile engine.
 * @param {Number} properties.width - Width of the tile map (in number of tiles).
 * @param {Number} properties.height - Height of the tile map (in number of tiles).
 * @param {Number} properties.tilewidth - Width of a single tile (in pixels).
 * @param {Number} properties.tileheight - Height of a single tile (in pixels).
 * @param {Canvas​Rendering​Context2D} [properties.context] - The context the tile engine should draw to. Defaults to [core.getContext()](api/core#getContext)
 *
 * @param {Object[]} properties.tilesets - Array of tileset objects.
 * @param {Number} properties.tilesetN.firstgid - First tile index of the tileset. The first tileset will have a firstgid of 1 as 0 represents an empty tile.
 * @param {String|HTMLImageElement} properties.tilesetN.image - Relative path to the HTMLImageElement or an HTMLImageElement. If passing a relative path, the image file must have been [loaded](api/assets#load) first.
 * @param {Number} [properties.tilesetN.margin=0] - The amount of whitespace between each tile (in pixels).
 * @param {Number} [properties.tilesetN.tilewidth] - Width of the tileset (in pixels). Defaults to properties.tilewidth.
 * @param {Number} [properties.tilesetN.tileheight] - Height of the tileset (in pixels). Defaults to properties.tileheight.
 * @param {String} [properties.tilesetN.source] - Relative path to the source JSON file. The source JSON file must have been [loaded](api/assets#load) first.
 * @param {Number} [properties.tilesetN.columns] - Number of columns in the tileset image.
 *
 * @param {Object[]} properties.layers - Array of layer objects.
 * @param {String} properties.layerN.name - Unique name of the layer.
 * @param {Number[]} properties.layerN.data - 1D array of tile indices.
 * @param {Boolean} [properties.layerN.visible=true] - If the layer should be drawn or not.
 * @param {Number} [properties.layerN.opacity=1] - Percent opacity of the layer.
 */

/**
 * @docs docs/api_docs/tileEngine.js
 */

function TileEngine(properties = {}) {
  let {
    width,
    height,
    tilewidth,
    tileheight,
    context = getContext(),
    tilesets,
    layers
  } = properties;

  let mapwidth = width * tilewidth;
  let mapheight = height * tileheight;

  // create an off-screen canvas for pre-rendering the map
  // @see http://jsperf.com/render-vs-prerender
  let offscreenCanvas = document.createElement('canvas');
  let offscreenContext = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = mapwidth;
  offscreenCanvas.height = mapheight;

  // map layer names to data
  let layerMap = {};
  let layerCanvases = {};

  // objects added to tile engine to sync with the camera
  let objects = [];

  /**
   * The width of tile map (in tiles).
   * @memberof TileEngine
   * @property {Number} width
   */

  /**
   * The height of tile map (in tiles).
   * @memberof TileEngine
   * @property {Number} height
   */

  /**
   * The width a tile (in pixels).
   * @memberof TileEngine
   * @property {Number} tilewidth
   */

  /**
   * The height of a tile (in pixels).
   * @memberof TileEngine
   * @property {Number} tileheight
   */

  /**
   * Array of all layers of the tile engine.
   * @memberof TileEngine
   * @property {Object[]} layers
   */

  /**
   * Array of all tilesets of the tile engine.
   * @memberof TileEngine
   * @property {Object[]} tilesets
   */

  let tileEngine = Object.assign({

    /**
     * The context the tile engine will draw to.
     * @memberof TileEngine
     * @property {CanvasRenderingContext2D} context
     */
    context: context,

    /**
     * The width of the tile map (in pixels).
     * @memberof TileEngine
     * @property {Number} mapwidth
     */
    mapwidth: mapwidth,

    /**
     * The height of the tile map (in pixels).
     * @memberof TileEngine
     * @property {Number} mapheight
     */
    mapheight: mapheight,
    _sx: 0,
    _sy: 0,


    // d = dirty
    _d: false,

    /**
     * X coordinate of the tile map camera.
     * @memberof TileEngine
     * @property {Number} sx
     */
    get sx() {
      return this._sx;
    },

    /**
     * Y coordinate of the tile map camera.
     * @memberof TileEngine
     * @property {Number} sy
     */
    get sy() {
      return this._sy;
    },

    // when clipping an image, sx and sy must within the image region, otherwise
    // Firefox and Safari won't draw it.
    // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
    set sx(value) {
      this._sx = Math.min( Math.max(0, value), mapwidth - getCanvas().width );
      objects.forEach(obj => obj.sx = this._sx);
    },

    set sy(value) {
      this._sy = Math.min( Math.max(0, value), mapheight - getCanvas().height );
      objects.forEach(obj => obj.sy = this._sy);
    },

    /**
     * Render all visible layers.
     * @memberof TileEngine
     * @function render
     */
    render() {
      if (this._d) {
        this._d = false;
        this._p();
      }

      render(offscreenCanvas);
    },

    /**
     * Render a specific layer by name.
     * @memberof TileEngine
     * @function renderLayer
     *
     * @param {String} name - Name of the layer to render.
     */
    renderLayer(name) {
      let canvas = layerCanvases[name];
      let layer = layerMap[name];

      if (!canvas) {
        // cache the rendered layer so we can render it again without redrawing
        // all tiles
        canvas = document.createElement('canvas');
        canvas.width = mapwidth;
        canvas.height = mapheight;

        layerCanvases[name] = canvas;
        tileEngine._r(layer, canvas.getContext('2d'));
      }

      if (layer._d) {
        layer._d = false;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        tileEngine._r(layer, canvas.getContext('2d'));
      }

      render(canvas);
    },

    /**
     * Check if the object collides with the layer (shares a gird coordinate with any positive tile index in layers data). The object being checked must have the properties `x`, `y`, `width`, and `height` so that its position in the grid can be calculated. kontra.Sprite defines these properties for you.
     *
     * ```js
     * import { TileEngine, Sprite } from 'kontra';
     *
     * let tileEngine = TileEngine({
     *   tilewidth: 32,
     *   tileheight: 32,
     *   width: 4,
     *   height: 4,
     *   tilesets: [{
     *     // ...
     *   }],
     *   layers: [{
     *     name: 'collision',
     *     data: [ 0,0,0,0,
     *             0,1,4,0,
     *             0,2,5,0,
     *             0,0,0,0 ]
     *   }]
     * });
     *
     * let sprite = Sprite({
     *   x: 50,
     *   y: 20,
     *   width: 5,
     *   height: 5
     * });
     *
     * tileEngine.layerCollidesWith('collision', sprite);  //=> false
     *
     * sprite.y = 28;
     *
     * tileEngine.layerCollidesWith('collision', sprite);  //=> true
     * ```
     * @memberof TileEngine
     * @function layerCollidesWith
     *
     * @param {String} name - The name of the layer to check for collision.
     * @param {Object} object - Object to check collision against.
     *
     * @returns {boolean} `true` if the object collides with a tile, `false` otherwise.
     */
    layerCollidesWith(name, object) {
      let x = object.x;
      let y = object.y;
      if (object.anchor) {
        x -= object.width * object.anchor.x;
        y -= object.height * object.anchor.y;
      }

      let row = getRow(y);
      let col = getCol(x);
      let endRow = getRow(y + object.height);
      let endCol = getCol(x + object.width);

      let layer = layerMap[name];

      // check all tiles
      for (let r = row; r <= endRow; r++) {
        for (let c = col; c <= endCol; c++) {
          if (layer.data[c + r * this.width]) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Get the tile at the specified layer using either x and y coordinates or row and column coordinates.
     *
     * ```js
     * import { TileEngine } from 'kontra';
     *
     * let tileEngine = TileEngine({
     *   tilewidth: 32,
     *   tileheight: 32,
     *   width: 4,
     *   height: 4,
     *   tilesets: [{
     *     // ...
     *   }],
     *   layers: [{
     *     name: 'collision',
     *     data: [ 0,0,0,0,
     *             0,1,4,0,
     *             0,2,5,0,
     *             0,0,0,0 ]
     *   }]
     * });
     *
     * tileEngine.tileAtLayer('collision', {x: 50, y: 50});  //=> 1
     * tileEngine.tileAtLayer('collision', {row: 2, col: 1});  //=> 2
     * ```
     * @memberof TileEngine
     * @function tileAtLayer
     *
     * @param {String} name - Name of the layer.
     * @param {Object} position - Position of the tile in either {x, y} or {row, col} coordinates.
     *
     * @returns {Number} The tile index. Will return `-1` if no layer exists by the provided name.
     */
    tileAtLayer(name, position) {
      let row = position.row || getRow(position.y);
      let col = position.col || getCol(position.x);

      if (layerMap[name]) {
        return layerMap[name].data[col + row * tileEngine.width];
      }

      return -1;
    },

    /**
     * Set the tile at the specified layer using either x and y coordinates or row and column coordinates.
     *
     * ```js
     * import { TileEngine } from 'kontra';
     *
     * let tileEngine = TileEngine({
     *   tilewidth: 32,
     *   tileheight: 32,
     *   width: 4,
     *   height: 4,
     *   tilesets: [{
     *     // ...
     *   }],
     *   layers: [{
     *     name: 'collision',
     *     data: [ 0,0,0,0,
     *             0,1,4,0,
     *             0,2,5,0,
     *             0,0,0,0 ]
     *   }]
     * });
     *
     * tileEngine.setTileAtLayer('collision', {row: 2, col: 1}, 10);
     * tileEngine.tileAtLayer('collision', {row: 2, col: 1});  //=> 10
     * ```
     * @memberof TileEngine
     * @function setTileAtLayer
     *
     * @param {String} name - Name of the layer.
     * @param {Object} position - Position of the tile in either {x, y} or {row, col} coordinates.
     * @param {Number} tile - Tile index to set.
     */
    setTileAtLayer(name, position, tile) {
      let row = position.row || getRow(position.y);
      let col = position.col || getCol(position.x);

      if (layerMap[name]) {
        layerMap[name]._d = true;
        layerMap[name].data[col + row * tileEngine.width] = tile;
      }
    },

    /**
    * Set the data at the specified layer.
    * 
    * ```js
    * import { TileEngine } from 'kontra';
    *
    * let tileEngine = TileEngine({
    *   tilewidth: 32,
    *   tileheight: 32,
    *   width: 2,
    *   height: 2,
    *   tilesets: [{
    *     // ...
    *   }],
    *   layers: [{
    *     name: 'collision',
    *     data: [ 0,1,
    *             2,3 ]
    *   }]
    * });
    *
    * tileEngine.setLayer('collision', [ 4,5,6,7]);
    * tileEngine.tileAtLayer('collision', {row: 0, col: 0});  //=> 4
    * tileEngine.tileAtLayer('collision', {row: 0, col: 1});  //=> 5
    * tileEngine.tileAtLayer('collision', {row: 1, col: 0});  //=> 6
    * tileEngine.tileAtLayer('collision', {row: 1, col: 1});  //=> 7
    * ```
    * 
    * @memberof TileEngine
    * @function setLayer
    * 
    * @param {String} name - Name of the layer.
    * @param {Number[]} data - 1D array of tile indices.
    */
    setLayer(name, data) {
      if (layerMap[name]) {
        layerMap[name]._d = true;
        layerMap[name].data = data;
      }
    },



    /**
     * Add an object to the tile engine. The tile engine will set the objects camera position (`sx`, `sy`) to be in sync with the tile engine camera. kontra.Sprite uses this information to draw the sprite to the correct position on the canvas.
     * @memberof TileEngine
     * @function addObject
     *
     * @param {Object} object - Object to add to the tile engine.
     */
    addObject(object) {
      objects.push(object);
      object.sx = this._sx;
      object.sy = this._sy;
    },

    /**
     * Remove an object from the tile engine.
     * @memberof TileEngine
     * @function removeObject
     *
     * @param {Object} object - Object to remove from the tile engine.
     */
    removeObject(object) {
      let index = objects.indexOf(object);
      if (index !== -1) {
        objects.splice(index, 1);
        object.sx = object.sy = 0;
      }
    },

    // expose for testing
    _r: renderLayer,
    _p: prerender,

    // @if DEBUG
    layerCanvases: layerCanvases,
    layerMap: layerMap
    // @endif
  }, properties);

  // resolve linked files (source, image)
  tileEngine.tilesets.map(tileset => {
    // get the url of the Tiled JSON object (in this case, the properties object)
    let url = (window.__k ? window.__k.dm.get(properties) : '') || window.location.href;

    if (tileset.source) {
      // @if DEBUG
      if (!window.__k) {
        throw Error(`You must use "load" or "loadData" to resolve tileset.source`);
      }
      // @endif

      let source = window.__k.d[window.__k.u(tileset.source, url)];

      // @if DEBUG
      if (!source) {
        throw Error(`You must load the tileset source "${tileset.source}" before loading the tileset`);
      }
      // @endif

      Object.keys(source).map(key => {
        tileset[key] = source[key];
      });
    }

    if (''+tileset.image === tileset.image) {
      // @if DEBUG
      if (!window.__k) {
        throw Error(`You must use "load" or "loadImage" to resolve tileset.image`);
      }
      // @endif

      let image = window.__k.i[window.__k.u(tileset.image, url)];

      // @if DEBUG
      if (!image) {
        throw Error(`You must load the image "${tileset.image}" before loading the tileset`);
      }
      // @endif

      tileset.image = image;
    }
  });

  /**
   * Get the row from the y coordinate.
   * @private
   *
   * @param {Number} y - Y coordinate.
   *
   * @return {Number}
   */
  function getRow(y) {
    return y / tileEngine.tileheight | 0;
  }

  /**
   * Get the col from the x coordinate.
   * @private
   *
   * @param {Number} x - X coordinate.
   *
   * @return {Number}
   */
  function getCol(x) {
    return x / tileEngine.tilewidth | 0;
  }

  /**
   * Render a layer.
   * @private
   *
   * @param {Object} layer - Layer data.
   * @param {Context} context - Context to draw layer to.
   */
  function renderLayer(layer, context) {
    context.save();
    context.globalAlpha = layer.opacity;

    layer.data.map((tile, index) => {

      // skip empty tiles (0)
      if (!tile) return;

      // find the tileset the tile belongs to
      // assume tilesets are ordered by firstgid
      let tileset;
      for (let i = tileEngine.tilesets.length-1; i >= 0; i--) {
        tileset = tileEngine.tilesets[i];

        if (tile / tileset.firstgid >= 1) {
          break;
        }
      }

      let tilewidth = tileset.tilewidth || tileEngine.tilewidth;
      let tileheight = tileset.tileheight || tileEngine.tileheight;
      let margin = tileset.margin || 0;

      let image = tileset.image;

      let offset = tile - tileset.firstgid;
      let cols = tileset.columns ||
        image.width / (tilewidth + margin) | 0;

      let x = (index % tileEngine.width) * tilewidth;
      let y = (index / tileEngine.width | 0) * tileheight;
      let sx = (offset % cols) * (tilewidth + margin);
      let sy = (offset / cols | 0) * (tileheight + margin);

      context.drawImage(
        image,
        sx, sy, tilewidth, tileheight,
        x, y, tilewidth, tileheight
      );
    });

    context.restore();
  }

  /**
   * Pre-render the tiles to make drawing fast.
   * @private
   */
  function prerender() {
    if (tileEngine.layers) {
      tileEngine.layers.map(layer => {
        layer._d = false;
        layerMap[layer.name] = layer;

        if (layer.visible !== false) {
          tileEngine._r(layer, offscreenContext);
        }
      });
    }
  }

  /**
   * Render a tile engine canvas.
   * @private
   *
   * @param {HTMLCanvasElement} canvas - Tile engine canvas to draw.
   */
  function render(canvas) {
    const { width, height } = getCanvas();
    const sWidth = Math.min(canvas.width, width);
    const sHeight = Math.min(canvas.height, height);

    tileEngine.context.drawImage(
      canvas,
      tileEngine.sx, tileEngine.sy, sWidth, sHeight,
      0, 0, sWidth, sHeight
    );
  }

  prerender();
  return tileEngine;
}

let kontra = {
  Animation: animationFactory,

  imageAssets,
  audioAssets,
  dataAssets,
  setImagePath,
  setAudioPath,
  setDataPath,
  loadImage,
  loadAudio,
  loadData,
  load,

  init,
  getCanvas,
  getContext,

  on,
  off,
  emit,

  GameLoop,

  keyMap,
  initKeys,
  bindKeys,
  unbindKeys,
  keyPressed,

  registerPlugin,
  unregisterPlugin,
  extendObject,

  initPointer,
  pointer,
  track,
  untrack,
  pointerOver,
  onPointerDown,
  onPointerUp,
  pointerPressed,

  Pool: poolFactory,
  Quadtree: quadtreeFactory,
  Sprite: spriteFactory,
  SpriteSheet: spriteSheetFactory,

  setStoreItem,
  getStoreItem,

  TileEngine,
  Vector: vectorFactory
};

export { animationFactory as Animation, imageAssets, audioAssets, dataAssets, setImagePath, setAudioPath, setDataPath, loadImage, loadAudio, loadData, load, init, getCanvas, getContext, on, off, emit, GameLoop, keyMap, initKeys, bindKeys, unbindKeys, keyPressed, registerPlugin, unregisterPlugin, extendObject, initPointer, pointer, track, untrack, pointerOver, onPointerDown, onPointerUp, pointerPressed, poolFactory as Pool, quadtreeFactory as Quadtree, spriteFactory as Sprite, spriteSheetFactory as SpriteSheet, setStoreItem, getStoreItem, TileEngine, vectorFactory as Vector };
export default kontra;
