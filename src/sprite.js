var kontra = (function(kontra, Math, undefined) {
  'use strict';

  // prevent these properties from being set at the end of kontra.sprite.set()
  var excludedProperties = [
    'x',
    'y',
    'dx',
    'dy',
    'ddx',
    'ddy',
    'timeToLive',
    'context',
    'image',
    'animations',
    'color',
    'width',
    'height'
  ];

  /**
   * A vector for 2D space.
   * @memberof kontra
   *
   * @see kontra.vector.prototype.set for list of parameters.
   */
  kontra.vector = function(x, y) {
    var vector = Object.create(kontra.vector.prototype);
    vector.set(x, y);

    return vector;
  };

  kontra.vector.prototype = {
    /**
     * Set the vectors x and y position.
     * @memberof kontra.vector
     *
     * @param {number} x=0 - Center x coordinate.
     * @param {number} y=0 - Center y coordinate.
     *
     * @returns {vector}
     */
    set: function set(x, y) {
      this.x = x || 0;
      this.y = y || 0;

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
   * @see kontra.sprite._prot.set for list of parameters.
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite.prototype);
    sprite.set(properties);

    return sprite;
  };

  kontra.sprite.prototype = {
    /**
     * Move the sprite by its velocity.
     * @memberof kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advanceSprite: function advanceSprite(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Draw a simple rectangle. Useful for prototyping.
     * @memberof kontra.sprite
     */
    drawRect: function drawRect() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    },

    /**
     * Draw the sprite.
     * @memberof kontra.sprite
     */
    drawImage: function drawImage() {
      this.context.drawImage(this.image, this.position.x, this.position.y);
    },

    /**
     * Update the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advanceAnimation: function advanceAnimation(dt) {
      this.advanceSprite(dt);

      this.currentAnimation.update(dt);
    },

    /**
     * Draw the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     */
    drawAnimation: function drawAnimation() {
      this.currentAnimation.render({
        context: this.context,
        x: this.position.x,
        y: this.position.y
      });
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
     * Determine if the sprite is alive.
     * @memberof kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive: function isAlive() {
      return this.timeToLive > 0;
    },

    /**
     * Set properties on the sprite.
     * @memberof kontra.sprite
     *
     * @param {object} properties - Properties to set on the sprite.
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
    set: function set(properties) {
      properties = properties || {};

      var _this = this;

      _this.position = (_this.position || kontra.vector()).set(properties.x, properties.y);
      _this.velocity = (_this.velocity || kontra.vector()).set(properties.dx, properties.dy);
      _this.acceleration = (_this.acceleration || kontra.vector()).set(properties.ddx, properties.ddy);

      _this.timeToLive = properties.timeToLive || 0;
      _this.context = properties.context || kontra.context;

      // image sprite
      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        _this.image = properties.image;
        _this.width = properties.image.width;
        _this.height = properties.image.height;

        // change the advance and draw functions to work with images
        _this.advance = _this.advanceSprite;
        _this.draw = _this.drawImage;
      }
      // animation sprite
      else if (properties.animations) {
        _this.animations = properties.animations;

        // default the current animation to the first one in the list
        _this.currentAnimation = properties.animations[ Object.keys(properties.animations)[0] ];
        _this.width = _this.currentAnimation.width;
        _this.height = _this.currentAnimation.height;

        // change the advance and draw functions to work with animations
        _this.advance = _this.advanceAnimation;
        _this.draw = _this.drawAnimation;
      }
      // rectangle sprite
      else {
        _this.color = properties.color;
        _this.width = properties.width;
        _this.height = properties.height;

        // change the advance and draw functions to work with rectangles
        _this.advance = _this.advanceSprite;
        _this.draw = _this.drawRect;
      }

      // loop through all other properties an add them to the sprite
      for (var prop in properties) {
        if (properties.hasOwnProperty(prop) && excludedProperties.indexOf(prop) === -1) {
          _this[prop] = properties[prop];
        }
      }
    },

    // define getter and setter shortcut functions to make it easier to work work with the
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
     * Simple bounding box collision test.
     * @memberof kontra.sprite
     *
     * @param {object} object - Object to check collision against.
     *
     * @returns {boolean} True if the objects collide, false otherwise.
     */
    collidesWith: function collidesWith(object) {
      // handle non-kontra.sprite objects as well as kontra.sprite objects
      var x = (object.x !== undefined ? object.x : object.position.x);
      var y = (object.y !== undefined ? object.y : object.position.y);

      if (this.position.x < x + object.width &&
          this.position.x + this.width > x &&
          this.position.y < y + object.height &&
          this.position.y + this.height > y) {
        return true;
      }

      return false;
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
    }
  };

  return kontra;
})(kontra || {}, Math);