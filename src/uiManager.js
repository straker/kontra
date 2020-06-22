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

    // on('font', value => {
    //   // fs = font size
    //   this._fs = value;

    //   // b = breakpoint
    //   this.breakpoints.map(breakpoint => {
    //     if (breakpoint.metric(value) && this._b !== breakpoint) {
    //       this._b = breakpoint;
    //       breakpoint.callback.call(this);
    //     }
    //   });

    //   // give time for other text objects to change size first
    //   setTimeout(() => {
    //     this._d = true;
    //   }, 0);
    // });

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

    let numRows, rtl, columned, rowed, grided, children, gap, numCols;
    let grid = [];
    let colWidths = [];
    let rowHeights = [];

    let calculateSize = () => {
      columned = this.flow === 'column';
      rowed = this.flow === 'row';
      grided = this.flow === 'grid';

      children = this.children;
      gap = this.gap * this.scale.x
      numCols = columned
        ? 1
        : rowed
          ? children.length
          : this.numCols;
      numRows = Math.ceil(children.length / numCols);

      // direction property overrides canvas dir
      rtl = (canvas.dir === 'rtl' && !this.direction) || this.direction === 'rtl';

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

      // this.breakpoints.find(breakpoint => {
      //   if (breakpoint.size >= this._fs)  {

      //     calculateSize();
      //   }
      // });
    }

    calculateSize();

    // reverse columns
    if (rtl) {
      grid = grid.map(row => row.reverse());
      colWidths = colWidths.reverse();
    }

    let y = this.y;
    let topRightY = 0;
    grid.map((gridRow, row) => {
      // let x = this.x;
      let topRightX = 0;
      let x = rtl && !this.parent
        ? canvas.width - (this.x + this._w * (1 - this.anchor.x * 2))
        : this.x;

      gridRow.map((child, col) => {
        if (child) {

          let justify = alignment[child.justifySelf ? child.justifySelf : this.justify](rtl);
          let align = alignment[child.alignSelf ? child.alignSelf : this.align]();

          // colWidths[col] = canvas.width;
          // this._w = canvas.width;

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

        // child.x = colWidths[col] * justify;
        // child.y = rowHeights[row] * align;
        // child.anchor = { x: justify, y: align };
        // let nextCol = ((index + 1) % numCols);

        // x += colWidths[col] + gap;
        topRightX += colWidths[col] + gap;
      });

      topRightY += rowHeights[row] + gap;
      // y += rowHeights[row] + gap;
    });

    // i can simplify the entire logic if i treat the ui manager always as a grid
    // and treat flow=row as numCols=children.length and flow=column as
    // numCols=1

    // calculate width and height so we can set the children
    // let columned = this.flow === 'column';
    // let rowed = this.flow === 'row';
    // let grided = this.flow === 'grid';
    // let width = 0;
    // let height = 0;

    // // a grid of one column is just a column
    // if (grided && this.numCols === 1) {
    //   grided = false;
    //   columned = true;
    // }

    // this.children.map((child, index) => {
    //    // prerender children first
    //   if (child._p) {
    //     child._p();
    //   }

    //   if (columned) {
    //     width = Math.max(width, child.width);
    //     height += child.height + (index > 0 ? this.gap : 0);
    //   }
    //   else if (rowed) {
    //     width += child.width + (index > 0 ? this.gap : 0);
    //     height = Math.max(height, child.height);
    //   }
    //   else {
    //     width = Math.max(width, child.width);
    //     height = Math.max(height, child.height);
    //   }
    // });

    // // this._w = this._fw ? this._fw : width;
    // // this._h = this._fh ? this._fh : height;

    // let numCols = this.numCols;
    // while (grided && this.maxWidth && numCols && width * numCols > this.maxWidth) {
    //   numCols--;
    // }

    // let numRows = Math.ceil(this.children.length / numCols);

    // this._w = grided ? width * numCols : width;
    // this._h = grided ? height * numRows + this.gap * (numRows - 1) : height;

    // let canvas = getCanvas();

    // // direction property overrides canvas dir
    // let rtl = (canvas.dir === 'rtl' && !this.direction) || this.direction === 'rtl';

    // // calculate position, only take into account rtl if this is the topmost
    // // ui manager
    // let prevX = rtl && !this.parent
    //   ? canvas.width - (this.x + width * (1 - this.anchor.x * 2))
    //   : this.x;
    // let prevY = this.y;

    // let reversed = rtl && !columned;

    // // if we reversed a grid we need to start backwards on each row
    // let children = this.children;
    // if (reversed && grided) {
    //   children = [];
    //   let col = numCols - 1;
    //   let row = 0;
    //   let newRow = false;
    //   while (children.length < this.children.length + numCols) {
    //     let child = this.children[row * numCols + col] || {
    //       anchor: {}
    //     };
    //     children.push(child);

    //     col = newRow ? numCols - 1 : col - 1;
    //     row = newRow ? row + 1: row;
    //     newRow = col % numCols === 0;
    //   }

    //   reversed = false;
    // }

    // let length = children.length - 1;
    // let index = reversed ? length : 0;
    // let start = index;
    // for (; index >= 0 && index <= length; index += (reversed ? -1 : 1)) {
    //   let child = children[index];
    //   let justify = alignment[child.justifySelf ? child.justifySelf : this.justify](rtl);
    //   let align = alignment[child.alignSelf ? child.alignSelf : this.align]();

    //   child.x = prevX;
    //   child.y = prevY;
    //   child.anchor.x = child.anchor.y = 0;

    //   if (columned) {
    //     child.x += this._w * justify;
    //     child.anchor.x = justify;

    //     if (index !== start) {
    //       child.y += this.gap;
    //     }

    //     prevY = child.y + child.height;
    //   }
    //   else if (rowed) {
    //     child.y += this._h * align;
    //     child.anchor.y = align;

    //     if (index !== start) {
    //       child.x += this.gap;
    //     }

    //     prevX = child.x + child.width;
    //   }
    //   else {
    //     child.x += width * justify;
    //     child.anchor.x = justify;
    //     child.y += height * align;
    //     child.anchor.y = align;
    //     let nextCol = ((index + 1) % numCols);

    //     prevX = this.x + width * nextCol + this.gap * nextCol;
    //     prevY += nextCol === 0 ? height + this.gap : 0;
    //   }
    // }
  }
}

export default Factory(UIManager)