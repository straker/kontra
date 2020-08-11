import GameObject from './gameObject.js';

let handler = {
  set(obj, prop, value) {

    // don't set dirty for private properties
    if (!prop.startsWith('_')) {
      obj._d = true;
    }

    return Reflect.set(obj, prop, value);
  }
};

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

/**
 * Quickly and easily organize your UI elements into a grid. Works great for auto placing menu options without having to figure out the position for each one. Based on the concept of CSS Grid Layout.
 * @class Grid
 * @extends GameObject
 *
 * @param {Object} [properties] - Properties of the grid manager.
 * @param {String} [properties.flow='column'] - The flow of the grid.
 * @param {String} [properties.align='start'] - The vertical alignment of the grid.
 * @param {String} [properties.justify='start`] - The horizontal alignment of the grid.
 * @param {Number|Number[]} [properties.colGap=0] - The horizontal gap between each column in the grid.
 * @param {Number|Number[]} [properties.rowGap=0] - The vertical gap between each row in the grid.
 * @param {Number} [properties.numCols=1] - The number of columns in the grid. Only applies if the `flow` property is set to `grid`.
 * @param {String} [properties.dir=''] - The direction of the grid.
 * @param {{metric: Function, callback: Function}[]} [properties.breakpoints=[]] - How the grid should change based on different metrics.
 */
class Grid extends GameObject.class {
  /**
   * @docs docs/api_docs/grid.js
   */

  init({
    /**
     * How to organize all objects in the grid. Valid values are:
     *
     * - `column` - organize into a single column
     * - `row` - organize into a single row
     * - `grid` - organize into a grid with [numCols](/api/grid#numCols) number of columns
     * @memberof Grid
     * @property {String} flow
     */
    flow = 'column',

    /**
     * The vertical alignment of the grid. Valid values are:
     *
     * - `start` - align to the top of row
     * - `center` - align to the center of the row
     * - `end` - align to the the bottom of the row
     *
     * Additionally, each child of the grid can use the `alignSelf` property to change it's alignment in the grid.
     * @memberof Grid
     * @property {String} align
     */
    align = 'start',

    /**
     * The horizontal alignment of the grid. Valid values are:
     *
     * - `start` - align to the left of column
     * - `center` - align to the center of the column
     * - `end` - align to the the right of the column
     *
     * If the [dir](/api/grid#dir) property is set to `rtl`, then `start` and `end` are reversed.
     *
     * Additionally, each child of the grid can use the `justifySelf` property to change it's alignment in the grid.
     * @memberof Grid
     * @property {String} justify
     */
    justify = 'start',

    /**
     * The horizontal gap between each column in the grid.
     *
     * An array of numbers means the grid will set the gap between columns using the order of the array. For example, if the gap is set to be `[10, 5]`, then every odd column gap with use 10 and every even column gap will use 5.
     * @memberof Grid
     * @property {Number|Number[]} colGap
     */
    colGap = 0,

     /**
     * The vertical gap between each row in the grid.
     *
     * An array of numbers means the grid will set the gap between rows using the order of the array. For example, if the gap is set to be `[10, 5]`, then every odd row gap with use 10 and every even row gap will use 5.
     * @memberof Grid
     * @property {Number|Number[]} rowGap
     */
    rowGap = 0,

    /**
     * The number of columns in the grid. Only applies if the [flow](/api/grid#flow) property is set to `grid`.
     * @memberof Grid
     * @property {Number} numCols
     */
    numCols = 1,

    /**
     * The direction of the grid. Defaults to organizing the grid objects left-to-right, but if set to `rtl` then the grid is organized right-to-left.
     * @memberof Grid
     * @property {String} dir
     */
    dir = '',

    /**
     * How the grid should change based on different metrics. Based on the concept of CSS Media Queries so you can update how the grid organizes the objects when things change (such as the scale).
     *
     * Each object in the array uses the `metric()` function to determine when the breakpoint applies and the `callback()` function is called to change any properties of the grid.
     *
     * ```js
     * let { Grid } = kontra;
     *
     * let grid = Grid({
     *   breakpoints: [{
     *     metric() {
     *       return this.scaleX < 1
     *     },
     *     callback() {
     *       this.numCols = 1;
     *     }
     *   },
     *   {
     *     metric() {
     *       return this.scaleX >= 1
     *     },
     *     callback() {
     *       this.numCols = 2;
     *     }
     *   }]
     * });
     * ```
     * @memberof Grid
     * @property {{metric: Function, callback: Function}[]} breakpoints
     */
    breakpoints = [],

    ...props
  } = {}) {
    super.init({
      flow,
      align,
      justify,
      colGap,
      rowGap,
      numCols,
      dir,
      breakpoints,
      ...props
    });

    this._p();
    return new Proxy(this, handler);
  }

  addChild(child) {
    this._d = true;
    super.addChild(child);
  }

  removeChild(child) {
    this._d = true;
    super.removeChild(child);
  }

  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }

  /**
   * Call `destroy()` on all children.
   * @memberof Grid
   * @function destroy
   */
  destroy() {
    this.children.map(child => child.destroy && child.destroy());
  }

  /**
   * Build the grid and calculate its width and height
   */
  _p() {
    this._d = false;

    this.breakpoints.map(breakpoint => {
      // b = breakpoint
      if (breakpoint.metric.call(this) && this._b !== breakpoint) {
        this._b = breakpoint;
        breakpoint.callback.call(this);
      }
    });

    // g = grid, cw = colWidths, rh = rowHeights
    let grid = this._g = [];
    let colWidths = this._cw = [];
    let rowHeights = this._rh = [];
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

      // prerender child to get current width/height
      if (child._p) {
        child._p();
      }

      rowHeights[row] = Math.max(rowHeights[row] || 0, child.height);

      let spans = child.colSpan || 1;
      let colSpan = spans;
      do {
        colWidths[col] = Math.max(colWidths[col] || 0, child.width / colSpan);
        grid[row][col] = child;
      } while (colSpan + col++ <= numCols && --spans);

      if (col >= numCols) {
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

    let colGap = [].concat(this.colGap);
    let rowGap = [].concat(this.rowGap);

    this._w = colWidths.reduce((acc, width) => acc += width, 0);
    for (let i = 0; i < numCols - 1; i++) {
      this._w += colGap[i % colGap.length];
    }

    this._h = rowHeights.reduce((acc, height) => acc += height, 0);
    for (let i = 0; i < numRows - 1; i++) {
      this._h += rowGap[i % rowGap.length];
    }

    this._uw();

    // reverse columns. direction property overrides canvas dir
    let dir = this.context.canvas.dir;
    let rtl = (dir === 'rtl' && !this.dir) || this.dir === 'rtl';
    this._rtl = rtl;
    if (rtl) {
      this._g = grid.map(row => row.reverse());
      this._cw = colWidths.reverse();
    }

    let topLeftY = -this.anchor.y * this.height;
    let rendered = [];

    this._g.map((gridRow, row) => {
      let topLeftX = -this.anchor.x * this.width;

      gridRow.map((child, col) => {
        // don't render the same child multiple times if it uses colSpan
        if (child && !rendered.includes(child)) {
          rendered.push(child);

          let justify = alignment[child.justifySelf || this.justify](this._rtl);
          let align = alignment[child.alignSelf || this.align]();

          let colSpan = child.colSpan || 1;
          let colWidth = colWidths[col];
          if (colSpan > 1 && col + colSpan <= this._nc) {
            for (let i = 1; i < colSpan; i++) {
              colWidth += colWidths[col + i] + colGap[(col + i) % colGap.length];
            }
          }

          let pointX = colWidth * justify;
          let pointY = rowHeights[row] * align;
          let anchorX = 0;
          let anchorY = 0;
          let { width, height } = child;

          if (child.anchor) {
            anchorX = child.anchor.x;
            anchorY = child.anchor.y;
          }

          // calculate the x position based on the alignment and
          // anchor of the object
          if (justify === 0) {
            pointX = pointX + width * anchorX;
          }
          else if (justify === 0.5) {
            let sign = anchorX < 0.5 ? -1 : anchorX === 0.5 ? 0 : 1;
            pointX = pointX + sign * width * justify;
          }
          else {
            pointX = pointX - (width * (1 - anchorX));
          }

          // calculate the y position based on the justification and
          // anchor of the object
          if (align === 0) {
            pointY = pointY + height * anchorY;
          }
          else if (align === 0.5) {
            let sign = anchorY < 0.5 ? -1 : anchorY === 0.5 ? 0 : 1;
            pointY = pointY + sign * height * align;
          }
          else {
            pointY = pointY - (height * (1 - anchorY));
          }

          child.x = topLeftX + pointX;
          child.y = topLeftY + pointY;
        }

        topLeftX += colWidths[col] + colGap[col % colGap.length];
      });

      topLeftY += rowHeights[row] + rowGap[row % rowGap.length];
    });
  }
}

export default function factory() {
  return new Grid(...arguments);
}
factory.prototype = Grid.prototype;
factory.class = Grid;