import * as kontra from '../../kontra.js';

let quadtree: kontra.Quadtree = kontra.Quadtree();

let maxDepth: number = quadtree.maxDepth;
let maxObjects: number = quadtree.maxObjects;
let bounds: object = quadtree.bounds;

quadtree.clear();
let objs: object[] = quadtree.get({x: 10, y: 20, width: 100, height: 100});
quadtree.get(kontra.Sprite());

quadtree.add({x: 1});
quadtree.add({x: 1}, {x: 2});
quadtree.add({x: 1}, [{x: 1}, {x: 2}]);

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