var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2d space.
   * @memberOf kontra
   *
   * @see kontra.vector._proto.set for list of params
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
    set: function(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    },

    /**
     * Add a vector to this vector.
     * @memberOf kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt - Time since last update.
     */
    add: function(vector, dt) {
      this.x += vector.x * (dt || 1);
      this.y += vector.y * (dt || 1);
    },

    /**
     * Get the length of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    length: function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Get the angle of the vector.
     * @memberOf kontra.vector
     *
     * @returns {number}
     */
    angle: function() {
      return Math.atan2(this.y, this.x);
    },

    /**
     * Get a new vector from an angle and magnitude
     * @memberOf kontra.vector
     *
     * @returns {vector}
     */
    fromAngle: function(angle, magnitude) {
      return vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   * @requires kontra.vector
   *
   * @see kontra.sprite._prot.set for list of params
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
     * @memberOf kontra.Sprite
     *
     * @param {number} dt - Time since last update.
     */
    advance: function(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Draw the sprite.
     * @memberOf kontra.Sprite
     */
    draw: function() {
      this.context.drawImage(this.image, this.position.x, this.position.y);
    },

    /**
     * Determine if the sprite is alive.
     * @memberOf kontra.Sprite
     *
     * @returns {boolean}
     */
    isAlive: function() {
      return this.timeToLive > 0;
    },

    /**
     * Set properties on the sprite.
     * @memberOf kontra.Sprite
     *
     * @param {object} properties - Properties to set on the sprite.
     * @param {number} properties.x - X coordinate of the sprite.
     * @param {number} properties.y - Y coordinate of the sprite.
     * @param {number} [properties.dx] - Change in X position.
     * @param {number} [properties.dy] - Change in Y position.
     * @param {number} [properties.ddx] - Change in X velocity.
     * @param {number} [properties.ddy] - Change in Y velocity.
     * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
     * @param {Image|Canvas} [properties.image] - Image for the sprite.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     * @param {function} [properties.update] - Function to use to update the sprite.
     * @param {function} [properties.render] - Function to use to render the sprite.
     *
     * If you need the sprite to live forever, or just need it to stay on screen until you
     * decide when to kill it, you can set time to live to <code>Infinity</code>. Just be
     * sure to override the <code>isAlive()</code> function to return true when the sprite
     * should die.
     *
     * @returns {Sprite}
     */
    set: function(properties) {
      properties = properties || {};

      this.position.set(properties.x, properties.y);
      this.velocity.set(properties.dx, properties.dy);
      this.acceleration.set(properties.ddx, properties.ddy);
      this.timeToLive = properties.timeToLive || 0;

      this.context = properties.context || kontra.context;

      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        this.image = properties.image;
        this.width = properties.image.width;
        this.height = properties.image.height;
      }
      else {
        // make the render function for this sprite a noop since there is no image to draw.
        // this.render/this.draw should be overridden if you want to draw something else.
        this.render = kontra.noop;
      }

      if (properties.update) {
        this.update = properties.update;
      }

      if (properties.render) {
        this.render = properties.render;
      }
    },

    /**
     * Update the sprites velocity and position.
     * @memberOf kontra.Sprite
     * @abstract
     *
     * @param {number} dt - Time since last update.
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the update step. Just call <code>this.advance()</code> when you need
     * the sprite to update its position.
     *
     * @example
     * sprite = new kontra.Sprite({
     *   update: function update(dt) {
     *     // do some logic
     *
     *     this.advance(dt);
     *   }
     * });
     *
     * @returns {Sprite}
     */
    update: function(dt) {
      this.advance(dt);
    },

    /**
     * Render the sprite.
     * @memberOf kontra.Sprite.
     * @abstract
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the render step. Just call <code>this.draw()</code> when you need the
     * sprite to draw its image.
     *
     * @example
     * sprite = new kontra.Sprite({
     *   render: function render() {
     *     // do some logic
     *
     *     this.draw();
     *   }
     * });
     *
     * @returns {Sprite}
     */
    render: function() {
      this.draw();
    }
  };

  return kontra;
})(kontra || {}, Math);