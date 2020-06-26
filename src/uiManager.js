import { getCanvas } from './core.js'
import GameObject from './gameObject.js'
import { Factory } from './utils.js'
import { on } from './events.js'

let alignment = {
  start(rtl) {
    return rtl ? 1 : 0;
  },
  center() {
    return 0.5;
  },
  end(rtl) {
    return rtl ? 0 : 1;
  }
};

let handler = {
  set(obj, prop, value) {

    // don't set dirty flag for private properties
    if (prop[0] != '_' && obj[prop] !== value) {
      obj._d = true;
    }

    obj[prop] = value;
    return true;
  }
}

class UIManager extends GameObject.class {
  init(properties = {}) {
    let {flow = 'column', align = 'start', justify = 'start', gap = 0, numCols = 1, breakpoints = []} = properties;

    this.flow = flow;
    this.align = align;
    this.justify = justify;
    this.gap = gap;
    this.numCols = numCols;
    this.breakpoints = breakpoints;

    super.init(properties);

    // use a proxy so setting any property on the UI Manager will set the dirty
    // flag
    return new Proxy(this, handler);
  }

  // keep width and height getters/settings so we can set _w and _h and not
  // trigger infinite call loops
  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    this._w = value;
    this._d = true;

    // fw = fixed width
    this._fw = value;
  }

  get height() {
    // h = height
    return this._h;
  }

  set height(value) {
    this._h = value;
    this._d = true;

    // fh = fixed height
    this._fh = value;
  }

  addChild(child) {
    this._d = true;
    super.addChild(child);
  }

  removeChild(child) {
    this._d = true;
    super.removeChild(child);
  }

  setScale(x, y) {
    super.setScale(x, y);
    this._d = true;
  }

  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }

  /**
   * Calculate the width, height, and position of each child before rendering.
   */
  _p() {
    this._d = false;

    // b = breakpoint
    this.breakpoints.map(breakpoint => {
      if (breakpoint.metric.call(this) && this._b !== breakpoint) {
        this._b = breakpoint;
        breakpoint.callback.call(this);
      }
    });

    let canvas = getCanvas();

    let grid = [];
    let colWidths = [];
    let rowHeights = [];

    let columned = this.flow === 'column';
    let rowed = this.flow === 'row';
    let grided = this.flow === 'grid';

    let children = this.children;
    let gap = this.gap * this.scale.x
    let numCols = columned
      ? 1
      : rowed
        ? children.length
        : this.numCols;
    let numRows = Math.ceil(children.length / numCols);

    // direction property overrides canvas dir
    let rtl = (canvas.dir === 'rtl' && !this.direction) || this.direction === 'rtl';

    for (let row = 0; row < numRows; row++) {
      grid[row] = [];

      for (let col = 0; col < numCols; col++) {
        let child = children[row * numCols + col];
        if (!child) {
          // add empty array item so we can reverse a row even when it
          // contains less items than another row
          grid[row][col] = false;
          continue;
        }

        grid[row][col] = child;

        // prerender child to get current width/height
        if (child._p) {
          child._p();
        }

        let width = child.width;
        let height = child.height;

        if ('scaledWidth' in child) {
          height = child.scaledHeight;
          width = child.scaledWidth;
        }

        rowHeights[row] = Math.max(rowHeights[row] || 0, height);
        colWidths[col] = Math.max(colWidths[col] || 0, width);
      }
    }

    this._w = colWidths.reduce((acc, width) => acc += width, 0) + gap * (numCols - 1);
    this._h = rowHeights.reduce((acc, height) => acc += height, 0) + gap * (numRows - 1);

    // reverse columns
    if (rtl) {
      grid = grid.map(row => row.reverse());
      colWidths = colWidths.reverse();
    }

    // let y = this.y;
    let topRightY = 0;
    grid.map((gridRow, row) => {
      let topRightX = 0;
      // let x = rtl && !this.parent
      //   ? canvas.width - (this.x + this._w * (1 - this.anchor.x * 2))
      //   : this.x;

      gridRow.map((child, col) => {
        if (child) {

          let justify = alignment[child.justifySelf ? child.justifySelf : this.justify](rtl);
          let align = alignment[child.alignSelf ? child.alignSelf : this.align]();

          let pointX =
            this.x - (this._w * this.anchor.x) +
            colWidths[col] * justify;
          let pointY =
            this.y - (this._h * this.anchor.y) +
            rowHeights[row] * align;

          let x;
          let y;
          let width = child.width;
          let height = child.height;

          if ('scaledWidth' in child) {
            height = child.scaledHeight;
            width = child.scaledWidth;
          }

          if (justify === 0) {
            x = pointX + width * child.anchor.x;
          }
          else if (justify === 0.5) {
            let sign = child.anchor.x < 0.5 ? -1 : child.anchor.x === 0.5 ? 0 : 1;
            x = pointX + sign * width * child.anchor.x;
          }
          else {
            x = pointX - (width * (1 - child.anchor.x));
          }

          if (align === 0) {
            y = pointY + height * child.anchor.y;
          }
          else if (align === 0.5) {
            let sign = child.anchor.y < 0.5 ? -1 : child.anchor.y === 0.5 ? 0 : 1;
            y = pointY + sign * height * child.anchor.y;
          }
          else {
            y = pointY - (height * (1 - child.anchor.y));
          }

          child.x = topRightX + x;
          child.y = topRightY + y;
        }

        topRightX += colWidths[col] + gap;
      });

      topRightY += rowHeights[row] + gap;
    });
  }
}

export default Factory(UIManager)