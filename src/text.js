import { GameObjectClass } from './gameObject.js';
import { getContext } from './core.js';

let fontSizeRegex = /(\d+)(\w+)/;

function parseFont(font) {
  let match = font.match(fontSizeRegex);

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let size = +match[1];
  let unit = match[2];
  let computed = size;

  return {
    size,
    unit,
    computed
  };
}

/**
 * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
 *
 * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited browser support for individual text to have RTL settings, it must be set globally for the entire game.
 *
 * @example
 * // exclude-code:start
 * let { Text } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Text } from 'kontra';
 * // exclude-script:end
 *
 * let text = Text({
 *   text: 'Hello World!\nI can even be multiline!',
 *   font: '32px Arial',
 *   color: 'white',
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *   textAlign: 'center'
 * });
 * // exclude-code:start
 * text.context = context;
 * // exclude-code:end
 *
 * text.render();
 * @class Text
 * @extends GameObject
 *
 * @param {Object} properties - Properties of the text.
 * @param {String} properties.text - The text to display.
 * @param {String} [properties.font] - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style. Defaults to the main context font.
 * @param {String} [properties.color] - Fill color for the text. Defaults to the main context fillStyle.
 * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
 * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
 * @param {Number} [properties.lineHeight=1] - The distance between two lines of text.
 */
class Text extends GameObjectClass {
  init({
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The string of text. Use newline characters to create multi-line strings.
     * @memberof Text
     * @property {String} text
     */
    text = '',

    /**
     * The text alignment.
     * @memberof Text
     * @property {String} textAlign
     */
    textAlign = '',

    /**
     * The distance between two lines of text. The value is multiplied by the texts font size.
     * @memberof Text
     * @property {Number} lineHeight
     */
    lineHeight = 1,

    /**
     * The font style.
     * @memberof Text
     * @property {String} font
     */
    font = getContext().font,

    /**
     * The color of the text.
     * @memberof Text
     * @property {String} color
     */

    ...props
  } = {}) {
    // cast to string
    text = '' + text;

    super.init({
      text,
      textAlign,
      lineHeight,
      font,
      ...props
    });

    // p = prerender
    this._p();
  }

  // keep width and height getters/settings so we can set _w and _h
  // and not trigger infinite call loops
  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    // d = dirty
    this._d = true;
    this._w = value;

    // fw = fixed width
    this._fw = value;
  }

  get text() {
    return this._t;
  }

  set text(value) {
    this._d = true;
    this._t = '' + value;
  }

  get font() {
    return this._f;
  }

  set font(value) {
    this._d = true;
    this._f = value;
    this._fs = parseFont(value).computed;
  }

  get lineHeight() {
    // lh = line height
    return this._lh;
  }

  set lineHeight(value) {
    this._d = true;
    this._lh = value;
  }

  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }

  /**
   * Calculate the font width, height, and text strings before rendering.
   */
  _p() {
    // s = strings
    this._s = [];
    this._d = false;
    let context = this.context;

    context.font = this.font;

    // @ifdef TEXT_AUTONEWLINE
    if (!this._s.length && this._fw) {
      let parts = this.text.split(' ');
      let start = 0;
      let i = 2;

      // split the string into lines that all fit within the fixed
      // width
      for (; i <= parts.length; i++) {
        let str = parts.slice(start, i).join(' ');
        let width = context.measureText(str).width;

        if (width > this._fw) {
          this._s.push(parts.slice(start, i - 1).join(' '));
          start = i - 1;
        }
      }

      this._s.push(parts.slice(start, i).join(' '));
    }
    // @endif

    // @ifdef TEXT_NEWLINE
    if (!this._s.length && this.text.includes('\n')) {
      let width = 0;
      this.text.split('\n').map(str => {
        this._s.push(str);
        width = Math.max(width, context.measureText(str).width);
      });

      this._w = this._fw || width;
    }
    // @endif

    if (!this._s.length) {
      this._s.push(this.text);
      this._w = this._fw || context.measureText(this.text).width;
    }

    this.height =
      this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
    this._uw();
  }

  draw() {
    let alignX = 0;
    let textAlign = this.textAlign;
    let context = this.context;

    // @ifdef TEXT_RTL
    textAlign =
      this.textAlign ||
      (context.canvas.dir == 'rtl' ? 'right' : 'left');
    // @endif

    // @ifdef TEXT_ALIGN||TEXT_RTL
    alignX =
      textAlign == 'right'
        ? this.width
        : textAlign == 'center'
        ? (this.width / 2) | 0
        : 0;
    // @endif

    this._s.map((str, index) => {
      context.textBaseline = 'top';
      context.textAlign = textAlign;
      context.fillStyle = this.color;
      context.font = this.font;
      context.fillText(
        str,
        alignX,
        this._fs * this.lineHeight * index
      );
    });
  }
}

export default function factory() {
  return new Text(...arguments);
}
export { Text as TextClass };
