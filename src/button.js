import Sprite from './sprite.js';
import Text from './text.js';
import { track } from './pointer.js';
import { srOnlyStyle, noop, addToDom } from './utils.js';

/**
 * An accessible button. Supports screen readers and keyboard navigation using the <kbd>Tab</kbd> key. The button is automatically [tracked](/api/pointer#track) by the pointer and accepts all pointer functions, but you will still need to call [initPointer](/api/pointer#initPointer) to have pointer events enabled.
 * @class Button
 * @extends Sprite
 *
 * @param {Object} [properties] - Properties of the button (in addition to all Sprite properties).
 * @param {Object} [properties.text] - Properties of [Text](/api/text) which are used to create the [textNode](/api/button#textNode).
 * @param {Number} [properties.padX=0] - The horizontal padding.
 * @param {Number} [properties.padY=0] - The vertical padding.
 * @param {Function} [properties.onEnable] - Function called when the button is enabled.
 * @param {Function} [properties.onDisable] - Function called when the button is disabled.
 * @param {Function} [properties.onFocus] - Function called when the button is focused by the keyboard.
 * @param {Function} [properties.onBlur] - Function called when the button losses focus either by the pointer or keyboard.
 */
class Button extends Sprite.class {
  /**
   * @docs docs/api_docs/button.js
   */

  init({
    /**
     * The horizontal padding. This will be added to the width to give the final width of the button.
     * @memberof Button
     * @property {Number} padX
     */
    padX = 0,

    /**
     * The vertical padding. This will be added to the height to give the final height of the button.
     * @memberof Button
     * @property {Number} padY
     */
    padY = 0,

    text,
    onDown,
    onUp,
    ...props
  } = {}) {
    super.init({
      padX,
      padY,
      ...props
    });

    /**
     * Each Button creates a Text object and adds it as a child. The `text` of the Text object is used as the accessible name of the HTMLButtonElement.
     * @memberof Button
     * @property {Text} textNode
     */
    this.textNode = Text({
      ...text,

      // ensure the text uses the same context as the button
      context: this.context
    });

    // if the user didn't set a width/height or use an image
    // default to the textNode dimensions
    if (!this.width) {
      this.width = this.textNode.width;
      this.height = this.textNode.height;
    }

    track(this);
    this.addChild(this.textNode);

    // od = on down
    this._od = onDown || noop;

    // ou = on up
    this._ou = onUp || noop;

    // create an accessible DOM node for screen readers
    // dn = dom node
    const button = this._dn = document.createElement('button');
    button.style = srOnlyStyle;
    button.textContent = this.text;

    // sync events between the button element and the class
    button.addEventListener('focus', () => this.focus());
    button.addEventListener('blur', () => this.blur());
    button.addEventListener('keydown', (evt) => this._kd(evt));
    button.addEventListener('keyup', (evt) => this._ku(evt));

    addToDom(button, this.context.canvas);

    this._uw();
    this._p();
  }

  /**
   * The text property of the Text object.
   * @memberof Button
   * @property {String} text
   */
  get text() {
    return this.textNode.text;
  }

  set text(value) {
    // d = dirty
    this._d = true;
    this.textNode.text = value;
    this._pc();
  }

  /**
   * Clean up the button by removing the HTMLButtonElement from the DOM.
   * @memberof Button
   * @function destroy
   */
  destroy() {
    this._dn.remove();
  }

  _p() {
    // update DOM node text if it has changed
    if (this.text !== this._dn.textContent) {
      this._dn.textContent = this.text;
    }

    // update width and height (need to prerender the button
    // first)
    this.textNode._p();

    let width = this.textNode.width + this.padX * 2;
    let height = this.textNode.height + this.padY * 2;

    this.width = Math.max(width, this.width);
    this.height = Math.max(height, this.height);
    this._uw();
  }

  render() {
    if (this._d) {
      this._p();
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
   * Disable the button. A disabled button will not longer render nor respond to pointer and keyboard events. Calls [onDisable](/api/button#onDisable) if passed.
   * @memberof Button
   * @function disable
   */
  disable() {
    this.disabled = this._dn.disabled = true;
    this.onDisable();
  }

  /**
   * Focus the button. Calls [onFocus](/api/button#onFocus) if passed.
   * @memberof Button
   * @function focus
   */
  focus() {
    if (!this.disabled) {

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

  // kd = keydown
  _ku(evt) {
    // activate button on enter or space
    if (evt.code == 'Enter' || evt.code == 'Space') {
      this.onUp();
    }
  }
}

export default function factory() {
  return new Button(...arguments);
}
factory.prototype = Button.prototype;
factory.class = Button;