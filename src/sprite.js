var kontra = (function(kontra, Math, undefined) {
  'use strict';

  kontra.Vector = Vector;
  kontra.Sprite = Sprite;

  /**
   * A vector for 2d space.
   * @memberOf kontra
   * @constructor
   *
   * @param {number} x=0 - Center x coordinate.
   * @param {number} y=0 - Center y coordinate.
   */
  function Vector(x, y) {
    this.set(x, y);
  }

  /**
   * Set the vector's x and y position.
   * @memberOf kontra.Vector
   *
   * @param {number} x - Center x coordinate.
   * @param {number} y - Center y coordinate.
   */
  Vector.prototype.set = function VecotrSet(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };

  /**
   * Add a vector to this vector.
   * @memberOf kontra.Vector
   *
   * @param {Vector} vector - Vector to add.
   */
  Vector.prototype.add = function VectorAdd(vector) {
    this.x += vector.x;
    this.y += vector.y;
  };

  /**
   * Get the length of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.length = function VecotrLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  /**
   * Get the angle of the vector.
   * @memberOf kontra.Vector
   *
   * @returns {number}
   */
  Vector.prototype.angle = function VectorAnagle() {
    return Math.atan2(this.y, this.x);
  };

  /**
   * Get a new vector from an angle and magnitude
   * @memberOf kontra.Vector
   *
   * @returns {Vector}
   */
  Vector.prototype.fromAngle = function VectorFromAngle(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   * @requires kontra.Vector
   *
   * @param @see this.set for list of available parameters.
   */
  function Sprite(properties) {
    this.position = new kontra.Vector();
    this.velocity = new kontra.Vector();
    this.acceleration = new kontra.Vector();
    this.timeToLive = 0;
    this.context = kontra.context;

    if (properties) {
      this.set(properties);
    }
  }

  /**
   * Move the sprite by its velocity.
   * @memberOf kontra.Sprite
   *
   * @param {number} dt - Time since last update.
   */
  Sprite.prototype.advance = function SpriteAdvance(dt) {
    this.velocity.add(this.acceleration * dt);
    this.position.add(this.velocity * dt);

    this.timeToLive--;
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite
   */
  Sprite.prototype.draw = function SpriteRender() {
    this.context.drawImage(this.image, this.position.x, this.position.y);
  };

  /**
   * Determine if the sprite is alive.
   * @memberOf kontra.Sprite
   *
   * @returns {boolean}
   */
  Sprite.prototype.isAlive = function SpriteIsAlive() {
    return this.timeToLive > 0;
  };

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
  Sprite.prototype.set = function SpriteSet(properties) {
    properties = properties || {};

    this.position.set(properties.x, properties.y);
    this.velocity.set(properties.dx, properties.dy);
    this.acceleration.set(properties.ddx, properties.ddy);
    this.timeToLive = properties.timeToLive || 0;

    this.context = properties.context || this.context;

    if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
      this.image = properties.image;
      this.width = this.image.width;
      this.height = this.image.height;
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
  };

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
  Sprite.prototype.update = function SpriteUpdate(dt) {
    this.advance(dt);
  };

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
  Sprite.prototype.render = function SpriteDraw() {
    this.render();
  };

  return kontra;
})(kontra || {}, Math);