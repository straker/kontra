(function(Promise) {
  var imageRegex = /(jpeg|jpg|gif|png)$/;
  var audioRegex = /(wav|mp3|ogg|aac)$/;
  var noRegex = /^no$/;

  // audio playability
  // @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
  var audio = new Audio();
  var canUse = {
    wav: '',
    mp3: audio.canPlayType('audio/mpeg;').replace(noRegex,''),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"').replace(noRegex,''),
    aac: audio.canPlayType('audio/aac;').replace(noRegex,'')
  };

  /**
   * Join a path with proper separators.
   * @see https://stackoverflow.com/a/43888647/2124254
   */
  function joinPath() {
    var path = [], i = 0;

    for (; i < arguments.length; i++) {
      if (arguments[i]) {

        // replace slashes at the beginning or end of a path
        // replace 2 or more slashes at the beginning of the first path to
        // preserve root routes (/root)
        path.push( arguments[i].trim().replace(new RegExp('(^[\/]{' + (path[0] ? 1 : 2) + ',}|[\/]*$)', 'g'), '') );
      }
    }

    return path.join('/');
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
    var name = url.replace('.' + getExtension(url), '');

    // remove slash if there is no folder in the path
    return (name.indexOf('/') == 0 && name.lastIndexOf('/') == 0 ? name.substr(1) : name);
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
  function loadImage(url) {
    var name = getName(url);
    var image = new Image();

    var self = kontra.assets;
    var imageAssets = self.images;

    url = joinPath(self.imagePath, url);

    return new Promise(function(resolve, reject) {
      image.onload = function loadImageOnLoad() {
        imageAssets[name] = imageAssets[url] = this;
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
  function loadAudio(url) {
    var self = kontra.assets;
    var audioAssets = self.audio;
    var audioPath = self.audioPath;
    var source, name, playableSource, audio, i;

    if (!Array.isArray(url)) {
      url = [url];
    }

    return new Promise(function(resolve, reject) {
      // determine which audio format the browser can play
      for (i = 0; (source = url[i]); i++) {
        if ( canUse[getExtension(source)] ) {
          playableSource = source;
          break;
        }
      }

      if (!playableSource) {
        reject(/* @if DEBUG */ 'cannot play any of the audio formats provided' + /* @endif */ '');
      }
      else {
        name = getName(playableSource);
        audio = new Audio();
        source = joinPath(audioPath, playableSource);

        audio.addEventListener('canplay', function loadAudioOnLoad() {
          audioAssets[name] = audioAssets[source] = this;
          resolve(this);
        });

        audio.onerror = function loadAudioOnError() {
          reject(/* @if DEBUG */ 'Unable to load audio ' + /* @endif */ source);
        };

        audio.src = source;
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
  function loadData(url) {
    var name = getName(url);
    var req = new XMLHttpRequest();

    var self = kontra.assets;
    var dataAssets = self.data;

    url = joinPath(self.dataPath, url);

    return new Promise(function(resolve, reject) {
      req.addEventListener('load', function loadDataOnLoad() {
        var data = req.responseText;

        if (req.status !== 200) {
          return reject(data);
        }

        try {
          data = JSON.parse(data);
        }
        catch(e) {}

        dataAssets[name] = dataAssets[url] = data;
        resolve(data);
      });

      req.open('GET', url, true);
      req.send();
    });
  }

  /**
   * Object for loading assets.
   */
  kontra.assets = {
    // all assets are stored by name as well as by URL
    images: {},
    audio: {},
    data: {},

    // base asset path for determining asset URLs
    imagePath: '',
    audioPath: '',
    dataPath: '',

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
    load: function loadAsset() {
      var promises = [];
      var url, extension, asset, i, promise;

      for (i = 0; (asset = arguments[i]); i++) {
        url = (Array.isArray(asset) ? asset[0] : asset);

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
    },

    // expose properties for testing
    _canUse: canUse
  };
})(Promise);