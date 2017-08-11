(function(kontra, Math, Array) {
  // save Math.min and Math.max to variable and use that instead

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
    properties = properties || {};

    // size of the map (in tiles)
    if (!properties.width || !properties.height) {
      throw Error('You must provide width and height properties');
    }

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
    function getIndex(position) {
      var row, col;

      if (typeof position.x !== 'undefined' && typeof position.y !== 'undefined') {
        row = tileEngine.getRow(position.y);
        col = tileEngine.getCol(position.x);
      }
      else {
        row = position.row;
        col = position.col;
      }

      // don't calculate out of bound numbers
      if (row < 0 || col < 0 || row >= height || col >= width) {
        return -1;
      }

      return col + row * width;
    }

    /**
     * Modified binary search that will return the tileset associated with the tile
     * @memberof kontra.tileEngine
     * @private
     *
     * @param {number} tile - Tile grid.
     *
     * @return {object}
     */
    function getTileset(tile) {
      var min = 0;
      var max = tileEngine.tilesets.length - 1;
      var index, currTile;

      while (min <= max) {
        index = (min + max) / 2 | 0;
        currTile = tileEngine.tilesets[index];

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
    }

    /**
     * Pre-render the tiles to make drawing fast.
     * @memberof kontra.tileEngine
     * @private
     */
    function preRenderImage() {
      var tile, tileset, image, x, y, sx, sy, tileOffset, w;

      // draw each layer in order
      for (var i = 0, layer; layer = tileEngine.layers[layerOrder[i]]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          tileset = getTileset(tile);
          image = tileset.image;

          x = (j % width) * tileWidth;
          y = (j / width | 0) * tileHeight;

          tileOffset = tile - tileset.firstGrid;
          w = image.width / tileWidth;

          sx = (tileOffset % w) * tileWidth;
          sy = (tileOffset / w | 0) * tileHeight;

          offscreenContext.drawImage(
            image,
            sx, sy, tileWidth, tileHeight,
            x, y, tileWidth, tileHeight
          );
        }
      }
    }

    var width = properties.width;
    var height = properties.height;

    // size of the tiles. Most common tile size on opengameart.org seems to be 32x32,
    // followed by 16x16
    // Tiled names the property tilewidth and tileheight
    var tileWidth = properties.tileWidth || properties.tilewidth || 32;
    var tileHeight = properties.tileHeight || properties.tileheight || 32;

    var mapWidth = width * tileWidth;
    var mapHeight = height * tileHeight;

    var context = properties.context || kontra.context;
    var canvasWidth = context.canvas.width;
    var canvasHeight = context.canvas.height;

    // create an off-screen canvas for pre-rendering the map
    // @see http://jsperf.com/render-vs-prerender
    var offscreenCanvas = document.createElement('canvas');
    var offscreenContext = offscreenCanvas.getContext('2d');

    // when clipping an image, sx and sy must within the image region, otherwise
    // Firefox and Safari won't draw it.
    // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
    var sxMax = Math.max(0, mapWidth - canvasWidth);
    var syMax = Math.max(0, mapHeight - canvasHeight);

    var _sx, _sy;

    // draw order of layers (by name)
    var layerOrder = [];

    var tileEngine = {
      width: width,
      height: height,

      tileWidth: tileWidth,
      tileHeight: tileHeight,

      context: context,

      x: properties.x || 0,
      y: properties.y || 0,

      tilesets: [],
      layers: {},

      /**
       * Add an tileset for the tile engine to use.
       * @memberof kontra.tileEngine
       *
       * @param {object|object[]} tileset - Properties of the image to add.
       * @param {Image|Canvas} tileset.image - Path to the image or Image object.
       * @param {number} tileset.firstGrid - The first tile grid to start the image.
       */
      addTilesets: function addTilesets(tilesets) {
        if (!Array.isArray(tilesets)) {
          tilesets = [tilesets]
        }

        tilesets.forEach(function(tileset) {
          var tilesetImage = tileset.image;
          var image, firstGrid, numTiles, lastTileset, tiles;

          if (kontra._isImage(tilesetImage)) {
            image = tilesetImage;
          }
          // see if the image path is in kontra.assets.images
          else if (kontra._isString(tilesetImage)) {
            var i = Infinity;

            while (i >= 0) {
              i = tilesetImage.lastIndexOf('/', i);
              var path = (i < 0 ? tilesetImage : tilesetImage.substr(i));

              if (kontra.assets.images[path]) {
                image = kontra.assets.images[path];
                break;
              }

              i--;
            }
          }

          if (!image) {
            throw Error('You must provide an Image for the tileset');
          }

          firstGrid = tileset.firstGrid;

          // if the width or height of the provided image is smaller than the tile size,
          // default calculation to 1
          numTiles = ( (image.width / tileWidth | 0) || 1 ) *
                         ( (image.height / tileHeight | 0) || 1 );

          if (!firstGrid) {
            // only calculate the first grid if the tile map has a tileset already
            if (tileEngine.tilesets.length > 0) {
              lastTileset = tileEngine.tilesets[tileEngine.tilesets.length - 1];
              tiles = (lastTileset.image.width / tileWidth | 0) *
                      (lastTileset.image.height / tileHeight | 0);

              firstGrid = lastTileset.firstGrid + tiles;
            }
            // otherwise this is the first tile added to the tile map
            else {
              firstGrid = 1;
            }
          }

          tileEngine.tilesets.push({
            firstGrid: firstGrid,
            lastGrid: firstGrid + numTiles - 1,
            image: image
          });

          // sort the tile map so we can perform a binary search when drawing
          tileEngine.tilesets.sort(function(a, b) {
            return a.firstGrid - b.firstGrid;
          });
        });
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
      addLayers: function addLayers(layers) {
        if (!Array.isArray(layers)) {
          layers = [layers]
        }

        layers.forEach(function(layer) {
          layer.render = (layer.render === undefined ? true : layer.render);

          var data, r, row, c, prop, value;

          // flatten a 2D array into a single array
          if (Array.isArray(layer.data[0])) {
            data = [];

            for (r = 0; row = layer.data[r]; r++) {
              for (c = 0; c < width; c++) {
                data.push(row[c] || 0);
              }
            }
          }
          else {
            data = layer.data;
          }

          tileEngine.layers[layer.name] = {
            data: data,
            zIndex: layer.zIndex || 0,
            render: layer.render
          };

          // merge properties of layer onto layer object
          for (prop in layer.properties) {
            value = layer.properties[prop];

            try {
              value = JSON.parse(value);
            }
            catch(e) {}

            tileEngine.layers[layer.name][prop] = value;
          }

          // only add the layer to the layer order if it should be drawn
          if (tileEngine.layers[layer.name].render) {
            layerOrder.push(layer.name);

            layerOrder.sort(function(a, b) {
              return tileEngine.layers[a].zIndex - tileEngine.layers[b].zIndex;
            });

          }
        });

        preRenderImage();
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
        var row = tileEngine.getRow(object.y);
        var col = tileEngine.getCol(object.x);

        var endRow = tileEngine.getRow(object.y + object.height);
        var endCol = tileEngine.getCol(object.x + object.width);

        // check all tiles
        var index;
        for (var r = row; r <= endRow; r++) {
          for (var c = col; c <= endCol; c++) {
            index = getIndex({row: r, col: c});

            if (tileEngine.layers[name].data[index]) {
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
        var index = getIndex(position);

        if (index >= 0) {
          return tileEngine.layers[name].data[index];
        }
      },

      /**
       * Render the pre-rendered canvas.
       * @memberof kontra.tileEngine
       */
      render: function render() {
        /* istanbul ignore next */
        tileEngine.context.drawImage(
          offscreenCanvas,
          tileEngine.sx, tileEngine.sy, canvasWidth, canvasHeight,
          tileEngine.x, tileEngine.y, canvasWidth, canvasHeight
        );
      },

      /**
       * Render a specific layer.
       * @memberof kontra.tileEngine
       *
       * @param {string} name - Name of the layer to render.
       */
      renderLayer: function renderLayer(name) {
        var layer = tileEngine.layers[name];

        // calculate the starting tile
        var row = tileEngine.getRow();
        var col = tileEngine.getCol();
        var index = getIndex({row: row, col: col});

        // calculate where to start drawing the tile relative to the drawing canvas
        var startX = col * tileWidth - tileEngine.sx;
        var startY = row * tileHeight - tileEngine.sy;

        // calculate how many tiles the drawing canvas can hold
        var viewWidth = Math.min(Math.ceil(canvasWidth / tileWidth) + 1, width);
        var viewHeight = Math.min(Math.ceil(canvasHeight / tileHeight) + 1, height);
        var numTiles = viewWidth * viewHeight;

        var count = 0;
        var x, y, tile, tileset, image, tileOffset, w, sx, sy;

        // draw just enough of the layer to fit inside the drawing canvas
        while (count < numTiles) {
          tile = layer.data[index];

          if (tile) {
            tileset = getTileset(tile);
            image = tileset.image;

            x = startX + (count % viewWidth) * tileWidth;
            y = startY + (count / viewWidth | 0) * tileHeight;

            tileOffset = tile - tileset.firstGrid;
            w = image.width / tileWidth;

            sx = (tileOffset % w) * tileWidth;
            sy = (tileOffset / w | 0) * tileHeight;

            tileEngine.context.drawImage(
              image,
              sx, sy, tileWidth, tileHeight,
              x, y, tileWidth, tileHeight
            );
          }

          if (++count % viewWidth === 0) {
            index = col + (++row * width);
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

        return (tileEngine.sy + y) / tileHeight | 0;
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

        return (tileEngine.sx + x) / tileWidth | 0;
      },

      get sx() {
        return _sx;
      },

      get sy() {
        return _sy;
      },

      // ensure sx and sy are within the image region
      set sx(value) {
        _sx = Math.min( Math.max(0, value), sxMax );
      },

      set sy(value) {
        _sy = Math.min( Math.max(0, value), syMax );
      },

      // expose properties for testing
      _layerOrder: layerOrder
    };

    // set here so we use setter function
    tileEngine.sx = properties.sx || 0;
    tileEngine.sy = properties.sy || 0;

    // make the off-screen canvas the full size of the map
    offscreenCanvas.width = mapWidth;
    offscreenCanvas.height = mapHeight;

    // merge properties of the tile engine onto the tile engine itself
    for (var prop in properties.properties) {
      var value = properties.properties[prop];

      try {
        value = JSON.parse(value);
      }
      catch(e) {}

      // passed in properties override properties.properties
      tileEngine[prop] = tileEngine[prop] || value;
    }

    if (properties.tilesets) {
      tileEngine.addTilesets(properties.tilesets);
    }

    if (properties.layers) {
      tileEngine.addLayers(properties.layers);
    }

    return tileEngine;
  };
})(kontra, Math, Array);