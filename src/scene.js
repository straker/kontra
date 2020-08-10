import GameObject from './gameObject.js';
import { srOnlyStyle, addToDom } from './utils.js';
import { collides } from './helpers.js';

function getAllNodes(object) {
  let nodes = [];

  if (object._dn) {
    nodes.push(object._dn);
  }
  else if (object.children) {
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
 * @extends GameObject
 *
 * @param {Object} properties - Properties of the scene.
 * @param {String} properties.id - The id of the scene.
 * @param {String} [properties.name=properties.id] - The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
 * @param {Boolean} [properties.cullObjects=true] - If the scene should not render objects outside the camera bounds.
 * @param {Function} [properties.cullFunction] - The function used to filter objects to render. Defaults to [helpers.collides](/api/helpers#collides).
 */
class Scene extends GameObject.class {

  init({
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
     * If the camera should cull objects outside the camera bounds. Not rendering objects which can't be seen greatly improves the performance.
     * @memberof Scene
     * @property {Boolean} cullObjects
     */
    cullObjects = true,

     /**
     * Camera culling function which prevents objects outside the camera screen from rendering. Is passed as the `filterFunction` to the [render](/api/gameObject#render) function.
     * @memberof Scene
     * @property {Function} cullFunction
     */
    cullFunction = collides,

    ...props
  }) {
    // create an accessible DOM node for screen readers (do this first
    // so we can move DOM nodes in addChild)
    // dn = dom node
    const section = this._dn = document.createElement('section');
    section.tabIndex = -1;
    section.style = srOnlyStyle;
    section.id = id;
    section.setAttribute('aria-label', name);

    super.init({
      id,
      name,
      cullObjects,
      cullFunction,
      ...props
    });

    addToDom(section, this.context.canvas);

    let canvas = this.context.canvas;

    /**
     * The camera object which is used as the focal point for the scene. The scene will not render objects that are outside the bounds of the camera.
     *
     * Additionally, the camera can be used to [lookAt](/api/scene#lookAt) an object which will center the camera to that object. This allows you to zoom the scene in and out while the camera remains centered on the object.
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

    // can call super here only by using lexical scope
    this.camera._pc = () => {
      super._pc.call(this.camera);

      // only set the cameras position based on scale
      // but not the width/height
      let canvas = this.context.canvas;
      this.camera._wx = this.camera.x * this.scaleX;
      this.camera._wy = this.camera.y * this.scaleY;
    }
  }

  /**
   * Show the scene and resume update and render. Calls [onShow](/api/scene#onShow) if passed.
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
    }
    else {
      this._dn.focus();
    }

    this.onShow();
  }

  /**
   * Hide the scene. A hidden scene will not update or render. Calls [onHide](/api/scene#onHide) if passed.
   * @memberof Scene
   * @function hide
   */
  hide() {
    this.hidden = this._dn.hidden = true;
    this.onHide();
  }

  addChild(object, options) {
    super.addChild(object, options);

    // move all children to be in the scenes DOM node so we can
    // hide and show the DOM node and thus hide and show all the
    // children
    getAllNodes(object).map(node => {
      this._dn.appendChild(node);
    });
  }

  removeChild(object) {
    super.removeChild(object);

    getAllNodes(object).map(node => {
      addToDom(node, this.context.canvas);
    });
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
   * Update the scene and call `update()` on all children. A hidden scene will not update.
   * @memberof Scene
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    if (!this.hidden) {
      super.update(dt);
    }
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
    this._pc();
  }

  _pc() {
    super._pc();

    // this can be called before the camera is initialized so we
    // need to guard it
    this.camera && this.camera._pc();
  }

  /**
   * Render the scene and call `render()` on all children. A hidden scene will not render nor will any children outside of the current camera.
   * @memberof Scene
   * @function render
   */
  render() {
    let { x, y, width, height } = this.camera;

    this.sx = x * this.scaleX - width / 2;
    this.sy = y * this.scaleY - height / 2;

    if (!this.hidden) {
      super.render(child => this.cullObjects ? this.cullFunction(child, this.camera) : true);
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
factory.prototype = Scene.prototype;
factory.class = Scene;