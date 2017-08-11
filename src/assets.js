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
    aac: audio.canPlayType('audio/aac;').replace(noRegex,''),
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
      var type, name, url, extension, asset, i;

      for (i = 0; (asset = arguments[i]); i++) {
        url = (Array.isArray(asset) ? asset[0] : asset);

        extension = getExtension(url);
        if (extension.match(imageRegex)) {
          type = 'Image';
        }
        else if (extension.match(audioRegex)) {
          type = 'Audio';
        }
        else {
          type = 'Data';
        }

        promises.push(this['load' + type](asset));
      }

      return Promise.all(promises);
    },

    /**
     * Load an Image file. Uses imagePath to resolve URL.
     * @memberOf kontra.assets
     *
     * @param {string} url - The URL to the Image file.
     *
     * @returns {Promise} A deferred promise. Promise resolves with the Image.
     *
     * @example
     * kontra.loadImage('car.png');
     * kontra.loadImage('autobots/truck.png');
     */
    loadImage: function loadImage(url) {
      var name = getName(url);
      var image = new Image();
      var imageAssets = this.images;

      url = joinPath(this.imagePath, url);

      return new Promise(function(resolve, reject) {
        image.onload = function loadImageOnLoad() {
          imageAssets[name] = imageAssets[url] = this;
          resolve(this);
        };

        image.onerror = function loadImageOnError() {
          reject('Unable to load image ' + url);
        };

        image.src = url;
      });
    },

    /**
     * Load an Audio file. Supports loading multiple audio formats which will be resolved by
     * the browser in the order listed. Uses audioPath to resolve URL.
     * @memberOf kontra.assets
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
    loadAudio: function loadAudio(url) {
      var audioAssets = this.audio;
      var audioPath = this.audioPath;
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
          reject('cannot play any of the audio formats provided');
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
            reject('Unable to load audio ' + source);
          };

          audio.src = source;
          audio.load();
        }
      });
    },

    /**
     * Load a data file (be it text or JSON). Uses dataPath to resolve URL.
     * @memberOf kontra.assets
     *
     * @param {string} url - The URL to the data file.
     *
     * @returns {Promise} A deferred promise. Resolves with the data or parsed JSON.
     *
     * @example
     * kontra.loadData('bio.json');
     * kontra.loadData('dialog.txt');
     */
    loadData: function loadData(url) {
      var name = getName(url);
      var dataUrl = joinPath(this.dataPath, url);
      var dataAssets = this.data;
      var req = new XMLHttpRequest();

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

          dataAssets[name] = dataAssets[dataUrl] = data;
          resolve(data);
        });

        req.open('GET', dataUrl, true);
        req.send();
      });
    },

    // expose properties for testing
    _canUse: canUse
  };
})(Promise);