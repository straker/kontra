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
     * @param {number} [properties.rotation=0] - Rotation in radians of the sprite.
     * @param {number} [properties.anchor={x:0,y:0}] - The x and y origin of the sprite. {0,0} is the top left corner of the sprite, {1,1} is the bottom right corner.
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
    init(properties, prop, temp, firstAnimation) {
      properties = properties || {};

      this.position = kontra.vector(properties.x, properties.y);
      this.velocity = kontra.vector(properties.dx, properties.dy);
      this.acceleration = kontra.vector(properties.ddx, properties.ddy);

      // defaults
      this.width = this.height = this.rotation = 0;
      this.ttl = 0;
      this.anchor = {x: 0, y: 0};
      this.context = kontra.context;

      // loop through properties before overrides
      for (prop in properties) {
        this[prop] = properties[prop];
      }

      // image sprite
      if (temp = properties.image) {
        this.image = temp;
        this.width = this.width || temp.width;
        this.height = this.height || temp.height;
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
        this.width = this.width || firstAnimation.width;
        this.height = this.height || firstAnimation.height;
      }

      return this;
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
     * NOTE: Does not take into account sprite rotation. If you need collision
     * detection between rotated sprites you will need to implement your own
     * CollidesWith() function. I suggest looking at the Separate Axis Theorem.
     * @memberof kontra.sprite
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
      else if (this._ca) {
        this._ca.render({
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
    return (new Sprite()).init(properties);
  };
  kontra.sprite.prototype = Sprite.prototype;
})();