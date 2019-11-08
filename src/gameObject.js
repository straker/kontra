import { getContext } from './core.js'
import Vector from './vector.js'

/**
 * A versatile way to update and draw your game objects. It can handle simple rectangles, images, and game object sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class GameObject
 *
 * @param {Object} properties - Properties of the game object.
 * @param {Number} properties.x - X coordinate of the position vector.
 * @param {Number} properties.y - Y coordinate of the position vector.
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 *
 * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
 * @param {Number} [properties.width] - Width of the game object.
 * @param {Number} [properties.height] - Height of the game object.
 *
 * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by kontra.Pool.
 * @param {Number} [properties.rotation=0] - game objects rotation around the origin in radians.
 * @param {Number} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottomright corner.
 *
 * @param {Canvas​Rendering​Context2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Function} [properties.update] - Function called every frame to update the game object.
 * @param {Function} [properties.render] - Function called every frame to render the game object.
 * @param {*} [properties.*] - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class GameObject {
  constructor(properties) {
    this.init(properties);
  }

  /**
   * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
   * @memberof GameObject
   * @function init
   *
   * @param {Object} properties - Properties of the game object.
   */
  init(properties = {}) {

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The game objects position vector. The game objects position is its position in the world, as opposed to the position in the [viewport](api/gameObject#viewX) or [local position](api/gameObject#localPosition). Typically the position in the world, viewport, and local position are the same value. If the game object has been [added to a tileEngine](/api/tileEngine#addObject), the position vector represents where in the tile world the game object is while the viewport represents where to draw the game object in relation to the top-left corner of the canvas.
     * @memberof GameObject
     * @property {kontra.Vector} position
     */
    this.position = Vector();

    /**
     * The width of the game object.
     * @memberof GameObject
     * @property {Number} width
     */

    /**
     * The height of the game object.
     * @memberof GameObject
     * @property {Number} height
     */
    this.width = this.height = 0;

    /**
     * The context the game object will draw to.
     * @memberof GameObject
     * @property {Canvas​Rendering​Context2D} context
     */
    this.context = getContext();

    /**
     * The color of the game object if it was passed as an argument.
     * @memberof GameObject
     * @property {String} color
     */

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_GROUP
    /**
     * The game objects local position vector, which is its position relative to a parent object. If the game object does not have a parent object, the local position will be the same as the [position vector](api/gameObject#position].
     * @memberof GameObject
     * @property {kontra.Vector} localPosition
     */
    this.localPosition = Vector();

    // @ifdef GAMEOBJECT_ROTATION
    /**
     * The game objects local rotation, which is its rotation relative to a parent object. If the game object does not have a parent object, the local rotation will be the same as the [rotation](api/gameObject#rotation].
     * @memberof GameObject
     * @property {kontra.Vector} localPosition
     */
    this.localRotation = 0;

    // rot = rotation
    this._rot = 0;
    // @endif

    /**
     * The game objects parent object.
     * @memberof GameObject
     * @property {kontra.GameObject} parent
     */

    /**
     * The game objects children objects.
     * @memberof GameObject
     * @property {kontra.GameObject[]} children
     */
    this.children = [];
    // @endif

    // @ifdef GAMEOBJECT_VELOCITY
    /**
     * The game objects velocity vector.
     * @memberof GameObject
     * @property {kontra.Vector} velocity
     */
    this.velocity = Vector();
    // @endif

    // @ifdef GAMEOBJECT_ACCELERATION
    /**
     * The game objects acceleration vector.
     * @memberof GameObject
     * @property {kontra.Vector} acceleration
     */
    this.acceleration = Vector();
    // @endif

    // @ifdef GAMEOBJECT_ROTATION
    /**
     * The rotation of the game object around the origin in radians. This rotation takes into account rotations from parent objects and represents the final rotation value.
     * @memberof GameObject
     * @property {Number} rotation
     */
    this.rotation = 0;
    // @endif

    // @ifdef GAMEOBJECT_TTL
    /**
     * How may frames the game object should be alive. Primarily used by kontra.Pool to know when to recycle an object.
     * @memberof GameObject
     * @property {Number} ttl
     */
    this.ttl = Infinity;
    // @endif

    // @ifdef GAMEOBJECT_ANCHOR
    /**
     * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
     * @memberof GameObject
     * @property {Object} anchor
     *
     * @example
     * // exclude-code:start
     * let { game object } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { game object } from 'kontra';
     * // exclude-script:end
     *
     * let gameObject = game object({
     *   x: 150,
     *   y: 100,
     *   color: 'red',
     *   width: 50,
     *   height: 50,
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.draw();
     *
     *     // draw origin
     *     this.context.fillStyle = 'yellow';
     *     this.context.beginPath();
     *     this.context.arc(this.x, this.y, 3, 0, 2*Math.PI);
     *     this.context.fill();
     *   }
     * });
     * gameObject.render();
     *
     * game object.anchor = {x: 0.5, y: 0.5};
     * game object.x = 300;
     * gameObject.render();
     *
     * game object.anchor = {x: 1, y: 1};
     * game object.x = 450;
     * gameObject.render();
     */
    this.anchor = {x: 0, y: 0};
    // @endif

    // @ifdef GAMEOBJECT_CAMERA
    /**
     * The X coordinate of the camera. Used to determine [viewX](api/gameObject#viewX).
     * @memberof GameObject
     * @property {Number} sx
     */

    /**
     * The Y coordinate of the camera. Used to determine [viewY](api/gameObject#viewY).
     * @memberof GameObject
     * @property {Number} sy
     */
    this.sx = this.sy = 0;
    // @endif

    // add all properties to the game object, overriding any defaults
    Object.assign(this, properties);
  }

  // define getter and setter shortcut functions to make it easier to work with the
  // position, velocity, and acceleration vectors.

  /**
   * X coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Y coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }

  set x(value) {
    this.position.x = value;

    // @ifdef GAMEOBJECT_GROUP
    this.localPosition.x = this.parent ? value - this.parent.x : value;
    this.children.map(child => {
      if (child.localPosition) {
        child.x = value + child.localPosition.x
      }
    });
    // @endif
  }

  set y(value) {
    this.position.y = value;

    // @ifdef GAMEOBJECT_GROUP
    this.localPosition.y = this.parent ? value - this.parent.y : value;
    this.children.map(child => {
      if (child.localPosition) {
        child.y = value + child.localPosition.y
      }
    });
    // @endif
  }

  // @ifdef GAMEOBJECT_VELOCITY
  /**
   * X coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dx
   */
  get dx() {
    return this.velocity.x;
  }

  /**
   * Y coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dy
   */
  get dy() {
    return this.velocity.y;
  }

  set dx(value) {
    this.velocity.x = value;
  }

  set dy(value) {
    this.velocity.y = value;
  }
  // @endif

  // @ifdef GAMEOBJECT_ACCELERATION
  /**
   * X coordinate of the acceleration vector.
   * @memberof GameObject
   * @property {Number} ddx
   */
  get ddx() {
    return this.acceleration.x;
  }

  /**
   * Y coordinate of the acceleration vector.
   * @memberof GameObject
   * @property {Number} ddy
   */
  get ddy() {
    return this.acceleration.y;
  }

  set ddx(value) {
    this.acceleration.x = value;
  }

  set ddy(value) {
    this.acceleration.y = value;
  }
  // @endif

  // @ifdef GAMEOBJECT_CAMERA
  /**
   * Readonly. X coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof GameObject
   * @property {Number} viewX
   */
  get viewX() {
    return this.x - this.sx;
  }

  /**
   * Readonly. Y coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof GameObject
   * @property {Number} viewY
   */
  get viewY() {
    return this.y - this.sy;
  }

  // readonly
  set viewX(value) {
    return;
  }

  set viewY(value) {
    return;
  }
  // @endif

  // @ifdef GAMEOBJECT_TTL
  /**
   * Check if the game object is alive. Primarily used by kontra.Pool to know when to recycle an object.
   * @memberof GameObject
   * @function isAlive
   *
   * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }
  // @endif

  // @ifdef GAMEOBJECT_GROUP
  get rotation() {
    return this._rot;
  }

  // override rotation to take into account parent rotations and to set
  // localRotation
  set rotation(value) {
    this._rot = value;

    this.localRotation = this.parent ? value - this.parent.rotation : value;
    this.children.map(child => {
      if (child.localRotation) {
        child.rotation = value + child.localRotation
      }
    });
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;

    // set the childs x/y/rotation to trigger localPosition/localRotation
    // calculations
    child.x = child.x;
    child.y = child.y;
    child.rotation = child.rotation;
  }

  removeChild(child) {
    let index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;

      // set the childs x/y/rotation to trigger localPosition/localRotation
      // calculations
      child.x = child.x;
      child.y = child.y;
      child.rotation = child.rotation;
    }
  }
  // @endif

  /**
   * Update the game objects position based on its velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
   * @memberof GameObject
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    this.advance(dt)
    // @endif
  }

  // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
  /**
   * Move the game object by its acceleration and velocity. If the game object is an [animation game object](api/gameObject#animation-game object), it also advances the animation every frame.
   *
   * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
   *
   * ```js
   * import { game object } from 'kontra';
   *
   * let gameObject = game object({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the game object normally
   *     game object.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof GameObject
   * @function advance
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {
    // @ifdef GAMEOBJECT_VELOCITY

    // @ifdef GAMEOBJECT_ACCELERATION
    this.velocity = this.velocity.add(this.acceleration, dt);
    // @endif

    this.position = this.position.add(this.velocity, dt);
    // @endif

    // @ifdef GAMEOBJECT_TTL
    this.ttl--;
    // @endif
  }
  // @endif

  /**
   * Render the game object. Calls the game objects [draw()](api/gameObject#draw) function.
   * @memberof GameObject
   * @function render
   */
  render() {
    this.draw();
  }

  /**
   * Draw the game object at its X and Y position. This function changes based on the type of the game object. For a [rectangle game object](api/gameObject#rectangle-game object), it uses `context.fillRect()`, for an [image game object](api/gameObject#image-game object) it uses `context.drawImage()`, and for an [animation game object](api/gameObject#animation-game object) it uses the [currentAnimation](api/gameObject#currentAnimation) `render()` function.
   *
   * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
   *
   * ```js
   * import { game object } from 'kontra';
   *
   * let gameObject = game object({
   *  x: 290,
   *  y: 80,
   *  color: 'red',
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the rectangle game object normally
   *    this.draw();
   *
   *    // outline the game object
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(this.x, this.y, this.width, this.height);
   *  }
   * });
   *
   * gameObject.render();
   * ```
   * @memberof GameObject
   * @function draw
   */
  draw() {
    let x = 0;
    let y = 0;
    let viewX = this.x;
    let viewY = this.y;

    // @ifdef GAMEOBJECT_ANCHOR
    x = -this.width * this.anchor.x;
    y = -this.height * this.anchor.y;
    // @endif

    // @ifdef GAMEOBJECT_CAMERA
    viewX = this.viewX;
    viewY = this.viewY;
    // @endif

    // @ifdef GAMEOBJECT_GROUP
    if (this.parent) {
      viewX = this.localPosition.x;
      viewY = this.localPosition.y;
    }
    // @endif

    this.context.save();
    this.context.translate(viewX, viewY);

    // @ifdef GAMEOBJECT_ROTATION
    // rotate around the anchor
    if (this.rotation) {
      let rotation = this.rotation;

      // @ifdef GAMEOBJECT_GROUP
      rotation = this.localRotation;
      // @endif

      this.context.rotate(rotation);
    }
    // @endif

    // dc = draw code
    this._dc(x, y);

    // @ifdef GAMEOBJECT_GROUP
    // perform all transforms on the parent before rendering the children
    this.children.map(child => child.render && child.render());
    // @endif

    this.context.restore();
  }

  _dc() {}
}

export default GameObject
