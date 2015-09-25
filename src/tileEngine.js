var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberof kontra
   *
   * @see kontra.tileEngine.prototype.init for list of parameters.
   */
  kontra.tileEngine = function(properties) {
    var tileEngine = Object.create(kontra.tileEngine.prototype);
    tileEngine.init(properties);

    return tileEngine;
  };

  kontra.tileEngine.prototype = {
    /**
     * Initialize properties on the tile engine.
     * @memberof kontra.tileEngine
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
    init: function init(properties) {
      properties = properties || {};

      var _this = this;

      // size of the map (in tiles)
      if (!properties.width || !properties.height) {
        var error = new ReferenceError('Required parameters not found');
        kontra.logError(error, 'You must provide width and height of the map to create a tile engine.');
        return;
      }

      _this.width = properties.width;
      _this.height = properties.height;

      // size of the tiles. Most common tile size on opengameart.org seems to be 32x32,
      // followed by 16x16
      _this.tileWidth = properties.tileWidth || 32;
      _this.tileHeight = properties.tileHeight || 32;

      _this.context = properties.context || kontra.context;

      _this.canvasWidth = _this.context.canvas.width;
      _this.canvasHeight = _this.context.canvas.height;

      // create an off-screen canvas for pre-rendering the map
      // @see http://jsperf.com/render-vs-prerender
      _this._offscreenCanvas = document.createElement('canvas');
      _this._offscreenContext = _this._offscreenCanvas.getContext('2d');

      // make the off-screen canvas the full size of the map
      _this._offscreenCanvas.width = _this.mapWidth = _this.width * _this.tileWidth;
      _this._offscreenCanvas.height = _this.mapHeight = _this.height * _this.tileHeight;

      // when clipping an image, sx and sy must within the image region, otherwise
      // Firefox and Safari won't draw it.
      // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
      _this.sxMax = _this.mapWidth - _this.canvasWidth;
      _this.syMax = _this.mapHeight - _this.canvasHeight;

      _this.layers = {};

      // draw order of layers (by name)
      _this._layerOrder = [];

      // each tileset will hold the first and the last grid as well as the image for the tileset
      _this.tilesets = [];

      _this.x = properties.x || 0;
      _this.y = properties.y || 0;
      _this.sx = properties.sx || 0;
      _this.sy = properties.sy || 0;
    },

    /**
     * Add an tileset for the tile engine to use.
     * @memberof kontra.tileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string|Image|Canvas} properties.image - Path to the image or Image object.
     * @param {number} properties.firstGrid - The first tile grid to start the image.
     */
    addTileset: function addTileset(properties) {
      properties = properties || {};

      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        var image = properties.image;
        var firstGrid = properties.firstGrid;
        var numTiles = (image.width / this.tileWidth | 0) * (image.height / this.tileHeight | 0);

        if (!firstGrid) {
          // only calculate the first grid if the tile map has a tileset already
          if (this.tilesets.length > 0) {
            var lastTileset = this.tilesets[this.tilesets.length - 1];
            var tiles = (lastTileset.image.width / this.tileWidth | 0) *
                        (lastTileset.image.height / this.tileHeight | 0);

            firstGrid = lastTileset.firstGrid + tiles - 1;
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
        kontra.logError(error, 'You must provide an Image for the tile engine.');
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
     * @param {number} properties.zIndex - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     */
    addLayer: function addLayer(properties) {
      properties = properties || {};
      properties.render = (properties.render === undefined ? true : properties.render);

      var _this = this;
      var data;

      // flatten a 2D array into a single array
      if (kontra.isArray(properties.data[0])) {
        data = [];

        for (var r = 0, row; row = properties.data[r]; r++) {
          for (var c = 0, length = row.length; c < length; c++) {
            data.push(row[c]);
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
          return _this.layers[a].zIndex - _this.layers[b].zIndex;
        });

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
      // handle non-kontra.sprite objects as well as kontra.sprite objects
      var x = (object.x !== undefined ? object.x : object.position.x);
      var y = (object.y !== undefined ? object.y : object.position.y);

      // calculate all tiles that the object can collide with
      var row = this._getRow(y);
      var col = this._getCol(x);

      var endRow = this._getRow(y + object.height);
      var endCol = this._getCol(x + object.width);

      // check all tiles
      var index;
      for (var r = row; r <= endRow; r++) {
        for (var c = col; c <= endCol; c++) {
          index = c + r * this.width;

          if (this.layers[name][index]) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Get the tile from the specified layer at x, y.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer.
     * @param {number} x - X coordinate of the tile.
     * @param {number} y - Y coordinate of the tile.
     *
     * @returns {number}
     */
    tileAtLayer: function tileAtLayer(name, x, y) {
      var row = this._getRow(y);
      var col = this._getCol(x);
      var index = col + row * this.width;

      return this.layers[name][index];
    },

    /**
     * Render the pre-rendered canvas.
     * @memberof kontra.tileEngine
     */
    render: function render() {
      var _this = this;

      // ensure sx and sy are within the image region
      _this.sx = Math.min( Math.max(_this.sx, 0), _this.sxMax );
      _this.sy = Math.min( Math.max(_this.sy, 0), _this.syMax );

      _this.context.drawImage(
        _this._offscreenCanvas,
        _this.sx, _this.sy, _this.canvasWidth, _this.canvasHeight,
        _this.x, _this.y, _this.canvasWidth, _this.canvasHeight
      );
    },

    /**
     * Render a specific layer.
     * @memberof kontra.tileEngine
     *
     * @param {string} name - Name of the layer to render.
     */
    renderLayer: function renderLayer(name) {
      var _this = this;

      var layer = _this.layers[name];

      // calculate the starting tile
      var row = _this._getRow();
      var col = _this._getCol();
      var index = col + row * _this.width;

      // calculate where to start drawing the tile relative to the drawing canvas
      var startX = col * _this.tileWidth - _this.sx;
      var startY = row * _this.tileHeight - _this.sy;

      // calculate how many tiles the drawing canvas can hold
      var viewWidth = Math.ceil(_this.canvasWidth / _this.tileWidth) + 1;
      var viewHeight = Math.ceil(_this.canvasHeight / _this.tileHeight) + 1;
      var numTiles = viewWidth * viewHeight;

      var count = 0;
      var x, y, tile, tileset, image, tileOffset, width, sx, sy;

      // draw just enough of the layer to fit inside the drawing canvas
      while (count < numTiles) {
        tile = layer[index];

        if (tile) {
          tileset = _this._getTileset(tile);
          image = tileset.image;

          x = startX + (count % viewWidth) * _this.tileWidth;
          y = startY + (count / viewWidth | 0) * _this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / _this.tileWidth;

          sx = (tileOffset % width) * _this.tileWidth;
          sy = (tileOffset / width | 0) * _this.tileHeight;

          _this.context.drawImage(
            image,
            sx, sy, _this.tileWidth, _this.tileHeight,
            x, y, _this.tileWidth, _this.tileHeight
          );
        }

        if (++count % viewWidth === 0) {
          index = col + (++row * _this.width);
        }
        else {
          index++;
        }
      }
    },

    /**
     * Get the row from the y coordinate.
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} y - Y coordinate.
     *
     * @return {number}
     */
    _getRow: function getRow(y) {
      y = y || 0;

      return (this.sy + y) / this.tileHeight | 0;
    },

    /**
     * Get the col from the x coordinate.
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} x - X coordinate.
     *
     * @return {number}
     */
    _getCol: function getCol(x) {
      x = x || 0;

      return (this.sx + x) / this.tileWidth | 0;
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
        else if (currTile < tile) {
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
      var _this = this;
      var tile, tileset, image, x, y, sx, sy, tileOffset, width;

      // draw each layer in order
      for (var i = 0, layer; layer = _this.layers[_this._layerOrder[i]]; i++) {
        for (var j = 0, len = layer.length; j < len; j++) {
          tile = layer[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          tileset = _this._getTileset(tile);
          image = tileset.image;

          x = (j % _this.width) * _this.tileWidth;
          y = (j / _this.width | 0) * _this.tileHeight;

          tileOffset = tile - tileset.firstGrid;
          width = image.width / _this.tileWidth;

          sx = (tileOffset % width) * _this.tileWidth;
          sy = (tileOffset / width | 0) * _this.tileHeight;

          _this._offscreenContext.drawImage(
            image,
            sx, sy, _this.tileWidth, _this.tileHeight,
            x, y, _this.tileWidth, _this.tileHeight
          );
        }
      }
    }
  };

  return kontra;
})(kontra || {}, Math);