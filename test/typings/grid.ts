import * as kontra from '../../kontra.js';

let grid = kontra.Grid();

let flow: string = grid.flow;
let align: string = grid.align;
let justify: string = grid.justify;
let colGap: number | number[] = grid.colGap;
let rowGap: number | number[] = grid.rowGap;
let numRows: number = grid.numRows;
let dir: string = grid.dir;
let breakpoints: {metric: Function, callback: Function}[] = grid.breakpoints;

grid.destroy();

// inheritance
grid.x += 20;
grid.rotation = Math.PI;
grid.advance();
grid.render();

// options
kontra.Grid({
  flow: 'grid',
  align: 'center',
  justify: 'center',
  colGap: 10,
  rowGap: 10,
  numCols: 2,
  dir: 'rtl',
  breakpoints: [{
    metric() { return true },
    callback() { this.numCols = 1 }
  }]
});

// gap arrays
kontra.Grid({
  colGap: [10],
  rowGap: [10],
});