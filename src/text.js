import GameObject from './gameObject.js'
import { Factory } from './utils.js'

class Text extends GameObject {
  init(properties) {
    super.init(properties);

    // p = prerender
    this._p();
  }

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

  _p() {
    this._d = false;
    this.context.font = this.font;

    // @ifdef TEXT_AUTONEWLINE
    if (!this._s.length && this._fw) {
      let parts = this._t.split(' ');
      let start = 0;
      let i = 2;

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