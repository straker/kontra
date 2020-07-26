import GameObject from './gameObject.js';
import { srOnlyStyle } from './utils.js';
import { getCanvas } from './core.js';
import { collides } from './helpers.js';

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
 * @param {String} [properties.name=properties.id] - The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name. Defaults to the id.
 */
class Scene extends GameObject.class {

  init(properties) {
    /**
     * The id of the scene.
     * @memberof Scene
     * @property {String} id
     */

    /**
     * The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
     * @memberof Scene
     * @property {String} name
     */
    this.name = properties.id;

    /**
     * Camera culling function which prevents objects outside the camera screen from rendering. An object which returns true will render while an object which returns false will not.
     * @memberof Scene
     * @property {Function} cullObjects
     */
    this.cullObjects = collides;

    // create an accessible DOM node for screen readers
    // dn = dom node
    const section = this._dn = document.createElement('section');
    section.tabIndex = -1;
    section.style = srOnlyStyle;
    document.body.appendChild(section);

    super.init(properties);

    let canvas = getCanvas();
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

    section.id = this.id;
    section.setAttribute('aria-label', this.name);
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
    if (object._dn) {
      this._dn.appendChild(object._dn);
    }
  }

  removeChild(object) {
    super.removeChild(object);
    if (object._dn) {
      document.body.appendChild(object._dn);
    }
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
   * @param {Object} object - Object with x/y properties or a GameObject.
   */
  lookAt(object) {
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
      super.render(child => this.cullObjects(child, this.camera));
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