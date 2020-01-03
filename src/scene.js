import { Factory, srOnlyStyle } from './utils.js'

class Scene {

  /**
   * A scene object for organizing a group of objects that will update and render together foobar.
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
   * ```js
   *
   * @class Scene
   *
   * @param {Object} properties - Properties of the scene.
   * @param {String} properties.id - The id of the scene.
   * @param {String} [properties.name=properties.id] - The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name. Defaults to the id.
   * @param {Object[]} [properties.children=[]] - The children of the scene.
   * @param {...*} properties.props - Any additional properties you need added to the scene. For example, if you pass `Scene({counter: 0})` then the scene will also have a property of the same name and value. You can pass as many additional properties as you want.
   */
  constructor(properties) {
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

    // add all properties to the scene, overriding any defaults
    Object.assign(this, properties);

    /**
     * The scenes children objects.
     * @memberof Scene
     * @property {Object[]} children
     */
    this.children = [];

    // create an accessible DOM node for screen readers
    // dn = dom node
    const section = this._dn = document.createElement('section');
    section.id = this.id;
    section.tabIndex = -1;
    section.style = srOnlyStyle;
    section.setAttribute('aria-label', this.name);

    document.body.appendChild(section);

    this.add(...(properties.children || []));
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

  /**
   * Add objects to the scene.
   * @memberof Scene
   * @function add
   *
   * @param {...Object[]} objects - Objects to add to the scene.
   */
  add(...objects) {
    this.children = this.children.concat(objects);
    objects.map(object => {
      if (object._dn) {
        this._dn.appendChild(object._dn);
      }
    });
  }

  /**
   * Remove an object from the scene.
   * @memberof Scene
   * @function remove
   *
   * @param {Object} object - Object to remove.
   */
  remove(object) {
    this.children = this.children.filter(child => child !== object);
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
      this.children.map(child => child.update && child.update(dt));
    }
  }

  /**
   * Render the scene and call `render()` on all children. A hidden scene will not render.
   * @memberof Scene
   * @function render
   */
  render() {
    if (!this.hidden) {
      this.children.map(child => child.render && child.render());
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

export default Factory(Scene);