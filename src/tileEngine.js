var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the tile engine.
   * @param {number} [properties.tileWidth=32] - Width of a tile.
   * @param {number} [properties.tileHeight=32] - Height of a tile.
   * @param {number} properties.width - Width of the map (in tiles).
   * @param {number} properties.height - Height of the map (in tiles).
   * @param {number} [properties.x=0] - X position to draw.
   * @param {number} [properties.y=0] - Y position to draw.
   * @param {number} [properties.sx=0] - X position to clip the tileset.
   * @param {number} [properties.sy=0] - Y position to clip the tileset.
   * @param {Context} [properties.context=kontra.context] - Provide a context for the tile engine to draw on.
   */
  kontra.tileEngine = function(properties) {
    var tileEngine = Object.create(kontra.tileEngine.prototype);
    tileEngine._init(properties);

    return tileEngine;
  };

  kontra.tileEngine.prototype = {
    /**
     * Initialize properties on the tile engine.
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {object} properties - Properties of the tile engine.
     * @param {number} [properties.tileWidth=32] - Width of a tile.
     * @param {number} [properties.tileHeight=32] - Height of a tile.
     * @param {number} properties.width - Width of the map (in tiles).
     * @param {number} properties.height - Height of the map (in tiles).
     * @param {number} [properties.x=0] - X position to draw.
     * @param {number} [properties.y=0] - Y position to draw.
     * @param {number} [properties.sx=0] - X position to clip the tileset.
     * @param {number} [properties.sy=0] - Y position to clip the tileset.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the tile engine to draw on.
     */
    _init: function init(properties) {
      properties = properties || {};

      // size of the map (in tiles)
      if (!properties.width || !properties.height) {
        var error = new ReferenceError('Required parameters not found');
        kontra._logError(error, 'You must provide width and height of the map to create a tile engine.');
        return;
      }

      this.width = properties.width;
      this.height = properties.height;

      // size of the tiles. Most common tile size on opengameart.org seems to be 32x32,
      // followed by 16x16
      this.tileWidth = properties.tileWidth || 32;
      this.tileHeight = properties.tileHeight || 32;

      this.context = properties.context || kontra.context;

      this.canvasWidth = this.context.canvas.width;
      this.canvasHeight = this.context.canvas.height;

      // create an off-screen canvas for pre-rendering the map
      // @see http://jsperf.com/render-vs-prerender
      this._offscreenCanvas = document.createElement('canvas');
      this._offscreenContext = this._offscreenCanvas.getContext('2d');

      // make the off-screen canvas the full size of the map
      this._offscreenCanvas.width = this.mapWidth = this.width * this.tileWidth;
      this._offscreenCanvas.height = this.mapHeight = this.height * this.tileHeight;

      // when clipping an image, sx and sy must within the image region, otherwise
      // Firefox and Safari won't draw it.
      // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
      this.sxMax = Math.max(0, this.mapWidth - this.canvasWidth);
      this.syMax = Math.max(0, this.mapHeight - this.canvasHeight);

      this.layers = {};

      // draw order of layers (by name)
      this._layerOrder = [];

      // each tileset will hold the first and the last grid as well as the image for the tileset
      this.tilesets = [];

      this.x = properties.x || 0;
      this.y = properties.y || 0;
      this.sx = properties.sx || 0;
      this.sy = properties.sy || 0;
    },

    /**
     * Add an tileset for the tile engine to use.
     * @memberof kontra.tileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {Image|Canvas} properties.image - Path to the image or Image object.
     * @param {number} properties.firstGrid - The first tile grid to start the image.
     */
    addTileset: function addTileset(properties) {
      properties = properties || {};

      if (kontra._isImage(properties.image) || kontra._isCanvas(properties.image)) {
        var image = properties.image;
        var firstGrid = properties.firstGrid;

        // if the width or height of the provided image is smaller than the tile size,
        // default calculation to 1
        var numTiles = ( (image.width / this.tileWidth | 0) || 1 ) *
                       ( (image.height / this.tileHeight | 0) || 1 );

        if (!firstGrid) {
          // only calculate the first grid if the tile map has a tileset already
          if (this.tilesets.length > 0) {
            var lastTileset = this.tilesets[this.tilesets.length - 1];
            var tiles = (lastTileset.image.width / this.tileWidth | 0) *
                        (lastTileset.image.height / this.tileHeight | 0);

            firstGrid = lastTileset.firstGrid + tiles;
          }
          // otherwise this is the first tile added to the tile map
          else {
            firstGrid = 1;
          }
        }

        this.tilesets.push({
          firstGrid: firstGrid,
          lastGrid: firstGrid + numTiles - 1,
          image: image
        });

        // sort the tile map so we can perform a binary search when drawing
        this.tilesets.sort(function(a, b) {
          return a.firstGrid - b.firstGrid;
        });
      }
      else {
        var error = new SyntaxError('Invalid image.');
        kontra._logError(error, 'You must provide an Image for the tile engine.');
        return;
      }
    },

    /**
     * Add a layer to the tile engine.
     * @memberof kontra.tileEngine
     *
     * @param {object} properties - Properties of the layer to add.
     * @param {string} properties.name - Name of the layer.
     * @param {number[]} properties.data - Tile layer data.
     * @param {boolean} [properties.render=true] - If the layer should be drawn.
     * @param {number} [properties.zIndex] - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     */
    addLayer: function addLayer(properties) {
      properties = properties || {};
      properties.render = (properties.render === undefined ? true : properties.render);

      var data;

      // flatten a 2D array into a single array
      if (Array.isArray(properties.data[0])) {
        data = [];

        for (var r = 0, row; row = properties.data[r]; r++) {
          for (var c = 0; c < this.width; c++) {
            data.push(row[c] || 0);
          }
        }
      }
      else {
        data = properties.data;
      }

      this.layers[properties.name] = data;
      this.layers[properties.name].zIndex = properties.zIndex || 0;
      this.layers[properties.name].render = properties.render;

      // only add the layer to the layer order if it should be drawn
      if (properties.render) {
        this._layerOrder.push(properties.name);

        this._layerOrder.sort(function(a, b) {
          return this.layers[a].zIndex - this.layers[b].zIndex;
        }.bind(this));

        this._preRenderImage();
      }
    },

    /**
     * Simple bounding box collision test for layer tiles.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer.
     * @param {object} object - Object to check collision against.
     * @param {number} object.x - X coordinate of the object.
     * @param {number} object.y - Y coordinate of the object.
     * @param {number} object.width - Width of the object.
     * @param {number} object.height - Height of the object.
     *
     * @returns {boolean} True if the object collides with a tile, false otherwise.
     */
    layerCollidesWith: function layerCollidesWith(name, object) {
      // calculate all tiles that the object can collide with
      var row = this.getRow(object.y);
      var col = this.getCol(object.x);

      var endRow = this.getRow(object.y + object.height);
      var endCol = this.getCol(object.x + object.width);

      // check all tiles
      var index;
      for (var r = row; r <= endRow; r++) {
        for (var c = col; c <= endCol; c++) {
          index = this._getIndex({row: r, col: c});

          if (this.layers[name][index]) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Get the tile from the specified layer at x, y or row, col.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer.
     * @param {object} position - Position of the tile in either x, y or row, col.
     * @param {number} position.x - X coordinate of the tile.
     * @param {number} position.y - Y coordinate of the tile.
     * @param {number} position.row - Row of the tile.
     * @param {number} position.col - Col of the tile.
     *
     * @returns {number}
     */
    tileAtLayer: function tileAtLayer(name, position) {
      var index = this._getIndex(position);

      if (index >= 0) {
        return this.layers[name][index];
      }
    },

    /**
     * Render the pre-rendered canvas.
     * @memberof kontra.tileEngine
     */
    render: function render() {
      // ensure sx and sy are within the image region
      this.sx = Math.min( Math.max(this.sx, 0), this.sxMax );
      this.sy = Math.min( Math.max(this.sy, 0), this.syMax );

      this.context.drawImage(
        this._offscreenCanvas,
        this.sx, this.sy, this.canvasWidth, this.canvasHeight,
        this.x, this.y, this.canvasWidth, this.canvasHeight
      );
    },

    /**
     * Render a specific layer.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer to render.
     */
    renderLayer: function renderLayer(name) {
      var layer = this.layers[name];

      // calculate the starting tile
      var row = this.getRow();
      var col = this.getCol();
      var index = this._getIndex({row: row, col: col});

      // calculate where to start drawing the tile relative to the drawing canvas
      var startX = col * this.tileWidth - this.sx;
      var startY = row * this.tileHeight - this.sy;

      // calculate how many tiles the drawing canvas can hold
      var viewWidth = Math.min(Math.ceil(this.canvasWidth / this.tileWidth) + 1, this.width);
      var viewHeight = Math.min(Math.ceil(this.canvasHeight / this.tileHeight) + 1, this.height);
      var numTiles = viewWidth * viewHeight;

      var count = 0;
      var x, y, tile, tileset, image, tileOffset, width, sx, sy;

      // draw just enough of the layer to fit inside the drawing canvas
      while (count < numTiles) {
        tile = layer[index];

        if (tile) {
          tileset = this._getTileset(tile);
          image = tileset.image;

          x = startX + (count % viewWidth) * this.tileWidth;
          y = startY + (count / viewWidth | 0) * this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / this.tileWidth;

          sx = (tileOffset % width) * this.tileWidth;
          sy = (tileOffset / width | 0) * this.tileHeight;

          this.context.drawImage(
            image,
            sx, sy, this.tileWidth, this.tileHeight,
            x, y, this.tileWidth, this.tileHeight
          );
        }

        if (++count % viewWidth === 0) {
          index = col + (++row * this.width);
        }
        else {
          index++;
        }
      }
    },

    /**
     * Get the row from the y coordinate.
     * @memberof kontra.tileEngine
     *
     * @param {number} y - Y coordinate.
     *
     * @return {number}
     */
    getRow: function getRow(y) {
      y = y || 0;

      return (this.sy + y) / this.tileHeight | 0;
    },

    /**
     * Get the col from the x coordinate.
     * @memberof kontra.tileEngine
     *
     * @param {number} x - X coordinate.
     *
     * @return {number}
     */
    getCol: function getCol(x) {
      x = x || 0;

      return (this.sx + x) / this.tileWidth | 0;
    },

    /**
     * Get the index of the x, y or row, col.
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} position.x - X coordinate of the tile.
     * @param {number} position.y - Y coordinate of the tile.
     * @param {number} position.row - Row of the tile.
     * @param {number} position.col - Col of the tile.
     *
     * @return {number} Returns the tile index or -1 if the x, y or row, col is outside the dimensions of the tile engine.
     */
    _getIndex: function getIndex(position) {
      var row, col;

      if (typeof position.x !== 'undefined' && typeof position.y !== 'undefined') {
        row = this.getRow(position.y);
        col = this.getCol(position.x);
      }
      else {
        row = position.row;
        col = position.col;
      }

      // don't calculate out of bound numbers
      if (row < 0 || col < 0 || row >= this.height || col >= this.width) {
        return -1;
      }

      return col + row * this.width;
    },

    /**
     * Modified binary search that will return the tileset associated with the tile
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} tile - Tile grid.
     *
     * @return {object}
     */
    _getTileset: function getTileset(tile) {
      var min = 0;
      var max = this.tilesets.length - 1;
      var index;
      var currTile;

      while (min <= max) {
        index = (min + max) / 2 | 0;
        currTile = this.tilesets[index];

        if (tile >= currTile.firstGrid && tile <= currTile.lastGrid) {
          return currTile;
        }
        else if (currTile.lastGrid < tile) {
          min = index + 1;
        }
        else {
          max = index - 1;
        }
      }
    },

    /**
     * Pre-render the tiles to make drawing fast.
     * @memberof kontra.tileEngine
     * @private
     */
    _preRenderImage: function preRenderImage() {
      var tile, tileset, image, x, y, sx, sy, tileOffset, width;

      // draw each layer in order
      for (var i = 0, layer; layer = this.layers[this._layerOrder[i]]; i++) {
        for (var j = 0, len = layer.length; j < len; j++) {
          tile = layer[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          tileset = this._getTileset(tile);
          image = tileset.image;

          x = (j % this.width) * this.tileWidth;
          y = (j / this.width | 0) * this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / this.tileWidth;

          sx = (tileOffset % width) * this.tileWidth;
          sy = (tileOffset / width | 0) * this.tileHeight;

          this._offscreenContext.drawImage(
            image,
            sx, sy, this.tileWidth, this.tileHeight,
            x, y, this.tileWidth, this.tileHeight
          );
        }
      }
    }
  };

  return kontra;
})(kontra || {}, Math);