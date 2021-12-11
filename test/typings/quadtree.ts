import * as kontra from '../../kontra.js';

let quadtree: kontra.Quadtree = kontra.Quadtree();

let maxDepth: number = quadtree.maxDepth;
let maxObjects: number = quadtree.maxObjects;
let bounds: object = quadtree.bounds;

quadtree.clear();
let objs: object[] = quadtree.get({x: 10, y: 20, width: 100, height: 100});
quadtree.get(kontra.Sprite());

let obj = { x: 1, y: 2, width: 3, height: 4 };

quadtree.add(obj);
quadtree.add(obj, kontra.Sprite());
quadtree.add([obj, kontra.Sprite()]);

// options
kontra.Quadtree({
  maxDepth: 1,
  maxObjects: 10,
  bounds: {
    x: 10,
    y: 20,
    width: 100,
    height: 100
  }
});

// extends
class CustomQuadtree extends kontra.QuadtreeClass {}
let myQuadtree = new CustomQuadtree();
myQuadtree.get(kontra.Sprite());