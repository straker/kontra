import { getCanvas } from './core.js'

/**
 * Determine which subnodes the object intersects with
 *
 * @param {object} object - Object to check.
 * @param {object} bounds - Bounds of the quadtree.
 *
 * @returns {number[]} List of all subnodes object intersects.
 */
function getIndices(object, bounds) {
  let indices = [];

  let verticalMidpoint = bounds.x + bounds.width / 2;
  let horizontalMidpoint = bounds.y + bounds.height / 2;

  // save off quadrant checks for reuse
  let intersectsTopQuadrants = object.y < horizontalMidpoint && object.y + object.height >= bounds.y;
  let intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint && object.y < bounds.y + bounds.height;

  // object intersects with the left quadrants
  if (object.x < verticalMidpoint && object.x + object.width >= bounds.x) {
    if (intersectsTopQuadrants) {  // top left
      indices.push(0);
    }

    if (intersectsBottomQuadrants) {  // bottom left
      indices.push(2);
    }
  }

  // object intersects with the right quadrants
  if (object.x + object.width >= verticalMidpoint && object.x < bounds.x + bounds.width) {  // top right
    if (intersectsTopQuadrants) {
      indices.push(1);
    }

    if (intersectsBottomQuadrants) {  // bottom right
      indices.push(3);
    }
  }

  return indices;
}

class Quadtree {
  /**
   * A quadtree for 2D collision checking. The quadtree acts like an object pool in that it
   * will create subnodes as objects are needed but it won't clean up the subnodes when it
   * collapses to avoid garbage collection.
   *
   * @param {object} properties - Properties of the quadtree.
   * @param {number} [properties.maxDepth=3] - Maximum node depths the quadtree can have.
   * @param {number} [properties.maxObjects=25] - Maximum number of objects a node can support before splitting.
   * @param {object} [properties.bounds] - The 2D space this node occupies.
   * @param {object} [properties.parent] - Private. The node that contains this node.
   * @param {number} [properties.depth=0] - Private. Current node depth.
   *
   * The quadrant indices are numbered as follows (following a z-order curve):
   *     |
   *  0  |  1
   * ----+----
   *  2  |  3
   *     |
   */
  constructor({maxDepth = 3, maxObjects = 25, bounds, parent, depth = 0} = {}) {
    this.maxDepth = maxDepth;
    this.maxObjects = maxObjects;

    // since we won't clean up any subnodes, we need to keep track of which nodes are
    // currently the leaf node so we know which nodes to add objects to
    // b = branch, d = depth, p = parent
    this._b = false;
    this._d = depth;
    /* @if VISUAL_DEBUG */
    this._p = parent;
    /* @endif */

    let canvas = getCanvas();
    this.bounds = bounds || {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };

    this.objects = []
    this.subnodes = [];
  }

  /**
   * Clear the quadtree
   */
  clear() {
    this.subnodes.map(function(subnode) {
      subnode.clear();
    });

    this._b = false;
    this.objects.length = 0;
  }

  /**
   * Find the leaf node the object belongs to and get all objects that are part of
   * that node.
   *
   * @param {object} object - Object to use for finding the leaf node.
   *
   * @returns {object[]} A list of objects in the same leaf node as the object.
   */
  get(object) {
    let objects = [];
    let indices, i;

    // traverse the tree until we get to a leaf node
    while (this.subnodes.length && this._b) {
      indices = getIndices(object, this.bounds);

      for (i = 0; i < indices.length; i++) {
        objects.push.apply(objects, this.subnodes[ indices[i] ].get(object));
      }

      return objects;
    }

    return this.objects;
  }

  /**
   * Add an object to the quadtree. Once the number of objects in the node exceeds
   * the maximum number of objects allowed, it will split and move all objects to their
   * corresponding subnodes.
   *
   * @param {...object|object[]} Objects to add to the quadtree
   *
   * @example
   * quadtree().add({id:1}, {id:2}, {id:3});
   * quadtree().add([{id:1}, {id:2}], {id:3});
   */
  add() {
    let i, j, object, obj, indices, index;

    for (j = 0; j < arguments.length; j++) {
      object = arguments[j];

      // add a group of objects separately
      if (Array.isArray(object)) {
        this.add.apply(this, object);

        continue;
      }

      // current node has subnodes, so we need to add this object into a subnode
      if (this._b) {
        this._a(object);

        continue;
      }

      // this node is a leaf node so add the object to it
      this.objects.push(object);

      // split the node if there are too many objects
      if (this.objects.length > this.maxObjects && this._d < this.maxDepth) {
        this._s();

        // move all objects to their corresponding subnodes
        for (i = 0; (obj = this.objects[i]); i++) {
          this._a(obj);
        }

        this.objects.length = 0;
      }
    }
  }

  /**
   * Add an object to a subnode.
   *
   * @param {object} object - Object to add into a subnode
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  _a(object, indices, i) {
    indices = getIndices(object, this.bounds);

    // add the object to all subnodes it intersects
    for (i = 0; i < indices.length; i++) {
      this.subnodes[ indices[i] ].add(object);
    }
  }

  /**
   * Split the node into four subnodes.
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  _s(subWidth, subHeight, i) {
    this._b = true;

    // only split if we haven't split before
    if (this.subnodes.length) {
      return;
    }

    subWidth = this.bounds.width / 2 | 0;
    subHeight = this.bounds.height / 2 | 0;

    for (i = 0; i < 4; i++) {
      this.subnodes[i] = quadtreeFactory({
        bounds: {
          x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
          y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
          width: subWidth,
          height: subHeight
        },
        depth: this._d+1,
        maxDepth: this.maxDepth,
        maxObjects: this.maxObjects,
        /* @if VISUAL_DEBUG */
        parent: this
        /* @endif */
      });
    }
  }

  /**
   * Draw the quadtree. Useful for visual debugging.
   */
   /* @if VISUAL_DEBUG **
   render() {
     // don't draw empty leaf nodes, always draw branch nodes and the first node
     if (this.objects.length || this._d === 0 ||
         (this._p && this._p._b)) {

       context.strokeStyle = 'red';
       context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

       if (this.subnodes.length) {
         for (let i = 0; i < 4; i++) {
           this.subnodes[i].render();
         }
       }
     }
   }
   /* @endif */
}

export default function quadtreeFactory(properties) {
  return new Quadtree(properties);
}
quadtreeFactory.prototype = Quadtree.prototype;