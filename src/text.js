import GameObject from './gameObject.js'
import { on } from './events.js'
import { getCanvas, getContext } from './core.js'
import { Factory } from './utils.js'

let fontSizeRegex = /(\d+)(\w+)/;

function parseFont(font) {
  let match = font.match(fontSizeRegex);

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let size = +match[1];
  let unit = match[2];
  let computed = size;

  // compute font size
  // switch(unit) {
  //   // px defaults to the size

  //   // em uses the size of the canvas when declared (but won't keep in sync with
  //   // changes to the canvas font-size)
  //   case 'em': {
  //     let fontSize = window.getComputedStyle(getCanvas()).fontSize;
  //     let parsedSize = parseFont(fontSize).size;
  //     computed = size * parsedSize;
  //   }

  //   // rem uses the size of the HTML element when declared (but won't keep in
  //   // sync with changes to the HTML element font-size)
  //   case 'rem': {
  //     let fontSize = window.getComputedStyle(document.documentElement).fontSize;
  //     let parsedSize = parseFont(fontSize).size;
  //     computed = size * parsedSize;
  //   }
  // }

  return {
    size,
    unit,
    computed
  };
}

class Text extends GameObject.class {
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

  init(properties) {

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The text alignment.
     * @memberof Text
     * @property {String} textAlign
     */
    this.textAlign = '';

    /**
     * The distance between two lines of text. The value is multiplied by the texts font size.
     * @memberof Text
     * @property {Number} lineHeight
     */
    this.lineHeight = 1;

   /**
    * The font style.
    * @memberof Text
    * @property {String} font
    */
    this.font = getContext().font;

    /**
     * The color of the text.
     * @memberof Text
     * @property {String} color
     */

    super.init(properties);

    // p = prerender
    this._p();
  }

  /**
   * The string of text. Use newline characters to create multi-line strings.
   * @memberof Text
   * @property {String} text
   */
  get text() {
    // t = text
    return this._t;
  }

  set text(value) {
    this._t = value;

    // d = dirty
    this._d = true;
  }

  get font() {
    // f = font
    return this._f;
  }

  set font(value) {
    this._f = value;

    // fs = font size
    this._fs = parseFont(value).computed;
    this._d = true;
  }

  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    this._w = value;
    this._d = true;

    // @ifdef TEXT_AUTONEWLINE
    // fw = fixed width
    this._fw = value;
    // @endif
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

  draw() {
    let alignX = 0;
    let textAlign = this.textAlign;

    // @ifdef TEXT_RTL
    textAlign = this.textAlign || (this.context.canvas.dir === 'rtl' ? 'right' : 'left');
    // @endif

    // @ifdef TEXT_ALIGN||TEXT_RTL
    alignX = textAlign === 'right'
      ? this.width
      : textAlign === 'center'
        ? this.width / 2 | 0
        : 0;
    // @endif

    this._s.map((str, index) => {
      this.context.textBaseline = 'top';
      this.context.textAlign = textAlign;
      this.context.fillStyle = this.color;
      this.context.font = this.font;
      this.context.fillText(str, alignX, this._fs * this.lineHeight * index);
    });
  }
}

export default Factory(Text)