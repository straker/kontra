let imageRegex = /(jpeg|jpg|gif|png)$/;
let audioRegex = /(wav|mp3|ogg|aac)$/;
let noRegex = /^no$/;
let leadingSlash = /^\//;
let trailingSlash = /\/$/;
let dataMap = new WeakMap();
let assets;

/**
 * Get browser audio playability.
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
 *
 * @returns {object}
 */
function getCanUse(audio) {
  return {
    wav: '',
    mp3: audio.canPlayType('audio/mpeg;').replace(noRegex,''),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"').replace(noRegex,''),
    aac: audio.canPlayType('audio/aac;').replace(noRegex,'')
  };
}

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
function loadAudio(originalUrl, url, undefined) {
  return new Promise(function(resolve, reject) {
    let audio = new Audio();
    let canUse = getCanUse(audio);

    // determine which audio format the browser can play
    originalUrl = [].concat(originalUrl).reduce(function(a, source) {
      return canUse[ getExtension(source) ] ? source : a
    }, undefined);

    if (!originalUrl) {
      reject(/* @if DEBUG */ 'cannot play any of the audio formats provided' + /* @endif */ originalUrl);
    }
    else {
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

export default assets;