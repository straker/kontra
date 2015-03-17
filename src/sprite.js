var kontra = (function(kontra, undefined) {
  kontra.Sprite = Sprite;

  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   * @requires kontra.Vector
   */
  function Sprite() {
    if (!kontra.Vector) {
      var error = new ReferenceError('Vector() not found.');
      kontra.log.error(error, 'Kontra.Sprite requires kontra.Vector.');
      return;
    }

    this.position = new kontra.Vector();
    this.velocity = new kontra.Vector();
    this.acceleration = new kontra.Vector();
    this.timeToLive = 0;
    this.context = kontra.context;
  }

  /**
   * Move the sprite by its velocity.
   * @memberOf kontra.Sprite
   */
  Sprite.prototype.advance = function SpriteAdvance() {
    this.velocity.add(this.acceleration);

    this.position.add(this.velocity);

    this.timeToLive--;
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite
   */
  Sprite.prototype.render = function SpriteRender() {
    this.context.save();
    this.context.drawImage(this.image, this.position.x, this.position.y);
    this.context.restore();
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
   * @param {Vector} properties.x - X coordinate of the sprite.
   * @param {Vector} properties.y - Y coordinate of the sprite.
   * @param {Vector} [properties.dx] - Change in X position.
   * @param {Vector} [properties.dy] - Change in Y position.
   * @param {Vector} [properties.ddx] - Change in X velocity.
   * @param {Vector} [properties.ddy] - Change in Y velocity.
   * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
   * @param {string|Image|Canvas} [properties.image] - Image for the sprite.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
   *
   * If you need the sprite to live forever, or just need it to stay on screen until you
   * decide when to kill it, you can set time to live to <code>Infinity</code>. Just be
   * sure to override the <code>isAlive()</code> function to return true when the sprite
   * should die.
   *
   * @returns {Sprite}
   */
  Sprite.prototype.set = function SpriteSpawn(properties) {
    properties = properties || {};

    var _this = this;

    this.position.set(properties.x, properties.y);
    this.velocity.set(properties.dx, properties.dy);
    this.acceleration.set(properties.ddx, properties.ddy);
    this.timeToLive = properties.timeToLive || 0;

    this.context = properties.context || this.context;

    // load an image
    if (kontra.isString(properties.image)) {
      this.image = new Image();
      this.image.onload = function() {
        _this.width = this.width;
        _this.height = this.height;
      };
      this.image.src = properties.image;
    }
    else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
      this.image = properties.image;
      this.width = this.image.width;
      this.height = this.image.height;
    }
    else {
      // make the render function for this sprite a noop since there is no image to draw.
      // this.render/this.draw should be overridden if you want to draw something else.
      this.render = kontra.noop;
    }

    return this;
  };

  /**
   * Update the sprites velocity and position.
   * @memberOf kontra.Sprite
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the update step. Just call <code>this.advance()</code> when you need
   * the sprite to update its position.
   *
   * @example
   * sprite = new Sprite();
   * sprite.update = function() {
   *   // do some logic
   *
   *   this.advance();
   *
   *   return this;
   * };
   *
   * @returns {Sprite}
   */
  Sprite.prototype.update = function SpriteUpdate() {
    this.advance();

    return this;
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite.
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the draw step. Just call <code>this.render()</code> when you need the
   * sprite to draw its image.
   *
   * @example
   * sprite = new Sprite();
   * sprite.draw = function() {
   *   // do some logic
   *
   *   this.render();
   *
   *   return this;
   * };
   *
   * @returns {Sprite}
   */
  Sprite.prototype.draw = function SpriteDraw() {
    this.render();

    return this;
  };

  return kontra;
})(kontra || {});