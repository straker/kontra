import Sprite from './sprite.js';
import Text from './text.js';
import { track } from './pointer.js';
import { srOnlyStyle, noop } from './utils.js';

class Button extends Sprite.class {

  /**
   * An accessible button. Supports screen readers and keyboard navigation using the Tab key. Don't forget to call [initPointer](/api/pointer#initPointer) to have pointer events enabled for the button.
   *
   * ```js
   * import { initPointer, Button } from 'kontra';
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
   * button.render();
   * ```
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
    let { text, onDown, onUp, ...props } = properties;
    super.init(props);
    track(this);

    this._od = onDown || noop;
    this._ou = onUp || noop;

    this.textNode = Text(text);
    this.textNode._p();
    this.addChild(this.textNode);

    // set width and height of button to text unless user set them

    // how to sync text width/height to button width/height?
    if (properties.width == undefined) {
      this.width = this.textNode.width;
    }
    if (properties.height == undefined) {
      this.height = this.textNode.height;
    }
    this._uw();

    // create an accessible DOM node for screen readers
    // dn = dom node
    const button = this._dn = document.createElement('button');
    button.style = srOnlyStyle;
    button.textContent = this.text;

    // allow the DOM node to control the button
    button.addEventListener('focus', () => this.focus());
    button.addEventListener('blur', () => this.blur());
    button.addEventListener('keydown', (evt) => this._kd(evt));
    button.addEventListener('keyup', () => this.onUp());

    document.body.appendChild(button);
  }

  get text() {
    return this.textNode.text;
  }

  set text(value) {
    this.textNode.text = value;
  }

  /**
   * Clean up the button.
   * @memberof Button
   * @function destroy
   */
  destroy() {
    this._dn.remove();
  }

  render() {
    // update DOM node text if it has changed
    if (this.textNode._d && this.text !== this._dn.textContent) {
      this._dn.textContent = this.text;
    }

    super.render();
  }

  /**
   * Enable the button. Calls [onEnable](/api/button#onEnable) if passed.
   * @memberof Button
   * @function enable
   */
  enable() {

    /**
     * If the button is disabled.
     * @memberof Button
     * @property {Boolean} disabled
     */
    this.disabled = this._dn.disabled = false;
    this.onEnable();
  }

  /**
   * Disable the button. Calls [onDisable](/api/button#onDisable) if passed.
   * @memberof Button
   * @function disable
   */
  disable() {
    this.disabled = this._dn.disabled = true;
    this.onDisable();
  }

  /**
   * Focus the button. Calls [onFocus](/api/button#onFOcus) if passed.
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
    if (document.activeElement != this._dn) this._dn.focus();

    this.onFocus();
  }

  /**
   * Blur the button. Calls [onBlur](/api/button#onBlur) if passed.
   * @memberof Button
   * @function blur
   */
  blur() {
    this.focused = false;
    // prevent infinite loop
    if (document.activeElement == this._dn) this._dn.blur();

    this.onBlur();
  }

  onOver() {
    if (!this.disabled) {

      /**
       * If the button is hovered.
       * @memberof Button
       * @property {Boolean} hovered
       */
      this.hovered = true;
    }
  }

  onOut() {
    this.hovered = false;
  }

  /**
   * Function called when then button is enabled. Override this function to have the button do something when enabled.
   * @memberof Button
   * @function onEnable
   */
  onEnable() {}

  /**
   * Function called when then button is disabled. Override this function to have the button do something when disabled.
   * @memberof Button
   * @function onDisable
   */
  onDisable() {}

  /**
   * Function called when then button is focused. Override this function to have the button do something when focused.
   * @memberof Button
   * @function onFocus
   */
  onFocus() {}

  /**
   * Function called when then button is blurred. Override this function to have the button do something when blurred.
   * @memberof Button
   * @function onBlur
   */
  onBlur() {}

  onDown() {
    if (!this.disabled) {

      /**
       * If the button is pressed.
       * @memberof Button
       * @property {Boolean} pressed
       */
      this.pressed = true;
      this._od();
    }
  }

  onUp() {
    if (!this.disabled) {
      this.pressed = false;
      this._ou();
    }
  }

  // kd = keydown
  _kd(evt) {
    // activate button on enter or space
    if (evt.code == 'Enter' || evt.code == 'Space') {
      this.onDown();
    }
  }
}

export default function factory() {
  return new Button(...arguments);
}
factory.prototype = Button.prototype;
factory.class = Button;