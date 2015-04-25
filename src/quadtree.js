/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A quadtree for 2D collision checking. The quadtree acts like an object pool in that it
   * will create subnodes as objects are needed but it won't clean up the subnodes when it
   * collapses to avoid garbage collection.
   * @memberOf kontra
   *
   * @see kontra.quadtree._proto.set for list of parameters.
   *L
   * The quadrant indices are numbered as follows (following a z-order curve):
   *     |
   *  0  |  1
   * ----+----
   *  2  |  3
   *     |
   */
  kontra.quadtree = function(properties) {
    var quadtree = Object.create(kontra.quadtree._proto);
    quadtree.set(properties);

    return quadtree;
  };

  kontra.quadtree._proto = {
    /**
     * Set properties on the quadtree.
     * @memberOf kontra.quadtree
     *
     * @param {number} [depth=0] - Current node depth.
     * @param {number} [maxDepth=3] - Maximum node depths the quadtree can have.
     * @param {number} [maxObjects=25] - Maximum number of objects a node can support before splitting.
     * @param {object} [parentNode] - The node that contains this node.
     * @param {object} [bounds] - The 2D space this node occupies.
     */
    set: function set(properties) {
      properties = properties || {};

      this.depth = properties.depth || 0;
      this.maxDepth = properties.maxDepth || 3;
      this.maxObjects = properties.maxObjects || 25;

      // since we won't clean up any subnodes, we need to keep track of which nodes are
      // currently the leaf node so we know which nodes to add objects to
      this.isBranchNode = false;

      this.parentNode = properties.parentNode;

      this.bounds = properties.bounds || {
        x: 0,
        y: 0,
        width: kontra.game.width,
        height: kontra.game.height
      };

      this.objects = [];
      this.subnodes = [];
    },

    /**
     * Clear the quadtree
     * @memberOf kontra.quadtree
     */
    clear: function clear() {
      if (this.isBranchNode) {
        for (var i = 0; i < 4; i++) {
          this.subnodes[i].clear();
        }
      }

      this.isBranchNode = false;
      this.objects.length = 0;
    },

    /**
     * Find the leaf node the object belongs to and get all objects that are part of
     * that node.
     * @memberOf kontra.quadtree
     *
     * @param {object} object - Object to use for finding the leaf node.
     *
     * @returns {object[]} A list of objects in the same leaf node as the object.
     */
    get: function get(object) {
      var node = this;
      var objects = [];
      var indices, index;

      // traverse the tree until we get to a leaf node
      while (node.subnodes.length && this.isBranchNode) {
        indices = this._getIndex(object);

        for (var i = 0, length = indices.length; i < length; i++) {
          index = indices[i];

          objects.push.apply(objects, this.subnodes[index].get(object));
        }

        return objects;
      }

      return node.objects;
    },

    /**
     * Add an object to the quadtree. Once the number of objects in the node exceeds
     * the maximum number of objects allowed, it will split and move all objects to their
     * corresponding subnodes.
     * @memberOf kontra.quadtree
     *
     * @param {object} obj - Objects to add to the quadtree.
     */
    add: function add(object) {
      var _this = this;
      var i, obj, indices, index;

      // add multiple objects separately
      if (kontra.isArray(object)) {
        for (i = 0; obj = object[i]; i++) {
          _this.add(obj);
        }

        return;
      }

      // current node has subnodes, so we need to add _this object into a subnode
      if (_this.subnodes.length && _this.isBranchNode) {
        _this._addToSubnode(object);

        return;
      }

      // _this node is a leaf node so add the object to it
      _this.objects.push(object);

      if (_this.parentNode) {
        _this.parentNode.numSubnodeObjects++;
      }

      // split the node if there are too many objects
      if (_this.objects.length > _this.maxObjects && _this.depth < _this.maxDepth) {
        _this._split();

        // move all objects to their corresponding subnodes
        for (i = 0; obj = _this.objects[i]; i++) {
          _this._addToSubnode(obj);
        }

        _this.objects.length = 0;
      }
    },

    /**
     * Add an object to a subnode.
     * @memberOf kontra.quadtree
     * @private
     *
     * @param {object} object - Object to add into a subnode
     */
    _addToSubnode: function _addToSubnode(object) {
      var indices = this._getIndex(object);

      // add the object to all subnodes it intersects
      for (var i = 0, length = indices.length; i < length; i++) {
        this.subnodes[ indices[i] ].add(object);
      }
    },

    /**
     * Determine which subnodes the object intersects with.
     * @memberOf kontra.quadtree
     * @private
     *
     * @param {object} object - Object to check.
     *
     * @returns {number[]} List of all subnodes object intersects.
     */
    _getIndex: function getIndex(object) {
      var indices = [];

      var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
      var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

      // handle non-kontra.sprite objects as well as kontra.sprite objects
      var x = (object.x !== undefined ? object.x : object.position.x);
      var y = (object.y !== undefined ? object.y : object.position.y);

      // save off quadrant checks for reuse
      var intersectsTopQuadrants = y < horizontalMidpoint && y + object.height >= this.bounds.y;
      var intersectsBottomQuadrants = y + object.height >= horizontalMidpoint && y < this.bounds.y + this.bounds.height;

      // object intersects with the left quadrants
      if (x < verticalMidpoint && x + object.width >= this.bounds.x) {
        if (intersectsTopQuadrants) {  // top left
          indices.push(0);
        }

        if (intersectsBottomQuadrants) {  // bottom left
          indices.push(2);
        }
      }

      // object intersects with the right quadrants
      if (x + object.width >= verticalMidpoint && x < this.bounds.x + this.bounds.width) {  // top right
        if (intersectsTopQuadrants) {
          indices.push(1);
        }

        if (intersectsBottomQuadrants) {  // bottom right
          indices.push(3);
        }
      }

      return indices;
    },

    /**
     * Split the node into four subnodes.
     * @memberOf kontra.quadtree
     * @private
     */
    _split: function split() {
      this.isBranchNode = true;

      // only split if we haven't split before
      if (this.subnodes.length) {
        return;
      }

      var subWidth = this.bounds.width / 2 | 0;
      var subHeight = this.bounds.height / 2 | 0;
      var x = this.bounds.x;
      var y = this.bounds.y;

      for (var i = 0; i < 4; i++) {
        this.subnodes[i] = kontra.quadtree({
          bounds: {
            x: x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
            y: y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
            width: subWidth,
            height: subHeight
          },
          depth: this.depth+1,
          maxDepth: this.maxDepth,
          maxObjects: this.maxObjects,
          parentNode: this
        });
      }
    },

    render: function() {
      if (this.objects.length || (this.parentNode && this.parentNode.isBranchNode) || this.depth === 0) {

        kontra.context.strokeStyle = 'red';
        kontra.context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        // kontra.context.fillStyle = 'black';
        // for (var i = 0; i < this.objects.length; i++) {
        //   var obj = this.objects[i];
        //   kontra.context.fillRect(obj.x, obj.y, obj.width, obj.height);
        // }

        if (this.subnodes.length) {
          for (var i = 0; i < 4; i++) {
            this.subnodes[i].render();
          }
        }
      }
    }
  };

  return kontra;
})(kontra || {});