import { getCanvas } from './core.js';
import GameObject from './gameObject.js';
import { getRect } from './utils.js';
import { on } from './events.js';

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

class GridManager extends GameObject.class {
  init(properties = {}) {

    /**
     *
     */
    this.flow = 'column';

    /**
     *
     */

    /**
     *
     */
    this.align = this.justify = 'start';

    /**
     *
     */

     /**
      *
      */
    this.gapX = this.gapY = 0;

    /**
     *
     */
    this.numCols = 1;

    /**
     *
     */
    this.breakpoints = [];

    /**
     * this.dir
     */

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
  }

  get height() {
    // h = height
    return this._h;
  }

  set height(value) {
    this._h = value;
    this._d = true;
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
      this._cp();
    }
    super.render();
  }

  /**
   * Build the grid and calculate its width and height
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

    // g = grid, cw = colWidths, rh = rowHeights
    let grid = this._g = [];
    let colWidths = this._cw = [];
    let rowHeights = this._rh = [];

    // let widths = [];
    // let heights = [];

    let children = this.children;

    // nc = numCols
    let numCols = this._nc = this.flow === 'column'
      ? 1
      : this.flow === 'row'
        ? children.length
        : this.numCols;

    let row = 0;
    let col = 0;
    for (let i = 0, child; child = children[i]; i++) {
      grid[row] = grid[row] || [];
      grid[row][col] = child;

      // prerender child to get current width/height
      if (child._p) {
        child._p();
      }

      // let { width, height } = getRect(child);
      rowHeights[row] = Math.max(rowHeights[row] || 0, child.height);
      // heights[row] = Math.max(heights[row] || 0, child.height);

      let colSpan = child.colSpan || 1;
      if (colSpan > 1 && col + colSpan <= numCols) {
        while(++col < colSpan) {

          grid[row][col] = child;
        }
      }
      // colSpan elements do not contribute to the colWidth
      else {
        colWidths[col] = Math.max(colWidths[col] || 0, child.width);
        // widths[col] = Math.max(widths[col] || 0, child.width);
      }

      if (++col >= numCols) {
        col = 0;
        row++;
      }
    }

    // fill remaining row
    while (col > 0 && col < numCols) {
      // add empty array item so we can reverse a row even when it
      // contains less items than another row
      grid[row][col++] = false;
    }
    let numRows = grid.length;

    // let gapX = this.gapX * this.scaleX;
    // let gapY = this.gapY * this.scaleY;

    this._w = colWidths.reduce((acc, width) => acc += width, 0) + this.gapX * (numCols - 1);
    this._h = rowHeights.reduce((acc, height) => acc += height, 0) + this.gapY * (numRows - 1);

    // this._w = widths.reduce((acc, width) => acc += width, 0) + this.gapX * (numCols - 1);
    // this._h = heights.reduce((acc, height) => acc += height, 0) + this.gapY * (numRows - 1);

    // reverse columns. direction property overrides canvas dir
    let dir = getCanvas().dir;
    let rtl = (dir === 'rtl' && !this.dir) || this.dir === 'rtl';
    this._rtl = rtl;
    if (rtl) {
      this._g = grid.map(row => row.reverse());
      this._cw = colWidths.reverse();
    }
  }

  /**
   * Calculate the position of each child
   */
  _cp() {
    let topLeftY = 0;
    let rendered = [];

    let colWidths = this._cw;
    let rowHeights = this._rh;
    let gapX = this.gapX;
    let gapY = this.gapY;

    if (this.scale) {
      colWidths = colWidths.map(width => width * this.scaleX);
      rowHeights = rowHeights.map(height => height * this.scaleY);
      gapX *= this.scaleX;
      gapY *= this.scaleY;
    }

    this._g.map((gridRow, row) => {
      let topLeftX = 0;
      // let x = rtl && !this.parent
      //   ? canvas.width - (this.x + this._w * (1 - this.anchor.x * 2))
      //   : this.x;

      gridRow.map((child, col) => {
        // don't render the same child multiple times if it uses colSpan
        if (child && !rendered.includes(child)) {
          rendered.push(child);

          let justify = alignment[child.justifySelf || this.justify](this._rtl);
          let align = alignment[child.alignSelf || this.align]();

          let rowHeight = this._rh[row];

          let colSpan = child.colSpan || 1;
          let colWidth = colWidths[col];
          if (colSpan > 1 && col + colSpan <= this._nc) {
            for (let i = 1; i < colSpan; i++) {
              colWidth += colWidths[col + i] + gapX;
            }
          }

          let { x, y } = getRect(this);

          let pointX = x + colWidth * justify;
          let pointY = y + rowHeights[row] * align;

          let ptX;
          let ptY;
          let { width, height } = getRect(child);

          if (justify === 0) {
            ptX = pointX + width * child.anchor.x;
          }
          else if (justify === 0.5) {
            let sign = child.anchor.x < 0.5 ? -1 : child.anchor.x === 0.5 ? 0 : 1;
            ptX = pointX + sign * width * child.anchor.x;
          }
          else {
            ptX = pointX - (width * (1 - child.anchor.x));
          }

          if (align === 0) {
            ptY = pointY + height * child.anchor.y;
          }
          else if (align === 0.5) {
            let sign = child.anchor.y < 0.5 ? -1 : child.anchor.y === 0.5 ? 0 : 1;
            ptY = pointY + sign * height * child.anchor.y;
          }
          else {
            ptY = pointY - (height * (1 - child.anchor.y));
          }

          child.x = topLeftX + ptX;
          child.y = topLeftY + ptY;
        }

        topLeftX += colWidths[col] + gapX;
      });

      topLeftY += rowHeights[row] + gapY;
    });
  }
}

export default function factory() {
  return new GridManager(...arguments);
}
factory.prototype = GridManager.prototype;
factory.class = GridManager;