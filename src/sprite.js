var kontra = (function(kontra) {
  kontra.Sprite = Sprite;

  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberOf kontra
   * @constructor
   *
   * @see kontra.set for params
   */
  function Sprite(properties) {
    if (!kontra.Vector) {
      var error = new ReferenceError('Vector() not found.');
      kontra.log.error(error, 'Kontra.Sprite requires kontra.Vector.');
      return;
    }

    this.set(properties);
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
    context.save();
    context.drawImage(this.image, this.position.x, this.position.y);
    context.restore();
  };

  /**
   * Determine if the sprite is alive.
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
   * @param {Vector} properties.point - X, y coordinates of the sprite.
   * @param {Vector} [properties.velocity] - Change in position.
   * @param {Vector} [properties.acceleration] - Change in velocity.
   * @param {number} [properties.timeToLive=Infinity] - How may frames the sprite should be alive.
   * @param {string|Image|Canvas} [properties.image] - Image for the sprite.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
   */
  Sprite.prototype.set = function SpriteSpawn(properties) {
    properties = properties || {};

    var _this = this;

    this.position = properties.point || new kontra.Vector();
    this.velocity = properties.velocity || new kontra.Vector();
    this.acceleration = properties.acceleration || new kontra.Vector();

    this.context = properties.context || kontra.context;

    // prevent sprite from expiring by setting time to live to Infinity
    this.timeToLive = properties.timeToLive || Infinity;

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
  };

  /**
   * Update the sprites velocity and position.
   * @memberOf kontra.Sprite
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the update step. Just call this.advance() when you need the
   * sprite to update its position.
   *
   * @example
   * sprite = new Sprite();
   * sprite.update = function() {
   *   // do some logic
   *
   *   this.advance();
   * };
   */
  Sprite.prototype.update = function SpriteUpdate() {
    this.advance();
  };

  /**
   * Draw the sprite.
   * @memberOf kontra.Sprite.
   * @abstract
   *
   * This function can be overridden on a per sprite basis if more functionality
   * is needed in the draw step. Just call this.render() when you need the sprite
   * to draw its image.
   *
   * @example
   * sprite = new Sprite();
   * sprite.draw = function() {
   *   // do some logic
   *
   *   this.render();
   * };
   */
  Sprite.prototype.draw = function SpriteDraw() {
    this.render();
  };

  return kontra;
})(kontra || {});