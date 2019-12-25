import Text from './text.js'
import { Factory, srOnlyStyle } from './utils.js'

class Button extends Text.class {

  /**
   * An accessible button. Supports screen readers and keyboard navigation using the Tab key. Don't forget to call [initPointer](/api/pointer#initPointer) and [track](/api/pointer#track) to have pointer events enabled on the button.
   *
   * ```js
   * import { initPointer, track, Button } from 'kontra';
   * initPointer();
   *
   * button = Button({
   *   x: 200,
   *   y: 200,
   *   text: 'Click me',
   *   color: 'white',
   *   font: '20px Arial',
   *   onFocus() {
   *     this.color = 'red';
   *     canvas.style.cursor = 'pointer';
   *   },
   *   onBlur() {
   *     this.color = 'white';
   *     canvas.style.cursor = 'initial';
   *   },
   *   onDown() {
   *     this.color = 'blue';
   *   },
   *   onUp() {
   *     this.color = this.focused ? 'red' : 'white';
   *     console.log('click');
   *   }
   * });
   *
   * track(button);
   * button.render();
   * ```js
   *
   * @class Button
   * @extends Text
   *
   * @param {Object} properties - Properties of the button (in addition to all Text properties).
   * @param {Function} [properties.onEnable] - Function called when the button is enabled.
   * @param {Function} [properties.onDisable] - Function called when the button is disabled.
   * @param {Function} [properties.onFocus] - Function called when the button is focused either by the pointer or keyboard.
   * @param {Function} [properties.onBlur] - Function called when the button losses focus either by the pointer or keyboard.
   * @param {Function} [properties.onUp] - Function called when the button is clicked either by the pointer or keyboard.
   */
  init(properties) {
    super.init(properties);

    // create an accessible DOM node for screen readers
    // b = button
    const button = this._b = document.createElement('button');
    button.style = srOnlyStyle;
    button.textContent = this.text;

    // allow the DOM node to control the button
    button.addEventListener('focus', () => this.focus());
    button.addEventListener('blur', () => this.blur());
    button.addEventListener('click', () => this.onUp());

    document.body.appendChild(button);
  }

  /**
   * Clean up the button.
   * @memberof Button
   * @function Destroy
   */
  destory() {
    this._b.remove();
  }

  render() {
    // update DOM node text if it has changed
    if (this._d && this._t !== this._b.textContent) {
      this._b.textContent = this._t;
    }

    super.render();
  }

  /**
   * Enable the button.
   * @memberof Button
   * @function enable
   */
  enable() {

    /**
     * If the button is disabled.
     * @memberof Button
     * @property {Boolean} disabled
     */
    this.disabled = this._b.disabled = false;
    this.onEnable();
  }

  /**
   * Disable the button.
   * @memberof Button
   * @function disable
   */
  disable() {
    this.disabled = this._b.disabled = true;
    this.onDisable();
  }

  /**
   * Focus the button.
   * @memberof Button
   * @function focus
   */
  focus() {

    /**
     * If the button is focused.
     * @memberof Button
     * @property {Boolean} focused
     */
    this.focused = true;
    // prevent infinite loop
    if (document.activeElement != this._b) this._b.focus();

    this.onFocus();
  }

  /**
   * Blur the button.
   * @memberof Button
   * @function blur
   */
  blur() {
    this.focused = false;
    // prevent infinite loop
    if (document.activeElement == this._b) this._b.blur();

    this.onBlur();
  }

  onOver() {
    this.focus();
  }

  onOut() {
    this.blur();
  }

  onEnable() {}
  onDisable() {}
  onFocus() {}
  onBlur() {}
  onUp() {}
}

export default Factory(Button)