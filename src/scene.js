import { getCanvas } from './core.js';
import GameObject from './gameObject.js';
import { srOnlyStyle, addToDom } from './utils.js';
import { collides } from './helpers.js';

/**
 * Recursively get all childrens HTML nodes.
 * @param {Object} object - Root object.
 *
 * @returns {Object[]} All nested children HTML nodes.
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
 *   children: [sprite]
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
 * @param {{render: Function, update: Function, x: number, y: number}[]} [properties.children] - Children to add to the scene.
 * @param {HTMLCanvasElement} [properties.canvas] - The canvas element used to determine the size of the camera. Defaults to [core.getCanvas()](api/core#getCanvas).
 * @param {Boolean} [properties.cullObjects=true] - If the scene should not render objects outside the camera bounds.
 * @param {(object1: Object, object2: Object) => Boolean} [properties.cullFunction] - The function used to filter objects to render. Defaults to [helpers.collides](api/helpers#collides).
 * @param {(object1: Object, object2: Object) => Number} [properties.sortFunction] - The function used to sort the children of the scene.
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
     * The children of the scene.
     * @memberof Scene
     * @property {{render: Function, update: Function, x: number, y: number}[]} children
     */
    children = [],

    /**
     * The canvas element for the scenes camera. Used to set the width and height of the camera and determine the cameras bounds for culling objects.
     * @memberof Scene
     * @property {HTMLCanvasElement} canvas
     */
    canvas = getCanvas(),

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
     * Function used to sort the children of the scene before rendering. Can be used in conjunction with [helpers.depthSort](/api/helpers#depthSort). Only direct children of the scene are sorted.
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
     *   children: [sprite1, sprite2],
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
    this._c = [];
    this._ctx = canvas.getContext('2d');

    // create an accessible DOM node for screen readers (do this first
    // so we can move DOM nodes in addChild)
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
      canvas,
      cullObjects,
      cullFunction,
      sortFunction,
      ...props
    });

    children.map(child => this.addChild(child));

    /**
     * The camera object which is used as the focal point for the scene. The scene will not render objects that are outside the bounds of the camera.
     *
     * Additionally, the camera can be used to [lookAt](api/scene#lookAt) an object which will center the camera to that object. This allows you to zoom the scene in and out while the camera remains centered on the object.
     * @memberof Scene
     * @property {GameObject} camera
     */
    this.camera = GameObject({
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: canvas.width,
      height: canvas.height,
      anchor: { x: 0.5, y: 0.5 }
    });
  }

  set children(value) {
    while (this._c.length) {
      this.removeChild(this._c[0]);
    }
    value.map(value => this.addChild(value));
  }

  get children() {
    return this._c;
  }

  /**
   * Add an object as a child to the scene.
   * @memberof Scene
   * @function addChild
   *
   * @param {{render: Function, update: Function, x: number, y: number}} child - Object to add as a child.
   */
  addChild(child) {
    this.children.push(child);

    // move all children to be in the scenes DOM node so we can
    // hide and show the DOM node and thus hide and show all the
    // children
    getAllNodes(child).map(node => {
      this._dn.appendChild(node);
    });
  }

  /**
   * Remove an object as a child of the scene.
   * @memberof Scene
   * @function removeChild
   *
   * @param {Object} child - Object to remove as a child.
   */
  removeChild(child) {
    let index = this.children.indexOf(child);
    if (index != -1) {
      this.children.splice(index, 1);
    }

    getAllNodes(child).map(node => {
      addToDom(node, this.canvas);
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

    // find first focusable child
    let focusableChild = this.children.find(child => child.focus);
    if (focusableChild) {
      focusableChild.focus();
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
   * Clean up the scene and call `destroy()` on all children.
   * @memberof Scene
   * @function destroy
   */
  destroy() {
    this._dn.remove();
    this.children.map(child => child.destroy && child.destroy());
  }

  /**
   * Focus the camera to the object or x/y position. As the scene is scaled the focal point will keep to the position.
   * @memberof Scene
   * @function lookAt
   *
   * @param {{x: number, y: number}} object - Object with x/y properties.
   */
  lookAt(object) {
    // don't call getWorldRect so we can ignore the objects anchor
    object = object.world || object;
    let x = object.x;
    let y = object.y;

    if (object.scaleX) {
      x /= object.scaleX;
      y /= object.scaleY;
    }

    this.camera.x = x;
    this.camera.y = y;
  }

  /**
   * Update all children of the scene by calling the objects `update()` function.
   * @memberof Scene
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    if (!this.hidden) {
      this.children.map(child => child.update && child.update(dt));
    }
  }

  /**
   * Render all children of the scene by calling the objects `render()` function. If [cullObjects](/api/scene#cullObjects) is set to true then only those objects where are inside the camera bounds will be rendered.
   * @memberof Scene
   * @function render
   */
  render() {
    if (!this.hidden) {
      let {
        _ctx,
        children,
        camera,
        sortFunction,
        cullObjects,
        cullFunction
      } = this;
      let { x, y, width, height, scaleX, scaleY } = camera;

      // translate the scene to the camera position
      _ctx.save();
      _ctx.translate(
        -(x * scaleX - width / 2),
        -(y * scaleY - height / 2)
      );

      if (cullObjects) {
        children = children.filter(child =>
          cullFunction(camera, child)
        );
      }
      if (sortFunction) {
        children.sort(sortFunction);
      }
      children.map(child => child.render && child.render());

      _ctx.restore();
    }
  }

  /**
   * Function called when the scene is shown. Override this function to have the scene do something when shown.
   * @memberof Scene
   * @function onShow
   */
  onShow() {}

  /**
   * Function called when the scene is hidden. Override this function to have the scene do something when hidden.
   * @memberof Scene
   * @function onHide
   */
  onHide() {}
}

export default function factory() {
  return new Scene(...arguments);
}
export { Scene as SceneClass };
