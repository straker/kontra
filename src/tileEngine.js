/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A tile engine for rendering tilesets. Works well with the tile engine program Tiled.
   * @memberof kontra
   * @constructor
   *
   * @param {object} properties - Configure the tile engine.
   * @param {number} properties.tileWidth - Width of the tile.
   * @param {number} properties.tileHeight - Height of the tile.
   * @param {number} properties.width - Width of the map (in tiles).
   * @param {number} properties.height - Height of the map (in tiles).
   * @param {Context} [properties.context=kontra.context] - Provide a context for the tile engine to draw on.
   */
   kontra.TileEngine = function TileEngine(properties) {
    properties = properties || {};

    var _this = this;

    // since the tile engine can have more than one image, each image must be associated
    // with a unique set of tiles. This array will hold a reference to the tileset image
    // that each tile belongs to for quick access when drawing (i.e. O(1))
    var tileIndex = [undefined];  // index 0 is always an empty tile

    // draw order of layers (by name)
    var layerOrder = [];

    // size of the tiles
    // most common tile size on opengameart.org seems to be 32x32, followed by 16x16
    this.tileWidth = properties.tileWidth || 32;
    this.tileHeight = properties.tileHeight || 32;

    // size of the map (in tiles)
    this.width = properties.width || kontra.canvas.width / this.tileWidth | 0;
    this.height = properties.height || kontra.canvas.height / this.tileHeight | 0;

    // create an off-screen canvas for pre-rendering the map
    // @see http://jsperf.com/render-vs-prerender
    var offScreenCanvas = document.createElement('canvas');
    var offScreenContext = offScreenCanvas.getContext('2d');

    offScreenCanvas.width = this.width * this.tileWidth;
    offScreenCanvas.height = this.height * this.tileHeight;

    this.context = properties.context || kontra.context;
    this.layers = {};
    this.images = [];

    /**
     * Add an image for the tile engine to use.
     * @memberof kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string} properties.name - Name of the image.
     * @param {string|Image|Canvas} properties.image - Path to the image or Image object.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    this.addImage = function TileEngineAddImage(properties) {
      properties = properties || {};

      if (kontra.isString(properties.image)) {
        kontra.loadImage(properties.image, properties.name).then(
          function loadImageSuccess(image) {
            associateImage({image: image, firstTile: properties.firstTile});
          }, function loadImageError(error) {
            console.error(error);
            return;
        });
      }
      else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        associateImage({image: properties.image, firstTile: properties.firstTile});
      }
    };

    /**
     * Remove an image from the tile engine.
     * @memberof kontra.TileEngine
     *
     * @param {string} name - Name of the image to remove.
     */
    this.removeImage = function TileEngineRemoveImage(name) {
      var image = kontra.assets[name];

      // unassociate image from tiles
      for (var i = image.firstTile, len = image.tileWidth * image.tileHeight; i <= len; i++) {
        tileIndex[i] = null;
      }

      for (var j = 0, img; img = this.images[j]; j++) {
        if (image === img) {
          this.images.splice(j, 1);
        }
      }
    };


    /**
     * Add a layer to the tile engine.
     * @memberof kontra.TileEngine
     *
     * @param {object} properties - Properties of the layer to add.
     * @param {string} properties.name - Name of the layer.
     * @param {number[]} properties.data - Tile layer data.
     * @param {number} properties.index - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     */
    this.addLayer = function TileEngineAddLayer(properties) {
      properties = properties || {};

      this.layers[properties.name] = {
        data: properties.data,
        index: properties.index
      };

      layerOrder.push(properties.name);

      layerOrder.sort(function(a, b) {
        return _this.layers[a].index - _this.layers[b].index;
      });

      preRenderImage();
    };

    /**
     * Remove a layer from the tile engine.
     * @memberof kontra.TileEngine
     *
     * @param {string} name - Name of the layer to remove.
     */
    this.removeLayer = function TileEngineRemoveLayer(name) {
      this.layers[name] = null;
    };

    /**
     * Draw the pre-rendered canvas.
     * @memberof kontra.TileEngine
     */
    this.draw = function TileEngineDraw() {
      this.context.drawImage(offScreenCanvas, 0, 0);
    };

    /**
     * Associate an image with its tiles.
     * @memberof kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    function associateImage(properties) {
      var image = properties.image;
      var firstTile = properties.firstTile || tileIndex.length;

      image.tileWidth = image.width / _this.tileWidth;
      image.tileHeight = image.height / _this.tileHeight;
      image.firstTile = firstTile;

      _this.images.push(image);

      // associate the new image tiles with the image
      for (var i = 0, len = image.tileWidth * image.tileHeight; i < len; i++) {
        // objects are just pointers so storing an object is only storing a pointer of 4 bytes,
        // which is the same as storing a number
        // @see http://stackoverflow.com/questions/4740593/how-is-memory-handled-with-javascript-objects
        // @see http://stackoverflow.com/questions/16888036/javascript-how-to-reduce-the-memory-size-of-a-number
        tileIndex[firstTile + i] = image;
      }

      preRenderImage();
    }

    /**
     * Pre-render the tiles to make drawing fast.
     */
    function preRenderImage() {
      var tile, image, x, y, sx, sy;

      // draw each layer in order
      for (var i = 0, layer; layer = _this.layers[layerOrder[i]]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0) and skip images that haven't been loaded yet as
          // they'll pre-render when they are done loading
          if (!tile || !tileIndex[tile]) {
            continue;
          }

          image = tileIndex[tile];

          x = (j % _this.width) * _this.tileWidth;
          y = (j / _this.width | 0) * _this.tileHeight;

          var tileOffset = tile - image.firstTile;

          sx = (tileOffset % image.tileWidth) * _this.tileWidth;
          sy = (tileOffset / image.tileWidth | 0) * _this.tileHeight;

          offScreenContext.drawImage(image, sx, sy, _this.tileWidth, _this.tileHeight, x, y, _this.tileWidth, _this.tileHeight);
        }
      }
    }
  };

  return kontra;
})(kontra || {});