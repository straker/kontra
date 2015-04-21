var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2D space.
   * @memberOf kontra
   *
   * @see kontra.vector._proto.set for list of parameters.
   */
  kontra.vector = function(x, y) {
    var vector = Object.create(kontra.vector._proto);
    vector.set(x, y);

    return vector;
  };

  kontra.vector._proto = {
    /**
     * Set the vector's x and y position.
     * @memberOf kontra.vector
     *
     * @param {number} x=0 - Center x coordinate.
     * @param {number} y=0 - Center y coordinate.
     */
    set: function set(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    },

    /**
     * Add a vector to this vector.
     * @memberOf kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt=1 - Time since last update.
     */
    add: function add(vector, dt) {
      this.x += vector.x * (dt || 1);
      this.y += vector.y * (dt || 1);
    },

    /**
     * Get the length of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    length: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Get the angle of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    angle: function angle() {
      return Math.atan2(this.y, this.x);
    },

    /**
     * Get a new vector from an angle and magnitude
     * @memberOf kontra.vector
     *
     * @returns {vector}
     */
    fromAngle: function fromAngle(angle, magnitude) {
      return vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @requires kontra.vector
   *
   * @see kontra.sprite._prot.set for list of parameters.
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite._proto);
    sprite.position = kontra.vector();
    sprite.velocity = kontra.vector();
    sprite.acceleration = kontra.vector();
    sprite.set(properties);

    return sprite;
  };

  kontra.sprite._proto = {
    /**
     * Move the sprite by its velocity.
     * @memberOf kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advance: function advance(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.updateAnimation(dt);

      this.timeToLive--;
    },

    /**
     * Draw the sprite.
     * @memberOf kontra.sprite
     */
    draw: function draw() {
      this.context.drawImage(this.image, this.position.x, this.position.y);
    },

    /**
     * Draw a simple rectangle. Useful for prototyping.
     * @memberOf kontra.sprite
     */
    drawRect: function drawRect() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    },

    /**
     * Play an animation.
     * @memberOf kontra.sprite
     *
     * @param {string} name - Name of the animation to play.
     */
    playAnimation: function playAnimation(name) {
      this.currentAnimation = this.animations[name];
    },

    /**
     * Update the currently playing animation. Used when animations are passed to the sprite.
     * @memberOf kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advanceAnimation: function advanceAnimation(dt) {
      this.currentAnimation.update(dt);
    },

    /**
     * Draw the currently playing animation. Used when animations are passed to the sprite.
     * @memberOf kontra.sprite
     */
    drawAnimation: function drawAnimation() {
      this.currentAnimation.render({
        context: this.context,
        x: this.position.x,
        y: this.position.y
      });
    },

    /**
     * Determine if the sprite is alive.
     * @memberOf kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive: function isAlive() {
      return this.timeToLive > 0;
    },

    /**
     * Set properties on the sprite.
     * @memberOf kontra.sprite
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
     * decide when to kill it, you can set time to live to <code>Infinity</code>. Just be
     * sure to override the <code>isAlive()</code> function to return true when the sprite
     * should die.
     */
    set: function set(properties) {
      properties = properties || {};

      var _this = this;

      _this.position.set(properties.x, properties.y);
      _this.velocity.set(properties.dx, properties.dy);
      _this.acceleration.set(properties.ddx, properties.ddy);
      _this.timeToLive = properties.timeToLive || 0;

      _this.context = properties.context || kontra.context;

      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        _this.image = properties.image;
        _this.width = properties.image.width;
        _this.height = properties.image.height;

        // change update and render functions to work with images
        _this.render = _this.draw;
        _this.updateAnimation = kontra.noop;
      }
      else if (properties.animations) {
        _this.animations = properties.animations;

        // default the current animation to the first one in the list
        _this.currentAnimation = Object.keys(properties.animations)[0];
        _this.width = _this.currentAnimation.width;
        _this.height = _this.currentAnimation.height;

        // change update and render functions to work with animations
        _this.render = _this.drawAnimation;
        _this.updateAnimation = _this.advanceAnimation;
      }
      else {
        _this.color = properties.color;
        _this.width = properties.width;
        _this.height = properties.height;

        // make the render function for a noop since there is no image to draw.
        // this.render should be overridden if you want to draw something else (like a box).
        _this.render = _this.drawRect;
        _this.updateAnimation = kontra.noop;
      }

      if (properties.update) {
        _this.update = properties.update;
      }

      if (properties.render) {
        _this.render = properties.render;
      }
    },

    /**
     * Simple bounding box collision test.
     * @memberOf kontra.sprite
     *
     * @param {object} obj - Object to check collision against.
     */


    /**
     * Update the sprites velocity and position.
     * @memberOf kontra.sprite
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
     * @memberOf kontra.sprite.
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