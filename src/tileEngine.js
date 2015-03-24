/*jshint -W084 */

/**
 * @fileoverview A tile engine for rendering tilesets.
 */
var kontra = (function(kontra, undefined) {
  /*
    want to handle:
      - multiple images
  */

  /**
   *
   */
   kontra.TileEngine = function TileEngine(properties) {
    properties = properties || {};

    var _this = this;
    var rendered = false;

    // since the tile engine can have more than one image, each image must be associated
    // with a unique set of tiles. This array will hold a reference to the tileset image
    // that each tile belongs to for quick access when drawing (i.e. O(1))
    var tileIndex = [undefined];  // index 0 is always an empty tile

    this.tileIndex = tileIndex;

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
    this.layers = [];
    this.images = [];

    /**
     * Add an image for the tile engine to use.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string|Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    this.addImage = function TileEngineAddImage(properties) {
      properties = properties || {};

      if (kontra.isString(properties.image)) {
        var img = new Image();
        img.onload = function() {
          associateImage.call(_this, {image: this, firstTile: properties.firstTile});
        };
        img.src = properties.image;
      }
      else if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        associateImage({image: properties.image, firstTile: properties.firstTile});
      }
    };

    /**
     * Associate an image with its tiles.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties - Properties of the image to add.
     * @param {string|Image|Canvas} properties.image - Image to add.
     * @param {number} properties.firstTile - The first tile to start the image.
     */
    function associateImage(properties) {
      var image = properties.image;
      var startTile = properties.firsTile || tileIndex.length;

      image.tileWidth = image.width / this.tileWidth;
      image.tileHeight = image.height / this.tileHeight;
      image.startTile = startTile;

      this.images.push(image);

      // associate the new image tiles with the image
      for (var i = 0, len = image.tileWidth * image.tileHeight; i < len; i++) {
        // objects are just pointers so storing an object is only storing a pointer of 4 bytes
        // @see http://stackoverflow.com/questions/4740593/how-is-memory-handled-with-javascript-objects
        tileIndex[startTile + i] = image;
      }
    }

    /**
     * Add a layer.
     * @memberOf kontra.TileEngine
     *
     * @param {object} properties -
     * @param {number[]} properties.data - Tile layer data.
     * @param {number} properties.index - Draw order for tile layer. Highest number is drawn last (i.e. on top of all other layers).
     * @param {string} properties.name - Layer name.
     */
    this.addLayer = function TileEngineAddLayer(properties) {
      properties = properties || {};

      this.layers.push({
        name: properties.name,
        data: properties.data,
        index: properties.index
      });

      // sort the layers by index
      // default sort method is good enough for small lists
      this.layers.sort(function(a, b) {
        return a.index - b.index;
      });

      // pre-render the canvas when a new layer is added (i.e the only time the map
      // should change)
      preRenderImage.call(this);
    };

    /**
     *
     * @memberOf kontra.TileEngine
     */
    this.draw = function TileEngineDraw() {
      this.context.drawImage(offScreenCanvas, 0, 0);
    };

    /**
     * Pre-render the tiles to make drawing fast.
     */
    function preRenderImage() {
      var tile, image, x, y, sx, sy;

      // draw each layer in order
      for (var i = 0, layer; layer = this.layers[i]; i++) {
        for (var j = 0, len = layer.data.length; j < len; j++) {
          tile = layer.data[j];

          // skip empty tiles (0)
          if (!tile) {
            continue;
          }

          image = tileIndex[tile];

          x = (j % this.width) * this.tileWidth;
          y = (j / this.width | 0) * this.tileHeight;

          var tileOffset = tile - image.startTile;

          sx = (tileOffset % image.tileWidth) * this.tileWidth;
          sy = (tileOffset / image.tileWidth | 0) * this.tileHeight;

          offScreenContext.drawImage(image, sx, sy, this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight);
        }
      }

      rendered = true;
    }
  };

  return kontra;
})(kontra || {});