/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A quadtree for 2D collision checking. All objects will be placed in leaf nodes of
   * the tree so that collision checks are faster. This will add multiple copies of the
   * same object to the tree if the object intersects multiple nodes.
   * @see http://stackoverflow.com/questions/4981866/quadtree-for-2d-collision-detection)
   * @memberOf kontra
   *
   * @see kontra.quadtree._proto.set for list of parameters.
   *
   * The quadrant indices are numbered as follows:
   *     |
   *  1  |  0
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
     * @param {number} [level=0] - Current node level.
     * @param {number} [maxLevels=5] - Maximum node levels the quadtree can have.
     * @param {number} [maxObjects=10] - Maximum number of objects a node can support before splitting.
     * @param {object} [bounds] - The 2D space this node occupies.
     */
    set: function set(properties) {
      properties = properties || {};

      this.level = properties.level || 0;
      this.maxLevels = properties.maxLevels || 5;
      this.maxObjects = properties.maxObjects || 10;

      this.bounds = properties.bounds || {
        x: 0,
        y: 0,
        width: kontra.game.width,
        height: kontra.game.height
      };

      this.objects = [];
      this.nodes = [];
    },

    /**
     * Clear the quadtree
     * @memberOf kontra.quadtree
     */
    clear: function clear() {
      this.nodes.length = 0;
      this.objects.length = 0;
    },

    /**
     * Find the leaf node the object belongs to and get all objects that are part of
     * the node.
     * @memberOf kontra.quadtree
     *
     * @param {object} object - Object to use for finding the leaf node.
     *
     * @returns {object[]} A list of objects in the same leaf node as the object.
     */
    get: function get(object) {
      var node = this;
      var index;

      // traverse the tree until we get to a leaf node
      while (node.nodes.length) {
        index = this._getIndex(object);

        node = node.nodes[index];
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
      var i, obj, indices, index;

      // add multiple objects separately
      if (kontra.isArray(object)) {
        for (i = 0; obj = object[i]; i++) {
          this.add(obj);
        }

        return;
      }

      // current node has subnodes, so we need to add this object into a subnode
      if (this.nodes.length) {
        this._addToSubnode(object);

        return;
      }

      // this node is a leaf node so add the object to it
      this.objects.push(object);

      // split the node if there are too many objects
      if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
        this._split();

        // move all objects to their corresponding subnodes
        for (i = 0; obj = this.objects[i]; i++) {
          this._addToSubnode(obj);
        }

        this.objects.length = 0;
      }
    },

    /**
     * Insert an object into a subnode
     * @memberOf kontra.quadtree
     * @private
     *
     * @param {object} object - Object to add into a subnode
     */
    _addToSubnode: function _addToSubnode(object) {
      var indices = this._getIndex(object);

      // add the object to all subnodes it intersects
      for (var i = 0, length = indices.length; i < length; i++) {
        this.nodes[ indices[i] ].add(object);
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

      // handle non-sprite objects as well as kontra.sprite objects
      var x = (object.x !== undefined ? object.x : object.position.x);
      var y = (object.y !== undefined ? object.y : object.position.y);

      // save off quadrant checks for reuse
      var intersectsTopQuadrants = y < horizontalMidpoint;
      var intersectsBottomQuadrants = y + object.height >= horizontalMidpoint;

      // object intersects with the left quadrants
      if (x < verticalMidpoint) {
        if (intersectsTopQuadrants) {  // top left
          indices.push(1);
        }

        if (intersectsBottomQuadrants) {  // bottom left
          indices.push(2);
        }
      }

      // object intersects with the right quadrants
      if (x + object.width >= verticalMidpoint) {  // top right
        if (intersectsTopQuadrants) {
          indices.push(0);
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
      var subWidth = this.bounds.width / 2 | 0;
      var subHeight = this.bounds.height / 2 | 0;

      for (var i = 0; i < 4; i++) {
        this.nodes[i] = kontra.quadtree({
          bounds: {
            x: this.bounds.x + (i % 3 === 0 ? subWidth : 0),  // nodes 0 and 3
            y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
            width: subWidth,
            height: subHeight
          },
          level: this.level+1,
          maxLevels: this.maxLevels,
          maxObjects: this.maxObjects
        });
      }
    },

  };

  return kontra;
})(kontra || {});