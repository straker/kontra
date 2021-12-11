import * as kontra from '../../kontra.js';

let tileEngine: kontra.TileEngine = kontra.TileEngine({
  tilewidth: 64,
  tileheight: 64,
  width: 9,
  height: 9,
  tilesets: [{
    firstgid: 1,
    image: new Image()
  }],
  layers: [{
    name: 'ground',
    data: [ 0,  0,  0,  0,  0,  0,  0,  0,  0,
            0,  0,  6,  7,  7,  8,  0,  0,  0,
            0,  6,  27, 24, 24, 25, 0,  0,  0,
            0,  23, 24, 24, 24, 26, 8,  0,  0,
            0,  23, 24, 24, 24, 24, 26, 8,  0,
            0,  23, 24, 24, 24, 24, 24, 25, 0,
            0,  40, 41, 41, 10, 24, 24, 25, 0,
            0,  0,  0,  0,  40, 41, 41, 42, 0,
            0,  0,  0,  0,  0,  0,  0,  0,  0 ]
  }]
});

let width: number = tileEngine.width;
let height: number = tileEngine.height;
let tilewidth: number = tileEngine.tilewidth;
let tileheight: number = tileEngine.tileheight;
let layers: object[] = tileEngine.layers;
let tilesets: object[] = tileEngine.tilesets;
let context: CanvasRenderingContext2D = tileEngine.context;
let mapwidth: number = tileEngine.mapwidth;
let mapheight: number = tileEngine.mapheight;
let sx: number = tileEngine.sx;
let sy: number = tileEngine.sy;

tileEngine.render();
tileEngine.renderLayer('ground');
let collides: boolean = tileEngine.layerCollidesWith('ground', {x: 10, y: 20, height: 100, width: 100});
let collidesGameObject: boolean = tileEngine.layerCollidesWith('ground', kontra.GameObject());
let tileX: number = tileEngine.tileAtLayer('ground', {x: 50, y: 50});
let tileRow: number = tileEngine.tileAtLayer('ground', {row: 5, col: 5});
tileEngine.setTileAtLayer('ground', {x: 50, y: 50}, 2);
tileEngine.setTileAtLayer('ground', {row: 5, col: 5}, 2);
tileEngine.setLayer('ground', [1,2,0,0,0,5,6]);
tileEngine.add({});
tileEngine.add({}, {});
tileEngine.add([{}, {}]);
tileEngine.add(kontra.GameObject());
tileEngine.remove({});
tileEngine.remove({}, {});
tileEngine.remove([{}, {}]);
tileEngine.remove(kontra.GameObject());

// options
kontra.TileEngine({
  context: document.createElement('canvas').getContext('2d'),
  tilewidth: 64,
  tileheight: 64,
  width: 9,
  height: 9,
  tilesets: [{
    firstgid: 1,
    image: new Image()
  }],
  layers: [{
    name: 'ground',
    data: [ 0,  0,  0,  0,  0,  0,  0,  0,  0,
            0,  0,  6,  7,  7,  8,  0,  0,  0,
            0,  6,  27, 24, 24, 25, 0,  0,  0,
            0,  23, 24, 24, 24, 26, 8,  0,  0,
            0,  23, 24, 24, 24, 24, 26, 8,  0,
            0,  23, 24, 24, 24, 24, 24, 25, 0,
            0,  40, 41, 41, 10, 24, 24, 25, 0,
            0,  0,  0,  0,  40, 41, 41, 42, 0,
            0,  0,  0,  0,  0,  0,  0,  0,  0 ]
  }]
});