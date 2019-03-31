(function () {
  'use strict';

  // expose for testing
  let callbacks = {};

  /**
   * Call all callback functions for the event.
   *
   * @param {string} event - Name of the event
   * @param {...*} args - Arguments passed to all callbacks
   */
  function emit(event, ...args) {
    if (!callbacks[event]) return;
    callbacks[event].map(fn => fn(...args));
  }

  let canvasEl, context;

  /**
   * Return the canvas object.
   *
   * @returns {HTMLCanvasElement}
   */
  function getCanvas() {
    return canvasEl;
  }

  /**
   * Return the context object.
   *
   * @returns {CanvasRenderingContext2D}
   */
  function getContext() {
    return context;
  }

  /**
   * Initialize the canvas.
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
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
   * Game loop that updates and renders the game every frame.
   *
   * @param {object}   properties - Properties of the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.render - Function called to render the game.
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
      update,
      render,
      isStopped: true,

      /**
       * Start the game loop.
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

  let callbacks$1 = {};
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

  /**
   * Execute a function that corresponds to a keyboard key.
   *
   * @param {KeyboardEvent} evt
   */
  function keydownEventHandler(evt) {
    let key = keyMap[evt.which];
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
    pressedKeys[ keyMap[evt.which] ] = false;
  }

  /**
   * Reset pressed keys.
   */
  function blurEventHandler() {
    pressedKeys = {};
  }

  /**
   * Add keyboard event listeners.
   */
  function initKeys() {
    let i;

    // alpha keys
    // @see https://stackoverflow.com/a/43095772/2124254
    for (i = 0; i < 26; i++) {
      // rollupjs considers this a side-effect (for now), so we'll do it in the
      // initKeys function
      // @see https://twitter.com/lukastaegert/status/1107011988515893249?s=20
      keyMap[65+i] = (10 + i).toString(36);
    }

    // numeric keys
    for (i = 0; i < 10; i++) {
      keyMap[48+i] = ''+i;
    }

    window.addEventListener('keydown', keydownEventHandler);
    window.addEventListener('keyup', keyupEventHandler);
    window.addEventListener('blur', blurEventHandler);
  }

  /**
   * Returns whether a key is pressed.
   *
   * @param {string} key - Key to check for press.
   *
   * @returns {boolean}
   */
  function keyPressed(key) {
    return !!pressedKeys[key];
  }

  /**
   * Get the kontra object method name from the plugin.
   *
   * @param {string} methodName - Before/After function name
   *
   * @returns {string}
   */

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
     * @param {vec} vector - Vector to add.
     * @param {number} dt=1 - Time since last update.
     *
     * @returns {vector}
     */
    add(vec, dt) {
      return vectorFactory(
        this.x + (vec.x || 0) * (dt || 1),
        this.y + (vec.y || 0) * (dt || 1)
      );
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

  function vectorFactory(x, y) {
    return new Vector(x, y);
  }
  vectorFactory.prototype = Vector.prototype;

  class Sprite {

    constructor(properties) {
      this.init(properties);
    }

    /**
     * Initialize properties on the sprite.
     *
     * @param {object} properties - Properties of the sprite.
     * @param {number} properties.x - X coordinate of the sprite.
     * @param {number} properties.y - Y coordinate of the sprite.
     * @param {number} [properties.dx] - Change in X position.
     * @param {number} [properties.dy] - Change in Y position.
     * @param {number} [properties.ddx] - Change in X velocity.
     * @param {number} [properties.ddy] - Change in Y velocity.
     *
     * @param {number} [properties.ttl=Infinity] - How may frames the sprite should be alive.
     * @param {number} [properties.rotation=0] - Rotation in radians of the sprite.
     * @param {number} [properties.anchor={x:0,y:0}] - The x and y origin of the sprite. {0,0} is the top left corner of the sprite, {1,1} is the bottom right corner.
     * @param {Context} [properties.context=context] - Provide a context for the sprite to draw on.
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
    init(properties = {}) {
      let { x, y, dx, dy, ddx, ddy, width, height, image } = properties;
      this.position = vectorFactory(x, y);
      this.velocity = vectorFactory(dx, dy);
      this.acceleration = vectorFactory(ddx, ddy);

      // defaults
      this.width = this.height = this.rotation = 0;
      this.ttl = Infinity;
      this.anchor = {x: 0, y: 0};
      this.context = getContext();

      // add all properties to the sprite, overriding any defaults
      for (let prop in properties) {
        this[prop] = properties[prop];
      }

      // image sprite
      if (image) {
        this.width = (width !== undefined) ? width : image.width;
        this.height = (height !== undefined) ? height : image.height;
      }
    }

    // define getter and setter shortcut functions to make it easier to work with the
    // position, velocity, and acceleration vectors.

    /**
     * Sprite position.x
     *
     * @property {number} x
     */
    get x() {
      return this.position.x;
    }

    /**
     * Sprite position.y
     *
     * @property {number} y
     */
    get y() {
      return this.position.y;
    }

    /**
     * Sprite velocity.x
     *
     * @property {number} dx
     */
    get dx() {
      return this.velocity.x;
    }

    /**
     * Sprite velocity.y
     *
     * @property {number} dy
     */
    get dy() {
      return this.velocity.y;
    }

    /**
     * Sprite acceleration.x
     *
     * @property {number} ddx
     */
    get ddx() {
      return this.acceleration.x;
    }

    /**
     * Sprite acceleration.y
     *
     * @property {number} ddy
     */
    get ddy() {
      return this.acceleration.y;
    }

    get animations() {
      return this._a;
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

      this.currentAnimation = firstAnimation;
      this.width = this.width || firstAnimation.width;
      this.height = this.height || firstAnimation.height;
    }

    /**
     * Determine if the sprite is alive.
     *
     * @returns {boolean}
     */
    isAlive() {
      return this.ttl > 0;
    }

    /**
     * Simple bounding box collision test.
     * NOTE: Does not take into account sprite rotation. If you need collision
     * detection between rotated sprites you will need to implement your own
     * CollidesWith() function. I suggest looking at the Separate Axis Theorem.
     *
     * @param {object} object - Object to check collision against.
     *
     * @returns {boolean|null} True if the objects collide, false otherwise.
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
     * Update the sprites velocity and position.
     * @abstract
     *
     * @param {number} dt - Time since last update.
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the update step. Just call <code>this.advance()</code> when you need
     * the sprite to update its position.
     *
     * @example
     * sprite = sprite({
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
     * Render the sprite..
     * @abstract
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the render step. Just call <code>this.draw()</code> when you need the
     * sprite to draw its image.
     *
     * @example
     * sprite = sprite({
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
     *
     * @param {string} name - Name of the animation to play.
     */
    playAnimation(name) {
      this.currentAnimation = this.animations[name];

      if (!this.currentAnimation.loop) {
        this.currentAnimation.reset();
      }
    }

    /**
     * Advance the sprites position, velocity, and current animation (if it
     * has one).
     *
     * @param {number} dt - Time since last update.
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
     * Draw the sprite to the canvas.
     */
    draw() {
      let anchorWidth = -this.width * this.anchor.x;
      let anchorHeight = -this.height * this.anchor.y;

      this.context.save();
      this.context.translate(this.x, this.y);

      if (this.rotation) {
        this.context.rotate(this.rotation);
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

  /**
   * Save an item to localStorage.
   *
   * @param {string} key - Name to store the item as.
   * @param {*} value - Item to store.
   */

  let { canvas } = init(); // initialize kontra
  initKeys();

  let sprite = spriteFactory({
    x: 100,
    y: 80,
    color: 'red',
    width: 20,
    height: 40,
    dx: 2
  });

  let loop = GameLoop({
    update: function() {
     if (keyPressed('left')) {
       sprite.dx = -2;
     }
     else if (keyPressed('right')) {
       sprite.dx = 2;
     }

      sprite.update();
      if (sprite.x > canvas.width) {
        sprite.x = -sprite.width;
      }
      if (sprite.x < -sprite.width) {
        sprite.x = canvas.width;
      }
    },
    render: function() {
      sprite.render();
    }
  });

  loop.start();

}());
