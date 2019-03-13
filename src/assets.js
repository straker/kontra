let imageRegex = /(jpeg|jpg|gif|png)$/;
let audioRegex = /(wav|mp3|ogg|aac)$/;
let leadingSlash = /^\//;
let trailingSlash = /\/$/;
let dataMap = new WeakMap();

let imagePath = '';
let audioPath = '';
let dataPath = '';

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

export let images = {};
export let audio = {};
export let data = {};

/**
 * Get the full URL from the base.
 *
 * @param {string} url - The URL to the asset.
 * @param {string} base - Base URL.
 *
 * @returns {string}
 */
export function getUrl(url, base) {
  return new URL(url, base).href;
}

/**
 * Set the image path.
 *
 * @param {string} path - Base image path.
 */
export function setImagePath(path) {
  imagePath = path;
}

/**
 * Set the audio path.
 *
 * @param {string} path - Base audio path.
 */
export function setAudioPath(path) {
  audioPath = path;
}

/**
 * Set the data path.
 *
 * @param {string} path - Base data path.
 */
export function setDataPath(path) {
  dataPath = path;
}

/**
 * Load an Image file. Uses imagePath to resolve URL.
 *
 * @param {string} url - The URL to the Image file.
 *
 * @returns {Promise} A deferred promise. Promise resolves with the Image.
 *
 * @example
 * loadImage('car.png');
 * loadImage('autobots/truck.png');
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    let resolvedUrl, image, fullUrl;

    resolvedUrl = joinPath(imagePath, url);
    if (images[resolvedUrl]) return resolve(images[resolvedUrl]);

    image = new Image();

    image.onload = function loadImageOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      images[ getName(url) ] = images[resolvedUrl] = images[fullUrl] = this;
      resolve(this);
    };

    image.onerror = function loadImageOnError() {
      reject(/* @if DEBUG */ 'Unable to load image ' + /* @endif */ resolvedUrl);
    };

    image.src = resolvedUrl;
  });
}

/**
 * Load an Audio file. Supports loading multiple audio formats which will be resolved by
 * the browser in the order listed. Uses audioPath to resolve URL.
 *
 * @param {string|string[]} url - The URL to the Audio file.
 *
 * @returns {Promise} A deferred promise. Promise resolves with the Audio.
 *
 * @example
 * loadAudio('sound_effects/laser.mp3');
 * loadAudio(['explosion.mp3', 'explosion.m4a', 'explosion.ogg']);
 */
export function loadAudio(url) {
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
    if (audio[resolvedUrl]) return resolve(audio[resolvedUrl]);

    audioEl.addEventListener('canplay', function loadAudioOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      audio[ getName(url) ] = audio[resolvedUrl] = audio[fullUrl] = this;
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
 * Load a data file (be it text or JSON). Uses dataPath to resolve URL.
 *
 * @param {string} url - The URL to the data file.
 *
 * @returns {Promise} A deferred promise. Resolves with the data or parsed JSON.
 *
 * @example
 * loadData('bio.json');
 * loadData('dialog.txt');
 */
export function loadData(url) {
  let resolvedUrl, fullUrl;

  resolvedUrl = joinPath(dataPath, url);
  if (data[resolvedUrl]) return Promise.resolve(data[resolvedUrl]);

  return fetch(resolvedUrl).then(response => {
    if (!response.ok) throw response;
    return response.clone().json().catch(() => response.text())
  }).then(response => {
    fullUrl = getUrl(resolvedUrl, window.location.href);
    if (typeof response === 'object') {
      dataMap.set(response, fullUrl);
    }

    data[ getName(url) ] = data[resolvedUrl] = data[fullUrl] = response;
    return response;
  });
}

/**
 * Load an Image, Audio, or data file.
 *
 * @param {string|string[]} - Comma separated list of assets to load.
 *
 * @returns {Promise} A deferred promise. Resolves with all the assets.
 *
 * @example
 * load('car.png');
 * load(['explosion.mp3', 'explosion.ogg']);
 * load('bio.json');
 * load('car.png', ['explosion.mp3', 'explosion.ogg'], 'bio.json');
 */
export function load(...assets) {
  return Promise.all(
    assets.map(asset => {
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
export function _reset() {
  images = {};
  audio = {};
  data = {};

  imagePath = audioPath = dataPath = '';

  if (getCanPlay._r) {
    getCanPlay = getCanPlay._r;
  }
}

/**
 * Override the getCanPlay function to provide a specific return type for tests
 */
export function _setCanPlayFn(fn) {
  let originalCanPlay = getCanPlay;
  getCanPlay = fn;
  getCanPlay._r = originalCanPlay;
}