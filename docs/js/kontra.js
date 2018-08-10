this.kontra = {

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  init(canvas) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    var canvasEl = this.canvas = document.getElementById(canvas) ||
                                 canvas ||
                                 document.querySelector('canvas');

    // @if DEBUG
    if (!canvasEl) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    this.context = canvasEl.getContext('2d');
  },

  /**
   * Noop function.
   * @see https://stackoverflow.com/questions/21634886/what-is-the-javascript-convention-for-no-operation#comment61796464_33458430
   * @memberof kontra
   * @private
   *
   * The new operator is required when using sinon.stub to replace with the noop.
   */
  _noop: new Function,

  /**
   * Dispatch event to any part of the code that needs to know when
   * a new frame has started. Will be filled out in pointer events.
   * @memberOf kontra
   * @private
   */
  _tick: new Function
};
(function() {
  let imageRegex = /(jpeg|jpg|gif|png)$/;
  let audioRegex = /(wav|mp3|ogg|aac)$/;
  let noRegex = /^no$/;
  let leadingSlash = /^\//;
  let trailingSlash = /\/$/;
  let assets;

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
    return [base.replace(trailingSlash, ''), url.replace(leadingSlash, '')].join('/')
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
        assets.images[ getName(originalUrl) ] = assets.images[url] = this;
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

      // determine which audio format the browser can play
      originalUrl = [].concat(originalUrl).reduce(function(a, source) {
        return canUse[ getExtension(source) ] ? source : a
      }, undefined);

      if (!originalUrl) {
        reject(/* @if DEBUG */ 'cannot play any of the audio formats provided' + /* @endif */ originalUrl);
      }
      else {
        let audio = new Audio();
        url = joinPath(assets.audioPath, originalUrl);

        audio.addEventListener('canplay', function loadAudioOnLoad() {
          assets.audio[ getName(originalUrl) ] = assets.audio[url] = this;
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
      assets.data[ getName(originalUrl) ] = assets.data[url] = data;
      return data;
    });
  }

  /**
   * Object for loading assets.
   */
  assets = kontra.assets = {
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
    },

    // expose properties for testing
    /* @if DEBUG */
    _canUse: canUse
    /* @endif */
  };
})();
(function() {

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
  kontra.gameLoop = function(properties) {
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
                kontra._noop :
                function clear() {
                  kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
                });
    let last, rAF, now, dt;

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

      kontra._tick();
      accumulator += dt;

      while (accumulator >= delta) {
        gameLoop.update(step);

        accumulator -= delta;
      }

      clear();
      gameLoop.render();
    }

    // game loop object
    let gameLoop = {
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

    return gameLoop;
  };
})();
(function() {
  let callbacks = {};
  let pressedKeys = {};

  let keyMap = {
    // named keys
    13: 'enter',
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // alpha keys
  // @see https://stackoverflow.com/a/43095772/2124254
  for (let i = 0; i < 26; i++) {
    keyMap[65+i] = (10 + i).toString(36);
  }
  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap[48+i] = ''+i;
  }

  addEventListener('keydown', keydownEventHandler);
  addEventListener('keyup', keyupEventHandler);
  addEventListener('blur', blurEventHandler);

  /**
   * Execute a function that corresponds to a keyboard key.
   * @private
   *
   * @param {Event} e
   */
  function keydownEventHandler(e) {
    let key = keyMap[e.which];
    pressedKeys[key] = true;

    if (callbacks[key]) {
      callbacks[key](e);
    }
  }

  /**
   * Set the released key to not being pressed.
   * @private
   *
   * @param {Event} e
   */
  function keyupEventHandler(e) {
    pressedKeys[ keyMap[e.which] ] = false;
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

  /**
   * Object for using the keyboard.
   */
  kontra.keys = {
    /**
     * Register a function to be called on a key press.
     * @memberof kontra.keys
     *
     * @param {string|string[]} keys - key or keys to bind.
     */
    bind(keys, callback) {
      // smaller than doing `Array.isArray(keys) ? keys : [keys]`
      [].concat(keys).map(function(key) {
        callbacks[key] = callback;
      })
    },

    /**
     * Remove the callback function for a key.
     * @memberof kontra.keys
     *
     * @param {string|string[]} keys - key or keys to unbind.
     */
    unbind(keys, undefined) {
      [].concat(keys).map(function(key) {
        callbacks[key] = undefined;
      })
    },

    /**
     * Returns whether a key is pressed.
     * @memberof kontra.keys
     *
     * @param {string} key - Key to check for press.
     *
     * @returns {boolean}
     */
    pressed(key) {
      return !!pressedKeys[key];
    }
  };
})();
(function() {
  let pointer;

  // save each object as they are rendered to determine which object
  // is on top when multiple objects are the target of an event.
  // we'll always use the last frame's object order so we know
  // the finalized order of all objects, otherwise an object could ask
  // if it's being hovered when it's rendered first even if other objects
  // would block it later in the render order
  let thisFrameRenderOrder = [];
  let lastFrameRenderOrder = [];

  let callbacks = {};
  let trackedObjects = [];
  let pressedButtons = {};

  let buttonMap = {
    0: 'left',
    1: 'middle',
    2: 'right'
  };

  addEventListener('mousedown', pointerDownHandler);
  addEventListener('touchstart', pointerDownHandler);
  addEventListener('mouseup', pointerUpHandler);
  addEventListener('touchend', pointerUpHandler);
  addEventListener('blur', blurEventHandler);
  addEventListener('mousemove', mouseMoveHandler);

  /**
   * Detection collision between a rectangle and a circle.
   * @see https://yal.cc/rectangle-circle-intersection-test/
   * @private
   *
   * @param {object} object - Object to check collision against.
   */
  function circleRectCollision(object) {
    let dx = pointer.x - Math.max(object.x, Math.min(pointer.x, object.x + object.width));
    let dy = pointer.y - Math.max(object.y, Math.min(pointer.y, object.y + object.height));
    return (dx * dx + dy * dy) < (pointer.radius * pointer.radius);
  }

  /**
   * Get the first on top object that the pointer collides with.
   * @private
   *
   * @returns {object} First object to collide with the pointer.
   */
  function getCurrentObject() {

    // if pointer events are required on the very first frame or without a game loop,
    // use the current frame order array
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
   * @private
   *
   * @param {Event} e
   */
  function pointerDownHandler(e) {
    pressedButtons[ buttonMap[e.button] ] = true;
    pointerHandler(e, 'onDown');
  }

  /**
   * Execute the onUp callback for an object.
   * @private
   *
   * @param {Event} e
   */
  function pointerUpHandler(e) {
    pressedButtons[ buttonMap[e.button] ] = false;
    pointerHandler(e, 'onUp');
  }

  /**
   * Track the position of the mouse.
   * @private
   *
   * @param {Event} e
   */
  function mouseMoveHandler(e) {
    pointerHandler(e, 'onOver');
  }

  /**
   * Reset pressed buttons.
   * @private
   *
   * @param {Event} e
   */
  function blurEventHandler(e) {
    pressedButtons = {};
  }

  /**
   * Find the first object for the event and execute it's callback function
   * @private
   *
   * @param {Event} e
   * @param {string} event - Which event was called.
   */
  function pointerHandler(e, event) {
    if (!kontra.canvas) return;

    let clientX, clientY;

    if (e.type.indexOf('mouse') !== -1) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    else {
      // touchstart uses touches while touchend uses changedTouches
      // @see https://stackoverflow.com/questions/17957593/how-to-capture-touchend-coordinates
      clientX = (e.touches[0] || e.changedTouches[0]).clientX;
      clientY = (e.touches[0] || e.changedTouches[0]).clientY;
    }

    pointer.x = clientX - kontra.canvas.offsetLeft;
    pointer.y = clientY - kontra.canvas.offsetTop;

    let object;
    if (e.target === kontra.canvas) {
      object = getCurrentObject();
      if (object && object[event]) {
        object[event]();
      }
    }

    if (callbacks[event]) {
      callbacks[event](e, object);
    }
  }

  /**
   * Object for using the pointer.
   */
  pointer = kontra.pointer = {
    x: 0,
    y: 0,
    radius: 5,  // arbitrary size

    /**
     * Register object to be tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to track.
     */
    track(objects) {
      [].concat(objects).map(function(object) {

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
    },

    /**
     * Remove object from being tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to stop tracking.
     */
    untrack(objects, undefined) {
      [].concat(objects).map(function(object) {

        // restore original render function to no longer track render order
        object.render = object._r;
        object._r = undefined;

        let index = trackedObjects.indexOf(object);
        if (index !== -1) {
          trackedObjects.splice(index, 1);
        }
      })
    },

    /**
     * Returns whether a tracked object is under the pointer.
     * @memberof kontra.pointer
     *
     * @param {object} object - Object to check
     *
     * @returns {boolean}
     */
    over(object) {
      if (trackedObjects.indexOf(object) === -1) return false;

      return getCurrentObject() === object;
    },

    /**
     * Register a function to be called on pointer down.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onDown(callback) {
      callbacks.onDown = callback;
    },

    /**
     * Register a function to be called on pointer up.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onUp(callback) {
      callbacks.onUp = callback;
    },

    /**
     * Returns whether the button is pressed.
     * @memberof kontra.pointer
     *
     * @param {string} button - Button to check for press.
     *
     * @returns {boolean}
     */
    pressed(button) {
      return !!pressedButtons[button]
    }
  };

  // reset object render order on every new frame
  kontra._tick = function() {
    lastFrameRenderOrder.length = 0;

    thisFrameRenderOrder.map(function(object) {
      lastFrameRenderOrder.push(object);
    });

    thisFrameRenderOrder.length = 0;
  };
})();
(function() {

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {function} properties.create - Function that returns the object to use in the pool.
   * @param {number} properties.maxSize - The maximum size that the pool will grow to.
   */
  kontra.pool = function(properties) {
    properties = properties || {};

    let inUse = 0;

    // check for the correct structure of the objects added to pools so we know that the
    // rest of the pool code will work without errors
    // @if DEBUG
    let obj;
    if (!properties.create ||
        ( !( obj = properties.create() ) ||
          !( obj.update && obj.init &&
             obj.isAlive )
       )) {
      throw Error('Must provide create() function which returns an object with init(), update(), and isAlive() functions');
    }
    // @endif

    return {
      _c: properties.create,

      // start the pool with an object
      objects: [properties.create()],
      size: 1,
      maxSize: properties.maxSize || Infinity,

      /**
       * Get an object from the pool.
       * @memberof kontra.pool
       *
       * @param {object} properties - Properties to pass to object.init().
       */
      get(properties) {
        properties = properties || {};

        // the pool is out of objects if the first object is in use and it can't grow
        if (this.objects[0].isAlive()) {
          if (this.size === this.maxSize) {
            return;
          }
          // double the size of the array by filling it with twice as many objects
          else {
            for (let x = 0; x < this.size && this.objects.length < this.maxSize; x++) {
              this.objects.unshift(this._c());
            }

            this.size = this.objects.length;
          }
        }

        // save off first object in pool to reassign to last object after unshift
        let obj = this.objects.shift();
        obj.init(properties);
        this.objects.push(obj);
        inUse++;
      },

      /**
       * Return all objects that are alive from the pool.
       * @memberof kontra.pool
       *
       * @returns {object[]}
       */
      getAliveObjects() {
        return this.objects.slice(this.objects.length - inUse);
      },

      /**
       * Clear the object pool.
       * @memberof kontra.pool
       */
      clear() {
        inUse = this.objects.length = 0;
        this.size = 1;
        this.objects.push(this._c());
      },

      /**
       * Update all alive pool objects.
       * @memberof kontra.pool
       *
       * @param {number} dt - Time since last update.
       */
      update(dt) {
        let i = this.size - 1;
        let obj;

        // If the user kills an object outside of the update cycle, the pool won't know of
        // the change until the next update and inUse won't be decremented. If the user then
        // gets an object when inUse is the same size as objects.length, inUse will increment
        // and this statement will evaluate to -1.
        //
        // I don't like having to go through the pool to kill an object as it forces you to
        // know which object came from which pool. Instead, we'll just prevent the index from
        // going below 0 and accept the fact that inUse may be out of sync for a frame.
        let index = Math.max(this.objects.length - inUse, 0);

        // only iterate over the objects that are alive
        while (i >= index) {
          obj = this.objects[i];

          obj.update(dt);

          // if the object is dead, move it to the front of the pool
          if (!obj.isAlive()) {
            this.objects = this.objects.splice(i, 1).concat(this.objects);
            inUse--;
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
      render() {
        let index = Math.max(this.objects.length - inUse, 0);

        for (let i = this.size - 1; i >= index; i--) {
          this.objects[i].render();
        }
      }
    };
  };
})();
(function() {

  /**
   * A quadtree for 2D collision checking. The quadtree acts like an object pool in that it
   * will create subnodes as objects are needed but it won't clean up the subnodes when it
   * collapses to avoid garbage collection.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the quadtree.
   * @param {number} [properties.maxDepth=3] - Maximum node depths the quadtree can have.
   * @param {number} [properties.maxObjects=25] - Maximum number of objects a node can support before splitting.
   * @param {object} [properties.bounds] - The 2D space this node occupies.
   * @param {object} [properties.parent] - Private. The node that contains this node.
   * @param {number} [properties.depth=0] - Private. Current node depth.
   *
   * The quadrant indices are numbered as follows (following a z-order curve):
   *     |
   *  0  |  1
   * ----+----
   *  2  |  3
   *     |
   */
  kontra.quadtree = function(properties) {
    properties = properties || {};

    return {
      maxDepth: properties.maxDepth || 3,
      maxObjects: properties.maxObjects || 25,

      // since we won't clean up any subnodes, we need to keep track of which nodes are
      // currently the leaf node so we know which nodes to add objects to
      // b = branch, d = depth, p = parent
      _b: false,
      _d: properties.depth || 0,
      /* @if VISUAL_DEBUG */
      _p: properties.parent,
      /* @endif */

      bounds: properties.bounds || {
        x: 0,
        y: 0,
        width: kontra.canvas.width,
        height: kontra.canvas.height
      },

      objects: [],
      subnodes: [],

      /**
       * Clear the quadtree
       * @memberof kontra.quadtree
       */
      clear() {
        this.subnodes.map(function(subnode) {
          subnode.clear();
        });

        this._b = false;
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
      get(object) {
        let objects = [];
        let indices, i;

        // traverse the tree until we get to a leaf node
        while (this.subnodes.length && this._b) {
          indices = this._g(object);

          for (i = 0; i < indices.length; i++) {
            objects.push.apply(objects, this.subnodes[ indices[i] ].get(object));
          }

          return objects;
        }

        return this.objects;
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
      add() {
        let i, j, object, obj, indices, index;

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
          this.objects.push(object);

          // split the node if there are too many objects
          if (this.objects.length > this.maxObjects && this._d < this.maxDepth) {
            this._s();

            // move all objects to their corresponding subnodes
            for (i = 0; (obj = this.objects[i]); i++) {
              this._a(obj);
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
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
      _a(object, indices, i) {
        indices = this._g(object);

        // add the object to all subnodes it intersects
        for (i = 0; i < indices.length; i++) {
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
      _g(object) {
        let indices = [];

        let verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        let horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        // save off quadrant checks for reuse
        let intersectsTopQuadrants = object.y < horizontalMidpoint && object.y + object.height >= this.bounds.y;
        let intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint && object.y < this.bounds.y + this.bounds.height;

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
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
      _s(subWidth, subHeight, i) {
        this._b = true;

        // only split if we haven't split before
        if (this.subnodes.length) {
          return;
        }

        subWidth = this.bounds.width / 2 | 0;
        subHeight = this.bounds.height / 2 | 0;

        for (i = 0; i < 4; i++) {
          this.subnodes[i] = kontra.quadtree({
            bounds: {
              x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
              y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
              width: subWidth,
              height: subHeight
            },
            depth: this._d+1,
            maxDepth: this.maxDepth,
            maxObjects: this.maxObjects,
            /* @if VISUAL_DEBUG */
            parent: this
            /* @endif */
          });
        }
      },

      /**
       * Draw the quadtree. Useful for visual debugging.
       * @memberof kontra.quadtree
       */
       /* @if VISUAL_DEBUG **
       render() {
         // don't draw empty leaf nodes, always draw branch nodes and the first node
         if (this.objects.length || this._d === 0 ||
             (this._p && this._p._b)) {

           kontra.context.strokeStyle = 'red';
           kontra.context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

           if (this.subnodes.length) {
             for (let i = 0; i < 4; i++) {
               this.subnodes[i].render();
             }
           }
         }
       }
       /* @endif */
    };
  };
})();
(function() {

  class Vector {
    /**
     * Initialize the vectors x and y position.
     * @memberof kontra.vector
     * @private
     *
     * @param {number} [x=0] - X coordinate.
     * @param {number} [y=0] - Y coordinate.
     *
     * @returns {vector}
     */
    constructor(x, y) {
      this._x = x || 0;
      this._y = y || 0;
    }

    /**
     * Add a vector to this vector.
     * @memberof kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt=1 - Time since last update.
     */
    add(vector, dt) {
      this.x += (vector.x || 0) * (dt || 1);
      this.y += (vector.y || 0) * (dt || 1);
    }

    /**
     * Clamp the vector between two points that form a rectangle.
     * @memberof kontra.vector
     *
     * @param {number} xMin - Min x value.
     * @param {number} yMin - Min y value.
     * @param {number} xMax - Max x value.
     * @param {number} yMax - Max y value.
     */
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }

    /**
     * Vector x
     * @memberof kontra.vector
     *
     * @property {number} x
     */
    get x() {
      return this._x;
    }

    /**
     * Vector y
     * @memberof kontra.vector
     *
     * @property {number} y
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

  /**
   * A vector for 2D space.
   * @memberof kontra
   *
   * @param {number} [x=0] - X coordinate.
   * @param {number} [y=0] - Y coordinate.
   */
  kontra.vector = (x, y) => {
    return new Vector(x, y);
  };
  kontra.vector.prototype = Vector.prototype;





  class Sprite {
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
     * @param {number} [properties.ttl=0] - How may frames the sprite should be alive.
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
     * decide when to kill it, you can set <code>ttl</code> to <code>Infinity</code>.
     * Just be sure to set <code>ttl</code> to 0 when you want the sprite to die.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    constructor(properties, prop, temp, firstAnimation) {
      properties = properties || {};

      this.position = kontra.vector(properties.x, properties.y);
      this.velocity = kontra.vector(properties.dx, properties.dy);
      this.acceleration = kontra.vector(properties.ddx, properties.ddy);

      // defaults
      this.width = this.height = 0;
      this.context = kontra.context;

      // loop through properties before overrides
      for (prop in properties) {
        this[prop] = properties[prop];
      }

      // image sprite
      if (temp = properties.image) {
        this.image = temp;
        this.width = temp.width;
        this.height = temp.height;
      }
      // animation sprite
      else if (temp = properties.animations) {

        // clone each animation so no sprite shares an animation
        for (prop in temp) {
          this.animations[prop] = temp[prop].clone();

          // default the current animation to the first one in the list
          firstAnimation = firstAnimation || temp[prop];
        }

        this._ca = firstAnimation;
        this.width = firstAnimation.width;
        this.height = firstAnimation.height;
      }
    }

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
    }

    /**
     * Sprite position.y
     * @memberof kontra.sprite
     *
     * @property {number} y
     */
    get y() {
      return this.position.y;
    }

    /**
     * Sprite velocity.x
     * @memberof kontra.sprite
     *
     * @property {number} dx
     */
    get dx() {
      return this.velocity.x;
    }

    /**
     * Sprite velocity.y
     * @memberof kontra.sprite
     *
     * @property {number} dy
     */
    get dy() {
      return this.velocity.y;
    }

    /**
     * Sprite acceleration.x
     * @memberof kontra.sprite
     *
     * @property {number} ddx
     */
    get ddx() {
      return this.acceleration.x;
    }

    /**
     * Sprite acceleration.y
     * @memberof kontra.sprite
     *
     * @property {number} ddy
     */
    get ddy() {
      return this.acceleration.y;
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

    /**
     * Determine if the sprite is alive.
     * @memberof kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive() {
      return this.ttl > 0;
    }

    /**
     * Simple bounding box collision test.
     * @memberof kontra.sprite
     *
     * @param {object} object - Object to check collision against.
     *
     * @returns {boolean} True if the objects collide, false otherwise.
     */
    collidesWith(object) {
      return this.x < object.x + object.width &&
             this.x + this.width > object.x &&
             this.y < object.y + object.height &&
             this.y + this.height > object.y;
    }

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
    update(dt) {
      this.advance(dt);
    }

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
    render() {
      this.draw();
    }

    /**
     * Play an animation.
     * @memberof kontra.sprite
     *
     * @param {string} name - Name of the animation to play.
     */
    playAnimation(name) {
      this._ca = this.animations[name];

      if (!this._ca.loop) {
        this._ca.reset();
      }
    }

    /**
     * Advance the sprites position, velocity, and current animation (if it
     * has one).
     * @memberof kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advance(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.ttl--;

      if (this._ca) {
        this._ca.update(dt);
      }
    }

    /**
     * Draw the sprite to the canvas.
     * @memberof kontra.sprite
     */
    draw() {
      if (this.image) {
        this.context.drawImage(this.image, this.x, this.y);
      }
      else if (this._ca) {
        this._ca.render(this);
      }
      else {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  };

  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberof kontra
   * @requires kontra.vector
   *
   * @param {object} properties - Properties of the sprite.
   * @param {number} properties.x - X coordinate of the sprite.
   * @param {number} properties.y - Y coordinate of the sprite.
   * @param {number} [properties.dx] - Change in X position.
   * @param {number} [properties.dy] - Change in Y position.
   * @param {number} [properties.ddx] - Change in X velocity.
   * @param {number} [properties.ddy] - Change in Y velocity.
   *
   * @param {number} [properties.ttl=0] - How may frames the sprite should be alive.
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
   */
  kontra.sprite = (properties) => {
    return new Sprite(properties);
  };
  kontra.sprite.prototype = Sprite.prototype;
})();
(function() {

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
      return kontra.animation(this);
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
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     */
    render(properties) {
      properties = properties || {};

      // get the row and col of the frame
      let row = this.frames[this._f] / this.spriteSheet._f | 0;
      let col = this.frames[this._f] % this.spriteSheet._f | 0;

      (properties.context || kontra.context).drawImage(
        this.spriteSheet.image,
        col * this.width + (col * 2 + 1) * this.margin,
        row * this.height + (row * 2 + 1) * this.margin,
        this.width, this.height,
        properties.x, properties.y,
        this.width, this.height
      );
    }
  }

  /**
   * Single animation from a sprite sheet.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the animation.
   * @param {object} properties.spriteSheet - Sprite sheet for the animation.
   * @param {number[]} properties.frames - List of frames of the animation.
   * @param {number}  properties.frameRate - Number of frames to display in one second.
   */
  kontra.animation = function(properties) {
    return new Animation(properties);
  };
  kontra.animation.prototype = Animation.prototype;





  class SpriteSheet {
    /**
     * Initialize properties on the spriteSheet.
     * @memberof kontra
     * @private
     *
     * @param {object} properties - Properties of the sprite sheet.
     * @param {Image|Canvas} properties.image - Image for the sprite sheet.
     * @param {number} properties.frameWidth - Width (in px) of each frame.
     * @param {number} properties.frameHeight - Height (in px) of each frame.
     * @param {number} properties.frameMargin - Margin (in px) between each frame.
     * @param {object} properties.animations - Animations to create from the sprite sheet.
     */
    constructor(properties) {
      properties = properties || {};

      // @if DEBUG
      if (!properties.image) {
        throw Error('You must provide an Image for the SpriteSheet');
      }
      // @endif

      this.animations = {};
      this.image = properties.image;
      this.frame = {
        width: properties.frameWidth,
        height: properties.frameHeight,
        margin: properties.frameMargin
      };

      // f = framesPerRow
      this._f = properties.image.width / properties.frameWidth | 0;

      this.createAnimations(properties.animations);
    }

    /**
     * Create animations from the sprite sheet.
     * @memberof kontra.spriteSheet
     *
     * @param {object} animations - List of named animations to create from the Image.
     * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
     * @param {number} animations.animationName.frameRate - Number of frames to display in one second.
     *
     * @example
     * let sheet = kontra.spriteSheet({image: img, frameWidth: 16, frameHeight: 16});
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
     *     frameRate: 3,
     *     loop: false
     *   },
     *   attack: {
     *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *     frameRate: 2,
     *     loop: false
     *   }
     * });
     */
    createAnimations(animations) {
      let animation, frames, frameRate, sequence, name;

      for (name in animations) {
        animation = animations[name];
        frames = animation.frames;

        // array that holds the order of the animation
        sequence = [];

        // @if DEBUG
        if (frames === undefined) {
          throw Error('Animation ' + name + ' must provide a frames property');
        }
        // @endif

        // add new frames to the end of the array
        [].concat(frames).map(function(frame) {
          sequence = sequence.concat(this._p(frame));
        }, this);

        this.animations[name] = kontra.animation({
          spriteSheet: this,
          frames: sequence,
          frameRate: animation.frameRate,
          loop: animation.loop
        });
      }
    }

    /**
     * Parse a string of consecutive frames.
     * @memberof kontra.spriteSheet
     * @private
     *
     * @param {number|string} frames - Start and end frame.
     *
     * @returns {number[]} List of frames.
     */
    _p(consecutiveFrames, i) {
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
      if (+consecutiveFrames === consecutiveFrames) {
        return consecutiveFrames;
      }

      let sequence = [];
      let frames = consecutiveFrames.split('..');

      // coerce string to number
      // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
      let start = i = +frames[0];
      let end = +frames[1];

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
  }

  /**
   * Create a sprite sheet from an image.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the sprite sheet.
   * @param {Image|Canvas} properties.image - Image for the sprite sheet.
   * @param {number} properties.frameWidth - Width (in px) of each frame.
   * @param {number} properties.frameHeight - Height (in px) of each frame.
   * @param {number} properties.frameMargin - Margin (in px) between each frame.
   * @param {object} properties.animations - Animations to create from the sprite sheet.
   */
  kontra.spriteSheet = function(properties) {
    return new SpriteSheet(properties);
  };
  kontra.spriteSheet.prototype = SpriteSheet.prototype;
})();
/**
 * Object for using localStorage.
 */
kontra.store = {

  /**
   * Save an item to localStorage.
   * @memberof kontra.store
   *
   * @param {string} key - Name to store the item as.
   * @param {*} value - Item to store.
   */
  set(key, value) {
    if (value === undefined) {
      localStorage.removeItem(key);
    }
    else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  /**
   * Retrieve an item from localStorage and convert it back to it's original type.
   * @memberof kontra.store
   *
   * @param {string} key - Name of the item.
   *
   * @returns {*}
   */
  get(key) {
    let value = localStorage.getItem(key);

    try {
      value = JSON.parse(value);
    }
    catch(e) {}

    return value;
  }
};
(function() {
  // save Math.min and Math.max to variable and use that instead

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberof kontra
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
  kontra.tileEngine = function(properties) {
    properties = properties || {};

    // size of the map (in tiles)
    // @if DEBUG
    if (!properties.width || !properties.height) {
      throw Error('You must provide width and height properties');
    }
    // @endif

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
    function getIndex(position) {
      let row, col;

      if (typeof position.x !== 'undefined' && typeof position.y !== 'undefined') {
        row = tileEngine.getRow(position.y);
        col = tileEngine.getCol(position.x);
      }
      else {
        row = position.row;
        col = position.col;
      }

      // don't calculate out of bound numbers
      if (row < 0 || col < 0 || row >= height || col >= width) {
        return -1;
      }

      return col + row * width;
    }

    /**
     * Modified binary search that will return the tileset associated with the tile
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} tile - Tile grid.
     *
     * @return {object}
     */
    function getTileset(tile) {
      let min = 0;
      let max = tileEngine.tilesets.length - 1;
      let index, currTile;

      while (min <= max) {
        index = (min + max) / 2 | 0;
        currTile = tileEngine.tilesets[index];

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
    }

    /**
     * Pre-render the tiles to make drawing fast.
     * @memberof kontra.tileEngine
     * @private
     */
    function preRenderImage() {
      let tile, tileset, image, x, y, sx, sy, tileOffset, w;

      // draw each layer in order
      for (let i = 0, layer; layer = tileEngine.layers[layerOrder[i]]; i++) {
        for (let j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          tileset = getTileset(tile);
          image = tileset.image;

          x = (j % width) * tileWidth;
          y = (j / width | 0) * tileHeight;

          tileOffset = tile - tileset.firstGrid;
          w = image.width / tileWidth;

          sx = (tileOffset % w) * tileWidth;
          sy = (tileOffset / w | 0) * tileHeight;

          offscreenContext.drawImage(
            image,
            sx, sy, tileWidth, tileHeight,
            x, y, tileWidth, tileHeight
          );
        }
      }
    }

    let width = properties.width;
    let height = properties.height;

    // size of the tiles. Most common tile size on opengameart.org seems to be 32x32,
    // followed by 16x16
    // Tiled names the property tilewidth and tileheight
    let tileWidth = properties.tileWidth || properties.tilewidth || 32;
    let tileHeight = properties.tileHeight || properties.tileheight || 32;

    let mapWidth = width * tileWidth;
    let mapHeight = height * tileHeight;

    let context = properties.context || kontra.context;
    let canvasWidth = context.canvas.width;
    let canvasHeight = context.canvas.height;

    // create an off-screen canvas for pre-rendering the map
    // @see http://jsperf.com/render-vs-prerender
    let offscreenCanvas = document.createElement('canvas');
    let offscreenContext = offscreenCanvas.getContext('2d');

    // when clipping an image, sx and sy must within the image region, otherwise
    // Firefox and Safari won't draw it.
    // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
    let sxMax = Math.max(0, mapWidth - canvasWidth);
    let syMax = Math.max(0, mapHeight - canvasHeight);

    let _sx, _sy;

    // draw order of layers (by name)
    let layerOrder = [];

    let tileEngine = {
      width: width,
      height: height,

      tileWidth: tileWidth,
      tileHeight: tileHeight,

      mapWidth: mapWidth,
      mapHeight: mapHeight,

      context: context,

      x: properties.x || 0,
      y: properties.y || 0,

      tilesets: [],
      layers: {},

      /**
       * Add an tileset for the tile engine to use.
       * @memberof kontra.tileEngine
       *
       * @param {object|object[]} tileset - Properties of the image to add.
       * @param {Image|Canvas} tileset.image - Path to the image or Image object.
       * @param {number} tileset.firstGrid - The first tile grid to start the image.
       */
      addTilesets: function addTilesets(tilesets) {
        [].concat(tilesets).map(function(tileset) {
          let tilesetImage = tileset.image;
          let image, firstGrid, numTiles, lastTileset, tiles;

          // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
          if (''+tilesetImage === tilesetImage) {
            let i = Infinity;

            while (i >= 0) {
              i = tilesetImage.lastIndexOf('/', i);
              let path = (i < 0 ? tilesetImage : tilesetImage.substr(i));

              if (kontra.assets.images[path]) {
                image = kontra.assets.images[path];
                break;
              }

              i--;
            }
          }
          else {
            image = tilesetImage;
          }

          firstGrid = tileset.firstGrid;

          // if the width or height of the provided image is smaller than the tile size,
          // default calculation to 1
          numTiles = ( (image.width / tileWidth | 0) || 1 ) *
                     ( (image.height / tileHeight | 0) || 1 );

          if (!firstGrid) {
            // only calculate the first grid if the tile map has a tileset already
            if (tileEngine.tilesets.length > 0) {
              lastTileset = tileEngine.tilesets[tileEngine.tilesets.length - 1];
              tiles = (lastTileset.image.width / tileWidth | 0) *
                      (lastTileset.image.height / tileHeight | 0);

              firstGrid = lastTileset.firstGrid + tiles;
            }
            // otherwise this is the first tile added to the tile map
            else {
              firstGrid = 1;
            }
          }

          tileEngine.tilesets.push({
            firstGrid: firstGrid,
            lastGrid: firstGrid + numTiles - 1,
            image: image
          });

          // sort the tile map so we can perform a binary search when drawing
          tileEngine.tilesets.sort(function(a, b) {
            return a.firstGrid - b.firstGrid;
          });
        });
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
        [].concat(layers).map(function(layer) {
          layer.render = (layer.render === undefined ? true : layer.render);

          let data, r, row, c, prop, value;

          // flatten a 2D array into a single array
          if (Array.isArray(layer.data[0])) {
            data = [];

            for (r = 0; row = layer.data[r]; r++) {
              for (c = 0; c < width; c++) {
                data.push(row[c] || 0);
              }
            }
          }
          else {
            data = layer.data;
          }

          tileEngine.layers[layer.name] = {
            data: data,
            zIndex: layer.zIndex || 0,
            render: layer.render
          };

          // merge properties of layer onto layer object
          for (prop in layer.properties) {
            value = layer.properties[prop];

            try {
              value = JSON.parse(value);
            }
            catch(e) {}

            tileEngine.layers[layer.name][prop] = value;
          }

          // only add the layer to the layer order if it should be drawn
          if (tileEngine.layers[layer.name].render) {
            layerOrder.push(layer.name);

            layerOrder.sort(function(a, b) {
              return tileEngine.layers[a].zIndex - tileEngine.layers[b].zIndex;
            });

          }
        });

        preRenderImage();
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
        let row = tileEngine.getRow(object.y);
        let col = tileEngine.getCol(object.x);

        let endRow = tileEngine.getRow(object.y + object.height);
        let endCol = tileEngine.getCol(object.x + object.width);

        // check all tiles
        let index;
        for (let r = row; r <= endRow; r++) {
          for (let c = col; c <= endCol; c++) {
            index = getIndex({row: r, col: c});

            if (tileEngine.layers[name].data[index]) {
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
        let index = getIndex(position);

        if (index >= 0) {
          return tileEngine.layers[name].data[index];
        }
      },

      /**
       * Render the pre-rendered canvas.
       * @memberof kontra.tileEngine
       */
      render: function render() {
        /* istanbul ignore next */
        tileEngine.context.drawImage(
          offscreenCanvas,
          tileEngine.sx, tileEngine.sy, canvasWidth, canvasHeight,
          tileEngine.x, tileEngine.y, canvasWidth, canvasHeight
        );
      },

      /**
       * Render a specific layer.
       * @memberof kontra.tileEngine
       *
       * @param {string} name - Name of the layer to render.
       */
      renderLayer: function renderLayer(name) {
        let layer = tileEngine.layers[name];

        // calculate the starting tile
        let row = tileEngine.getRow();
        let col = tileEngine.getCol();
        let index = getIndex({row: row, col: col});

        // calculate where to start drawing the tile relative to the drawing canvas
        let startX = col * tileWidth - tileEngine.sx;
        let startY = row * tileHeight - tileEngine.sy;

        // calculate how many tiles the drawing canvas can hold
        let viewWidth = Math.min(Math.ceil(canvasWidth / tileWidth) + 1, width);
        let viewHeight = Math.min(Math.ceil(canvasHeight / tileHeight) + 1, height);
        let numTiles = viewWidth * viewHeight;

        let count = 0;
        let x, y, tile, tileset, image, tileOffset, w, sx, sy;

        // draw just enough of the layer to fit inside the drawing canvas
        while (count < numTiles) {
          tile = layer.data[index];

          if (tile) {
            tileset = getTileset(tile);
            image = tileset.image;

            x = startX + (count % viewWidth) * tileWidth;
            y = startY + (count / viewWidth | 0) * tileHeight;

            tileOffset = tile - tileset.firstGrid;
            w = image.width / tileWidth;

            sx = (tileOffset % w) * tileWidth;
            sy = (tileOffset / w | 0) * tileHeight;

            tileEngine.context.drawImage(
              image,
              sx, sy, tileWidth, tileHeight,
              x, y, tileWidth, tileHeight
            );
          }

          if (++count % viewWidth === 0) {
            index = col + (++row * width);
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

        return (tileEngine.sy + y) / tileHeight | 0;
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

        return (tileEngine.sx + x) / tileWidth | 0;
      },

      get sx() {
        return _sx;
      },

      get sy() {
        return _sy;
      },

      // ensure sx and sy are within the image region
      set sx(value) {
        _sx = Math.min( Math.max(0, value), sxMax );
      },

      set sy(value) {
        _sy = Math.min( Math.max(0, value), syMax );
      },

      // expose properties for testing
      // @if DEBUG
      _layerOrder: layerOrder
      // @endif
    };

    // set here so we use setter function
    tileEngine.sx = properties.sx || 0;
    tileEngine.sy = properties.sy || 0;

    // make the off-screen canvas the full size of the map
    offscreenCanvas.width = mapWidth;
    offscreenCanvas.height = mapHeight;

    // merge properties of the tile engine onto the tile engine itself
    for (let prop in properties.properties) {
      let value = properties.properties[prop];

      try {
        value = JSON.parse(value);
      }
      catch(e) {}

      // passed in properties override properties.properties
      tileEngine[prop] = tileEngine[prop] || value;
    }

    if (properties.tilesets) {
      tileEngine.addTilesets(properties.tilesets);
    }

    if (properties.layers) {
      tileEngine.addLayers(properties.layers);
    }

    return tileEngine;
  };
})();