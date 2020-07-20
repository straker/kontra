import { getContext } from './core.js';
import Updatable from './updatable.js';
import { matrixMultiply } from './utils.js';

let handler = {
  set(obj, prop, value) {
    // pc = propChanged
    let r = Reflect.set(obj, prop, value);
    obj._pc && obj._pc(prop, value);
    return r;
  }
};

/**
 * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
 *
 * Typically you don't create a GameObject directly, but rather extend it for new classes.
 * @class GameObject
 *
 * @param {Object} [properties] - Properties of the game object.
 * @param {Number} [properties.x] - X coordinate of the position vector.
 * @param {Number} [properties.y] - Y coordinate of the position vector.
 * @param {Number} [properties.width] - Width of the game object.
 * @param {Number} [properties.height] - Height of the game object.
 *
 * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
 *
 * @param {{x: number, y: number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
 * @param {Number} [properties.sx=1] - The x camera position.
 * @param {Number} [properties.sy=1] - The y camera position.
 * @param {GameObject[]} [properties.children] - Children to add to the game object. Children added this way have their x/y position treated as relative to the parents x/y position.
 * @param {Number} [properties.opacity=1] - The opacity of the game object.
 * @param {Number} [properties.rotation=0] - The rotation around the origin in radians.
 * @param {Number} [properties.scaleX=1] - The x scale of the game object.
 * @param {Number} [properties.scaleY=1] - The y scale of the game object.
 *
 * @param {(dt?: number) => void} [properties.update] - Function called every frame to update the game object.
 * @param {Function} [properties.render] - Function called every frame to render the game object.
 *
 * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class GameObject extends Updatable {
  /**
   * @docs docs/api_docs/gameObject.js
   */

  constructor(properties) {
    super();
    this.init(properties);
    this._uw();
    let proxy = new Proxy(this, handler);
    return proxy;
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
     * The width of the game object. Does not take into account the
     * objects scale.
     * @memberof GameObject
     * @property {Number} width
     */

    /**
     * The height of the game object. Does not take into account the
     * objects scale.
     * @memberof GameObject
     * @property {Number} height
     */
    this.width = this.height = 0;

    /**
     * The context the game object will draw to.
     * @memberof GameObject
     * @property {CanvasRenderingContext2D} context
     */
    this.context = getContext();

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_GROUP
    /**
     * The game objects parent object.
     * @memberof GameObject
     * @property {GameObject|null} parent
     */

    /**
     * The game objects children objects.
     * @memberof GameObject
     * @property {GameObject[]} children
     */
    this.children = [];
    // @endif

    // @ifdef GAMEOBJECT_ANCHOR
    /**
     * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
     * @memberof GameObject
     * @property {{x: number, y: number}} anchor
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * let gameObject = GameObject({
     *   x: 150,
     *   y: 100,
     *   width: 50,
     *   height: 50,
     *   color: 'red',
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.context.fillStyle = this.color;
     *     this.context.fillRect(0, 0, this.height, this.width);
     *   }
     * });
     *
     * function drawOrigin(gameObject) {
     *   gameObject.context.fillStyle = 'yellow';
     *   gameObject.context.beginPath();
     *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
     *   gameObject.context.fill();
     * }
     *
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 0.5, y: 0.5};
     * gameObject.x = 300;
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 1, y: 1};
     * gameObject.x = 450;
     * gameObject.render();
     * drawOrigin(gameObject);
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

    // @ifdef GAMEOBJECT_OPACITY
    /**
     * The opacity of the object. Does not take into account opacity
     * from any parent objects.
     * @memberof GameObject
     * @property {Number} opacity
     */
    this.opacity = 1;
    // @endif

    // @ifdef GAMEOBJECT_ROTATION
    /**
     * The rotation of the game object around the origin in radians. This rotation takes into account rotations from parent objects and represents the final rotation value.
     * @memberof GameObject
     * @property {Number} rotation
     */
    this.rotation = 0;
    // @endif

    // @ifdef GAMEOBJECT_SCALE
    /**
     * The x scale of the object.
     * @memberof GameObject
     * @property {Number} scaleX
     */

    /**
     * The y scale of the object.
     * @memberof GameObject
     * @property {Number} scaleY
     */
    this.scaleX = this.scaleY = 1;
    // @endif

    let {
      render,

      // @ifdef GAMEOBJECT_GROUP
      children = [],
      // @endif

      ...props
    } = properties;
    super.init(props);

    // @ifdef GAMEOBJECT_GROUP
    children.map(child => this.addChild(child));
    // @endif

    // rf = render function
    this._rf = render || this.draw;
  }

  /**
   * Render the game object. Calls the game objects [draw()](api/gameObject#draw) function.
   * @memberof GameObject
   * @function render
   */
  render() {
    let context = this.context;
    context.save();

    // @ifdef GAMEOBJECT_SCALE
    // it's faster to only scale if one of the values is non-zero
    // rather than always scaling
    // @see https://jsperf.com/scale-or-if-statement/4
    if (this.scaleX != 1 || this.scaleY != 1) {
      context.scale(this.scaleX, this.scaleY);
    }
    // @endif

    // want to be able to use ?? and optional chaining but
    // they are not supported in terser yet
    // @see https://github.com/terser/terser/issues/567
    // let viewX = this.viewX ?? this.x;
    // let viewY = this.viewY ?? this.y;
    let viewX = this.x;
    let viewY = this.y;

    // @ifdef GAMEOBJECT_CAMERA
    viewX = this.viewX;
    viewY = this.viewY;
    // @endif

    // it's faster to only translate if one of the values is non-zero
    // rather than always translating
    // @see https://jsperf.com/translate-or-if-statement/2
    if (viewX || viewY) {
      context.translate(viewX, viewY);
    }

    // @ifdef GAMEOBJECT_ROTATION
    // rotate around the anchor. it's faster to only rotate when set
    // rather than always rotating
    // @see https://jsperf.com/rotate-or-if-statement/2
    if (this.rotation) {
      context.rotate(this.rotation);
    }
    // @endif

    // @ifdef GAMEOBJECT_ANCHOR
    let { x, y } = this.anchor;
    let anchorX = -this.width * x;
    let anchorY = -this.height * y;

    if (anchorX || anchorY) {
      context.translate(anchorX, anchorY);
    }
    // @endif

    // @ifdef GAMEOBJECT_OPACITY
    // it's not really any faster to gate the global alpha
    // @see https://jsperf.com/global-alpha-or-if-statement/1
    this.context.globalAlpha = this.finalOpacity;
    // @endif

    this._rf();

    // @ifdef GAMEOBJECT_ANCHOR
    if (anchorX || anchorY) {
      context.translate(-anchorX, -anchorY);
    }
    // @endif

    // @ifdef GAMEOBJECT_GROUP
    // perform all transforms on the parent before rendering the children
    this.children.map(child => child.render && child.render());
    // @endif

    context.restore();
  }

  /**
   * Draw the game object at its X and Y position, taking into account rotation and anchor.
   *
   * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
   *
   * ```js
   * let { GameObject } = kontra;
   *
   * let gameObject = GameObject({
   *  x: 290,
   *  y: 80,
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the game object normally (perform rotation and other transforms)
   *    this.draw();
   *
   *    // outline the game object
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(0, 0, this.width, this.height);
   *  }
   * });
   *
   * gameObject.render();
   * ```
   * @memberof GameObject
   * @function draw
   */
  draw() {}

  /**
   * Sync property changes from the parent to the child
   */
  _pc(prop, value) {
    this._uw();

    // @ifdef GAMEOBJECT_GROUP
    this.children.map(child => child._uw());
    // @endif
  }

  /**
   * Update world properties
   */
  _uw() {
    // @ifdef GAMEOBJECT_GROUP||GAMEOBJECT_OPACITY||GAMEOBJECT_ROTATION||GAMEOBJECT_SCALE
    let parent = this.parent || {
      _wx: 0,
      _wy: 0,

      // @ifdef GAMEOBJECT_OPACITY
      _wo: 1,
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      _wr: 0,
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      _wsx: 1,
      _wsy: 1
      // @endif
    };
    // @endif

    // use affine transformation matrices to calculate final x and y
    // position
    let pointMatrix = [
      [this.x],
      [this.y],
      [1]
    ];

    // ww = world width, wh = world height
    this._ww = this.width;
    this._wh = this.height;

    // order of multiplication = scale * rotation * translation
    // @see https://gamedev.stackexchange.com/a/16721/33867

    // @ifdef GAMEOBJECT_SCALE
    // wsx = world scale x, wsy = world scale y
    this._wsx = parent._wsx * this.scaleX;
    this._wsy = parent._wsy * this.scaleY;
    this._ww = this.width * this._wsx;
    this._wh = this.height * this._wsy;

    let scaleMatrix = [
      [this._wsx, 0, 0],
      [0, this._wsy, 0],
      [0, 0, 1]
    ];
    pointMatrix = matrixMultiply(scaleMatrix, pointMatrix);
    // @endif

    // @ifdef GAMEOBJECT_ROTATION
    // wr = world rotation
    this._wr = parent._wr + this.rotation;

    let cos = Math.cos(parent._wr);
    let sin = Math.sin(parent._wr);
    let rotationMatrix = [
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1]
    ];
    pointMatrix = matrixMultiply(rotationMatrix, pointMatrix);
    // @endif

    // @ifdef GAMEOBJECT_OPACITY
    // wo = world opacity
    this._wo = parent._wo * this.opacity;
    // @endif

    // @ifdef GAMEOBJECT_GROUP
    let translationMatrix = [
      [1, 0, parent._wx],
      [0, 1, parent._wy],
      [0, 0, 1]
    ];
    pointMatrix = matrixMultiply(translationMatrix, pointMatrix);
    // @endif

    // wx = world x, wy = world y
    this._wx = pointMatrix[0][0];
    this._wy = pointMatrix[1][0];
  }

  get world() {
    return {
      x: this._wx,
      y: this._wy,
      width: this._ww,
      height: this._wh,

      // @ifdef GAMEOBJECT_OPACITY
      opacity: this._wo,
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      rotation: this._wr,
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      scaleX: this._wsx,
      scaleY: this._wsy
      // @endif
    }
  }

  // --------------------------------------------------
  // camera
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_CAMERA
  /**
   * Readonly. X coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof GameObject
   * @property {Number} viewX
   * @readonly
   */
  get viewX() {
    return this.x - this.sx;
  }

  /**
   * Readonly. Y coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
   * @memberof GameObject
   * @property {Number} viewY
   * @readonly
   */
  get viewY() {
    return this.y - this.sy;
  }
  // @endif

  // --------------------------------------------------
  // group
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_GROUP
  /**
   * Add an object as a child to this object. The child objects position and rotation will be calculated based on this objects position and rotation.
   *
   * By default the childs x/y position is interpreted to be relative to the x/y position of the parent. This means that if the childs position is {x: 0, y: 0}, the position will be updated to equal to the parents x/y position when added.
   *
   * If instead the position should not be updated based on the parents x/y position, set the `absolute` option to `true`.
   * @memberof GameObject
   * @function addChild
   *
   * @param {GameObject} child - Object to add as a child.
   * @param {Object} [options] - Options for adding the child.
   * @param {Boolean} [options.absolute=false] - If set the true, the x/y position of the child is treated as an absolute position in the world rather than being relative to the x/y position of the parent.
   *
   * @example
   * // exclude-code:start
   * let { GameObject } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { GameObject } from 'kontra';
   * // exclude-script:end
   *
   * function createObject(x, y, color, size = 1) {
   *   return GameObject({
   *     x,
   *     y,
   *     width: 50 / size,
   *     height: 50 / size,
   *     anchor: {x: 0.5, y: 0.5},
   *     color,
   *     // exclude-code:start
   *     context: context,
   *     // exclude-code:end
   *     render: function() {
   *       this.context.fillStyle = this.color;
   *       this.context.fillRect(0, 0, this.height, this.width);
   *     }
   *   });
   * }
   *
   * let parent = createObject(300, 100, 'red');
   * let relativeChild = createObject(25, 25, '#62a2f9', 2);
   * let absoluteChild = createObject(25, 25, 'yellow', 2);
   *
   * parent.addChild(relativeChild);
   * parent.addChild(absoluteChild, {absolute: true});
   *
   * parent.render();
   */
  addChild(child, { absolute = false } = {}) {
    this.children.push(child);
    child.parent = this;
  }

  /**
   * Remove an object as a child of this object. The removed objects position and rotation will no longer be calculated based off this objects position and rotation.
   * @memberof GameObject
   * @function removeChild
   *
   * @param {GameObject} child - Object to remove as a child.
   */
  removeChild(child) {
    let index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }
  // @endif

  // --------------------------------------------------
  // scale
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_SCALE
  /**
   * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
   * @memberof GameObject
   * @function setScale
   *
   * @param {Number} x - X scale value.
   * @param {Number} [y=x] - Y scale value.
   */
  setScale(x, y = x) {
    this.scaleX = x;
    this.scaleY = y;
  }
  // @endif
}

export default function factory() {
  return new GameObject(...arguments);
}
factory.prototype = GameObject.prototype;
factory.class = GameObject;