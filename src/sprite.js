var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2D space.
   * @memberof kontra
   *
   * @see kontra.vector.prototype.init for list of parameters.
   */
  kontra.vector = function(properties) {
    var vector = Object.create(kontra.vector.prototype);
    vector.init(properties);

    return vector;
  };

  kontra.vector.prototype = {
    /**
     * Initialize the vectors x and y position.
     * @memberof kontra.vector
     *
     * @param {object} properties - Properties of the vector.
     * @param {number} properties.x=0 - X coordinate.
     * @param {number} properties.y=0 - Y coordinate.
     *
     * @returns {vector}
     */
    init: function init(properties) {
      properties = properties || {};

      this.x = properties.x || 0;
      this.y = properties.y || 0;

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
   * @see kontra.sprite.prototype.init for list of parameters.
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite.prototype);
    sprite.init(properties);

    return sprite;
  };

  kontra.sprite.prototype = {
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
    init: function init(properties) {
      properties = properties || {};

      this.position = (this.position || kontra.vector()).init({
        x: properties.x,
        y: properties.y
      });
      this.velocity = (this.velocity || kontra.vector()).init({
        x: properties.dx,
        y: properties.dy
      });
      this.acceleration = (this.acceleration || kontra.vector()).init({
        x: properties.ddx,
        y: properties.ddy
      });

      // loop through properties before overrides
      for (var prop in properties) {
        if (!properties.hasOwnProperty(prop)) {
          continue;
        }

        this[prop] = properties[prop];
      }

      this.timeToLive = properties.timeToLive || 0;
      this.context = properties.context || kontra.context;

      // image sprite
      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        this.image = properties.image;
        this.width = properties.image.width;
        this.height = properties.image.height;

        // change the advance and draw functions to work with images
        this.advance = this._advanceSprite;
        this.draw = this._drawImage;
      }
      // animation sprite
      else if (properties.animations) {
        this.animations = properties.animations;

        // default the current animation to the first one in the list
        this.currentAnimation = properties.animations[ Object.keys(properties.animations)[0] ];
        this.width = this.currentAnimation.width;
        this.height = this.currentAnimation.height;

        // change the advance and draw functions to work with animations
        this.advance = this._advanceAnimation;
        this.draw = this._drawAnimation;
      }
      // rectangle sprite
      else {
        this.color = properties.color;
        this.width = properties.width;
        this.height = properties.height;

        // change the advance and draw functions to work with rectangles
        this.advance = this._advanceSprite;
        this.draw = this._drawRect;
      }
    },

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
     * Determine if the sprite is alive.
     * @memberof kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive: function isAlive() {
      return this.timeToLive > 0;
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
      return this.x < object.x + object.width &&
             this.x + this.width > object.x &&
             this.y < object.y + object.height &&
             this.y + this.height > object.y;
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
     * Move the sprite by its velocity.
     * @memberof kontra.sprite
     * @private
     *
     * @param {number} dt - Time since last update.
     */
    _advanceSprite: function advanceSprite(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Update the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     * @private
     *
     * @param {number} dt - Time since last update.
     */
    _advanceAnimation: function advanceAnimation(dt) {
      this._advanceSprite(dt);

      this.currentAnimation.update(dt);
    },

    /**
     * Draw a simple rectangle. Useful for prototyping.
     * @memberof kontra.sprite
     * @private
     */
    _drawRect: function drawRect() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x, this.y, this.width, this.height);
    },

    /**
     * Draw the sprite.
     * @memberof kontra.sprite
     * @private
     */
    _drawImage: function drawImage() {
      this.context.drawImage(this.image, this.x, this.y);
    },

    /**
     * Draw the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     * @private
     */
    _drawAnimation: function drawAnimation() {
      this.currentAnimation.render({
        context: this.context,
        x: this.x,
        y: this.y
      });
    },
  };

  return kontra;
})(kontra || {}, Math);