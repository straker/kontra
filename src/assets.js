import { emit } from './events.js';

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

let imageRegex = /(jpeg|jpg|gif|png|webp)$/;
let audioRegex = /(wav|mp3|ogg|aac)$/;
let leadingSlash = /^\//;
let trailingSlash = /\/$/;
let dataMap = /*@__PURE__*/ new WeakMap();

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
  return [
    base.replace(trailingSlash, ''),
    base ? url.replace(leadingSlash, '') : url
  ]
    .filter(s => s)
    .join('/');
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
  return name.split('/').length == 2
    ? name.replace(leadingSlash, '')
    : name;
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
    wav: audio.canPlayType('audio/wav; codecs="1"'),
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
 * @property {{[name: String]: HTMLImageElement}} imageAssets
 */
export let imageAssets = {};

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
 * @property {{[name: String]: HTMLAudioElement}} audioAssets
 */
export let audioAssets = {};

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
 * @property {{[name: String]: any}} dataAssets
 */
export let dataAssets = {};

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
export function setImagePath(path) {
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
export function setAudioPath(path) {
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
export function setDataPath(path) {
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
 * @returns {Promise<HTMLImageElement>} A deferred promise. Promise resolves with the Image.
 */
export function loadImage(url) {
  addGlobal();

  return new Promise((resolve, reject) => {
    let resolvedUrl, image, fullUrl;

    resolvedUrl = joinPath(imagePath, url);
    if (imageAssets[resolvedUrl])
      return resolve(imageAssets[resolvedUrl]);

    image = new Image();

    image.onload = function loadImageOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      imageAssets[getName(url)] =
        imageAssets[resolvedUrl] =
        imageAssets[fullUrl] =
          this;
      emit('assetLoaded', this, url);
      resolve(this);
    };

    image.onerror = function loadImageOnError() {
      reject(
        /* @ifdef DEBUG */ 'Unable to load image ' +
          /* @endif */ resolvedUrl
      );
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
 * @param {String|String[]} url - The URL to the Audio file.
 *
 * @returns {Promise<HTMLAudioElement>} A deferred promise. Promise resolves with the Audio.
 */
export function loadAudio(url) {
  return new Promise((resolve, reject) => {
    let _url = url,
      audioEl,
      canPlay,
      resolvedUrl,
      fullUrl;

    audioEl = new Audio();
    canPlay = getCanPlay(audioEl);

    // determine the first audio format the browser can play
    url = []
      .concat(url)
      .reduce(
        (playableSource, source) =>
          playableSource
            ? playableSource
            : canPlay[getExtension(source)]
            ? source
            : null,
        0
      ); // 0 is the shortest falsy value

    if (!url) {
      return reject(
        /* @ifdef DEBUG */ 'cannot play any of the audio formats provided ' +
          /* @endif */ _url
      );
    }

    resolvedUrl = joinPath(audioPath, url);
    if (audioAssets[resolvedUrl])
      return resolve(audioAssets[resolvedUrl]);

    audioEl.addEventListener('canplay', function loadAudioOnLoad() {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      audioAssets[getName(url)] =
        audioAssets[resolvedUrl] =
        audioAssets[fullUrl] =
          this;
      emit('assetLoaded', this, url);
      resolve(this);
    });

    audioEl.onerror = function loadAudioOnError() {
      reject(
        /* @ifdef DEBUG */ 'Unable to load audio ' +
          /* @endif */ resolvedUrl
      );
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
export function loadData(url) {
  addGlobal();
  let resolvedUrl, fullUrl;

  resolvedUrl = joinPath(dataPath, url);
  if (dataAssets[resolvedUrl])
    return Promise.resolve(dataAssets[resolvedUrl]);

  return fetch(resolvedUrl)
    .then(response => {
      if (!response.ok) throw response;
      return response
        .clone()
        .json()
        .catch(() => response.text());
    })
    .then(response => {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      if (typeof response == 'object') {
        dataMap.set(response, fullUrl);
      }

      dataAssets[getName(url)] =
        dataAssets[resolvedUrl] =
        dataAssets[fullUrl] =
          response;
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
 * @param {...(String|String[])[]} urls - Comma separated list of asset urls to load.
 *
 * @returns {Promise<any[]>} A deferred promise. Resolves with all the loaded assets.
 */
export function load(...urls) {
  addGlobal();

  return Promise.all(
    urls.map(asset => {
      // account for a string or an array for the url
      let extension = getExtension([].concat(asset)[0]);

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
  imageAssets = {};
  audioAssets = {};
  dataAssets = {};

  imagePath = audioPath = dataPath = '';
  window.__k = undefined;

  if (getCanPlay._r) {
    /* eslint-disable-next-line no-func-assign */
    getCanPlay = getCanPlay._r;
  }
}

// Override the getCanPlay function to provide a specific return
// type for tests
export function _setCanPlayFn(fn) {
  let originalCanPlay = getCanPlay;
  /* eslint-disable-next-line no-func-assign */
  getCanPlay = fn;
  getCanPlay._r = originalCanPlay;
}
