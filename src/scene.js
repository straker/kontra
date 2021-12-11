import { getContext } from './core.js';
import GameObject from './gameObject.js';
import { srOnlyStyle, addToDom, removeFromArray } from './utils.js';
import { collides } from './helpers.js';

/**
 * Recursively get all objects HTML nodes.
 * @param {Object} object - Root object.
 *
 * @returns {Object[]} All nested HTML nodes.
 */
function getAllNodes(object) {
  let nodes = [];

  if (object._dn) {
    nodes.push(object._dn);
  } else if (object.children) {
    object.children.map(child => {
      nodes = nodes.concat(getAllNodes(child));
    });
  }

  return nodes;
}

/**
 * A scene object for organizing a group of objects that will update and render together.
 *
 * ```js
 * import { Scene, Sprite } from 'kontra';
 *
 * sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40,
 *   color: 'red'
 * });
 *
 * scene = Scene({
 *   id: 'game',
 *   objects: [sprite]
 * });
 *
 * scene.render();
 * ```
 *
 * @class Scene
 *
 * @param {Object} properties - Properties of the scene.
 * @param {String} properties.id - The id of the scene.
 * @param {String} [properties.name=properties.id] - The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
 * @param {Object[]} [properties.objects] - Objects to add to the scene.
 * @param {CanvasRenderingContext2D} [properties.context] - The context the scene should draw to. Defaults to [core.getContext()](api/core#getContext).
 * @param {Boolean} [properties.cullObjects=true] - If the scene should not render objects outside the camera bounds.
 * @param {(object1: Object, object2: Object) => Boolean} [properties.cullFunction] - The function used to filter objects to render. Defaults to [helpers.collides](api/helpers#collides).
 * @param {(object1: Object, object2: Object) => Number} [properties.sortFunction] - The function used to sort the objects of the scene.
 * @param {Function} [properties.onShow] - Function called when the scene is shown.
 * @param {Function} [properties.onHide] - Function called when the scene is hidden.
 *
 * @param {...*} properties.props - Any additional properties you need added to the scene.
 */
class Scene {
  constructor({
    /**
     * The id of the scene.
     * @memberof Scene
     * @property {String} id
     */
    id,

    /**
     * The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
     * @memberof Scene
     * @property {String} name
     */
    name = id,

    /**
     * The objects of the scene.
     * @memberof Scene
     * @property {Object[]} objects
     */
    objects = [],

    /**
     * The context the scene will draw to.
     * @memberof Scene
     * @property {CanvasRenderingContext2D} context
     */
    context = getContext(),

    /**
     * If the camera should cull objects outside the camera bounds. Not rendering objects which can't be seen greatly improves the performance.
     * @memberof Scene
     * @property {Boolean} cullObjects
     */
    cullObjects = true,

    /**
     * Camera culling function which prevents objects outside the camera screen from rendering.
     * @memberof Scene
     * @property {Function} cullFunction
     */
    cullFunction = collides,

    /**
     * Function used to sort the objects of the scene before rendering. Can be used in conjunction with [helpers.depthSort](/api/helpers#depthSort). Only direct objects of the scene are sorted.
     *
     * ```js
     * import { Scene, Sprite, depthSort } from 'kontra';
     *
     * let sprite1 = Sprite({
     *   // ...
     * });
     * let sprite2 = Sprite({
     *   // ...
     * });
     *
     * let scene = Scene({
     *   id: 'game',
     *   objects: [sprite1, sprite2],
     *   sortFunction: depthSort
     * });
     *
     * scene.render();
     * ```
     * @memberof Scene
     * @property {Function} sortFunction
     */
    sortFunction,

    ...props
  }) {
    // o = objects
    this._o = [];
    let canvas = context.canvas;

    // create an accessible DOM node for screen readers (do this first
    // so we can move DOM nodes in add())
    // dn = dom node
    let section = (this._dn = document.createElement('section'));
    section.tabIndex = -1;
    section.style = srOnlyStyle;
    section.id = id;
    section.setAttribute('aria-label', name);

    addToDom(section, canvas);

    // add all properties to the object, overriding any defaults
    Object.assign(this, {
      id,
      name,
      context,
      cullObjects,
      cullFunction,
      sortFunction,
      ...props
    });

    /**
     * The camera object which is used as the focal point for the scene. The scene will not render objects that are outside the bounds of the camera.
     *
     * Additionally, the camera can be used to [lookAt](api/scene#lookAt) an object which will center the camera to that object. This allows you to zoom the scene in and out while the camera remains centered on the object.
     * @memberof Scene
     * @property {GameObject} camera
     */
    let { width, height } = canvas;
    let x = width / 2;
    let y = height / 2;
    this.camera = GameObject({
      x,
      y,
      width,
      height,
      context,
      centerX: x,
      centerY: y,
      anchor: { x: 0.5, y: 0.5 },
      render: this._rf.bind(this)
    });

    this.add(objects);
  }

  set objects(value) {
    this.remove(this._o);
    this.add(value);
  }

  get objects() {
    return this._o;
  }

  /**
   * Add an object to the scene scene.
   * @memberof Scene
   * @function add
   *
   * @param {...(Object|Object[])[]} objects - Object to add. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  add(...objects) {
    objects.flat().map(object => {
      this._o.push(object);

      // move all objects to be in the scenes DOM node so we can
      // hide and show the DOM node and thus hide and show all the
      // objects
      getAllNodes(object).map(node => {
        this._dn.appendChild(node);
      });
    });
  }

  /**
   * Remove an object from the scene.
   * @memberof Scene
   * @function remove
   *
   * @param {...(Object|Object[])[]} objects - Object to remove. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  remove(...objects) {
    objects.flat().map(object => {
      removeFromArray(this._o, object);

      getAllNodes(object).map(node => {
        addToDom(node, this.context);
      });
    });
  }

  /**
   * Show the scene and resume update and render. Calls [onShow](api/scene#onShow) if passed.
   * @memberof Scene
   * @function show
   */
  show() {
    /**
     * If the scene is hidden.
     * @memberof Scene
     * @property {Boolean} hidden
     */
    this.hidden = this._dn.hidden = false;

    // find first focusable object
    let focusableObject = this._o.find(object => object.focus);
    if (focusableObject) {
      focusableObject.focus();
    } else {
      this._dn.focus();
    }

    this.onShow();
  }

  /**
   * Hide the scene. A hidden scene will not update or render. Calls [onHide](api/scene#onHide) if passed.
   * @memberof Scene
   * @function hide
   */
  hide() {
    this.hidden = this._dn.hidden = true;
    this.onHide();
  }

  /**
   * Clean up the scene and call `destroy()` on all objects.
   * @memberof Scene
   * @function destroy
   */
  destroy() {
    this._dn.remove();
    this._o.map(object => object.destroy && object.destroy());
  }

  /**
   * Focus the camera to the objects x/y position. As the scene is scaled the focal point will keep to the position.
   * @memberof Scene
   * @function lookAt
   *
   * @param {{x: number, y: number}} object - Object to look at.
   */
  lookAt(object) {
    // don't call getWorldRect so we can ignore the objects anchor
    // and scale
    let { x, y } = object.world || object;
    this.camera.x = x;
    this.camera.y = y;
  }

  /**
   * Update all objects of the scene by calling the objects `update()` function.
   * @memberof Scene
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    if (!this.hidden) {
      this._o.map(object => object.update && object.update(dt));
    }
  }

  /**
   * Render all children inside the cameras render function, essentially treating the scenes objects as children of the camera. This allows the camera to control the position, scale, and rotation of the scene.
   */
  _rf() {
    let {
      _o,
      context,
      _sx,
      _sy,
      camera,
      sortFunction,
      cullObjects,
      cullFunction
    } = this;

    // translate the canvas again (this time using camera scale)
    // to properly move the scene the direction of the camera
    context.translate(_sx, _sy);

    let objects = _o;
    if (cullObjects) {
      objects = objects.filter(object =>
        cullFunction(camera, object)
      );
    }
    if (sortFunction) {
      objects.sort(sortFunction);
    }
    objects.map(object => object.render && object.render());
  }

  /**
   * Render all objects of the scene by calling the objects `render()` function. If [cullObjects](/api/scene#cullObjects) is set to true then only those objects which are inside the camera bounds will be rendered.
   * @memberof Scene
   * @function render
   */
  render() {
    if (!this.hidden) {
      let { context, camera } = this;
      let { x, y, centerX, centerY } = camera;

      context.save();

      // translate the camera back to the center of the canvas
      // (ignoring scale) since the camera x/y position moves
      // the camera off-center
      this._sx = centerX - x;
      this._sy = centerY - y;
      context.translate(this._sx, this._sy);

      camera.render();

      context.restore();
    }
  }

  /**
   * Function called when the scene is shown. Override this function to have the scene do something when shown, such as adding input events.
   *
   * ```js
   * let { Scene, onKey } = 'kontra';
   *
   * let scene = Scene({
   *   onShow() {
   *     onKey('arrowup', () => {
   *       // ...
   *     })
   *   }
   * });
   * ```
   * @memberof Scene
   * @function onShow
   */
  onShow() {}

  /**
   * Function called when the scene is hidden. Override this function to have the scene do something when hidden, such as cleaning up input events.
   *
   * ```js
   * let { Scene, offKey } = 'kontra';
   *
   * let scene = Scene({
   *   onHide() {
   *     offKey('arrowup');
   *   }
   * });
   * ```
   * @memberof Scene
   * @function onHide
   */
  onHide() {}
}

export default function factory() {
  return new Scene(...arguments);
}
export { Scene as SceneClass };
