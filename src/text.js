import GameObject from './gameObject.js'
import { Factory } from './utils.js'

class Text extends GameObject.class {
  /**
   * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
   *
   * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited support for individual text to have RTL settings, it must be set globally for the entire game.
   * ```js
   * import { Text } from 'kontra';
   *
   * let text = Text({
   *   text: 'Hello World!',
   *   font: '32px Arial',
   *   color: 'black'
   *   x: 100,
   *   y: 100,
   *   anchor: {x: 0.5, y: 0.5}
   * });
   * text.render();
   * ```
   * @class Text
   * @extends GameObject
   *
   * @param {Object} properties - Properties of the text.
   * @param {String} properties.text - The text to display.
   * @param {String} properties.font - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style.
   * @param {String} properties.color - Fill color for the text.
   * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
   * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
   */

  init(properties) {

    /**
     * The color of the text.
     * @type {String} color
     */
    this.color = null;

    /**
     * The text alignment.
     * @type {String} textAlign
     */
    this.textAlign = 'left';

    super.init(properties);

    // p = prerender
    this._p();
  }

  /**
   * The string of text.
   * @type {String} text
   */
  get text() {
    // t = text
    return this._t;
  }

  set text(value) {
    this._t = value;

    // s = strings
    this._s = [];

    // d = dirty
    this._d = true;
  }

  /**
   * The font style.
   * @type {String} font
   */
  get font() {
    // f = font
    return this._f;
  }

  set font(value) {
    this._f = value;

    // fs = font size
    this._fs = parseInt(value);
    this._d = true;
  }

  get width() {
    return this._w;
  }

  set width(value) {
    this._w = value;
    this._d = true;

    // @ifdef TEXT_AUTONEWLINE
    // fw = fixed width
    this._fw = value;
    this._s = [];
    // @endif
  }

  render() {
    if (this._d) {

      // p = prerender
      this._p();
    }
    super.render();
  }

  /**
   * Calculate the font width, height, and text strings before rendering.
   */
  _p() {
    this._d = false;
    this.context.font = this.font;

    // @ifdef TEXT_AUTONEWLINE
    if (!this._s.length && this._fw) {
      let parts = this._t.split(' ');
      let start = 0;
      let i = 2;

      // split the string into lines that all fit within the fixed width
      for (; i <= parts.length; i++) {
        let str = parts.slice(start, i).join(' ');
        let width = this.context.measureText(str).width;

        if (width > this._fw) {
          this._s.push(parts.slice(start, i - 1).join(' '));
          start = i - 1;
        }
      }

      this._s.push(parts.slice(start, i).join(' '));
    }
    // @endif

    // @ifdef TEXT_NEWLINE
    if (!this._s.length && this._t.includes('\n')) {
      let width = 0;
      this._t.split('\n').map(str => {
        this._s.push(str);
        width = Math.max(width, this.context.measureText(str).width);
      });

      this._w = width;
    }
    // @endif

    if (!this._s.length) {
      this._s.push(this.text);
      this._w = this.context.measureText(this._t).width;
    }

    this.height = this._s.length * this._fs;
  }

  _dc(x, y) {
    let alignX = x;
    let textAlign = this.textAlign;

    // @ifdef TEXT_RTL
    textAlign = this.textAlign || this.context.canvas.dir === 'rtl' ? 'right' : 'left';
    // @endif

    // @ifdef TEXT_ALIGN||TEXT_RTL
    alignX = textAlign === 'right'
      ? x + this.width
      : textAlign === 'center'
        ? x + this.width / 2 | 0
        : x;
    // @endif

    this._s.map((str, index) => {
      this.context.textBaseline = 'top';
      this.context.textAlign = textAlign;
      this.context.fillStyle = this.color;
      this.context.font = this.font;
      this.context.fillText(str, alignX, y + this._fs * index);
    });
  }
}

export default Factory(Text)