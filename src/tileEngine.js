(function() {
  kontra.tileEngine = function(tiledData) {
    let mapWidth = tiledData.width * tiledData.tilewidth;
    let mapHeight = tiledData.height * tiledData.tileheight

    // create an off-screen canvas for pre-rendering the map
    // @see http://jsperf.com/render-vs-prerender
    let offscreenCanvas = document.createElement('canvas');
    let offscreenContext = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = mapWidth;
    offscreenCanvas.height = mapHeight;

    // map layer names to data
    let layerMap = {};
    let layerCanvases = {};

    let tileEngine = Object.assign({
      mapWidth: mapWidth,
      mapHeight: mapHeight,
      _sx: 0,
      _sy: 0,

      get sx() {
        return this._sx;
      },

      get sy() {
        return this._sy;
      },

      // when clipping an image, sx and sy must within the image region, otherwise
      // Firefox and Safari won't draw it.
      // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
      set sx(value) {
        this._sx = Math.min( Math.max(0, value), mapWidth - kontra.canvas.width );
      },

      set sy(value) {
        this._sy = Math.min( Math.max(0, value), mapHeight - kontra.canvas.height );
      },

      /**
       * Render the pre-rendered canvas.
       * @memberof kontra.tileEngine
       */
      render() {
        render(offscreenCanvas);
      },

      /**
       * Render a specific layer by name.
       * @memberof kontra.tileEngine
       *
       * @param {string} layerName - Name of the layer to render.
       */
      renderLayer(layerName) {
        let canvas = layerCanvases[layerName];
        let layer = layerMap[layerName];

        if (!canvas) {
          // cache the rendered layer so we can render it again without redrawing
          // all tiles
          canvas = document.createElement('canvas');
          canvas.width = mapWidth;
          canvas.height = mapHeight;

          layerCanvases[layerName] = canvas;
          tileEngine._r(layer, canvas.getContext('2d'));
        }

        render(canvas);
      },

      /**
       * Simple bounding box collision test for layer tiles.
       * @memberof kontra.tileEngine
       *
       * @param {string} layerName - Name of the layer.
       * @param {object} object - Object to check collision against.
       * @param {number} object.x - X coordinate of the object.
       * @param {number} object.y - Y coordinate of the object.
       * @param {number} object.width - Width of the object.
       * @param {number} object.height - Height of the object.
       *
       * @returns {boolean} True if the object collides with a tile, false otherwise.
       */
      layerCollidesWith(layerName, object) {
        let row = getRow(object.y);
        let col = getCol(object.x);
        let endRow = getRow(object.y + object.height);
        let endCol = getCol(object.x + object.width);

        let layer = layerMap[layerName];

        // check all tiles
        for (let r = row; r <= endRow; r++) {
          for (let c = col; c <= endCol; c++) {
            if (layer.data[c + r * this.width]) {
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
      tileAtLayer(layerName, position) {
        return layerMap[layerName].data[getIndex(position)]
      },

      // expose for testing
      _r: renderLayer,

      // @if DEBUG
      layerCanvases: layerCanvases
      // @endif
    }, tiledData);

    // resolve linked files (source, image)
    tileEngine.tilesets.forEach(tileset => {
      let url = (kontra.assets ? kontra.assets._d.get(tiledData) : '') || window.location.href;

      if (tileset.source) {
        // @if DEBUG
        if (!kontra.assets) {
          throw Error(`You must use "kontra.assets" to resolve tileset.source`);
        }
        // @endif

        let source = kontra.assets.data[kontra.assets._u(tileset.source, url)];

        // @if DEBUG
        if (!source) {
          throw Error(`You must load the tileset source "${tileset.source}" before loading the tileset`);
        }
        // @endif

        Object.keys(source).forEach(key => {
          tileset[key] = source[key];
        });
      }

      if (''+tileset.image === tileset.image) {
        // @if DEBUG
        if (!kontra.assets) {
          throw Error(`You must use "kontra.assets" to resolve tileset.image`);
        }
        // @endif

        let image = kontra.assets.images[kontra.assets._u(tileset.image, url)];

        // @if DEBUG
        if (!tileset.image) {
          throw Error(`You must load the image "${tileset.image}" before loading the tileset`);
        }
        // @endif

        tileset.image = image;
      }
    });

    /**
     * Get the row from the y coordinate.
     * @private
     *
     * @param {number} y - Y coordinate.
     *
     * @return {number}
     */
    function getRow(y) {
      return (tileEngine.sy + y) / tileEngine.tileheight | 0;
    }

    /**
     * Get the col from the x coordinate.
     * @private
     *
     * @param {number} x - X coordinate.
     *
     * @return {number}
     */
    function getCol(x) {
      return (tileEngine.sx + x) / tileEngine.tilewidth | 0;
    }

    /**
     * Get the index of the x, y or row, col.
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
      let row = position.row || getRow(position.y);
      let col = position.col || getCol(position.x);

      // don't calculate out of bound numbers
      if (row < 0 || col < 0 || row >= tileEngine.height || col >= tileEngine.width) {
        return -1;
      }

      return col + row * tileEngine.width;
    }

    /**
     * Render a layer.
     * @private
     *
     * @param {object} layer - Layer data.
     * @param {Context} context - Context to draw layer to.
     */
    function renderLayer(layer, context) {
      context.save();
      context.globalAlpha = layer.opacity;

      layer.data.forEach((tile, index) => {

        // skip empty tiles (0)
        if (!tile) return;

        // find the tileset the tile belongs to
        // assume tilesets are ordered by firstgid
        let tileset;
        for (let i = tileEngine.tilesets.length-1; i >= 0; i--) {
          tileset = tileEngine.tilesets[i];

          if (tile / tileset.firstgid >= 1) {
            break;
          }
        }

        let tilewidth = tileset.tilewidth;
        let tileheight = tileset.tileheight;
        let margin = tileset.margin;

        let image = tileset.image;

        let offset = tile - tileset.firstgid;
        let cols = tileset.columns ||
          image.width / (tilewidth + margin) | 0;

        let x = (index % tileEngine.width) * tilewidth;
        let y = (index / tileEngine.width | 0) * tileheight;
        let sx = (offset % cols) * (tilewidth + margin);
        let sy = (offset / cols | 0) * (tileheight + margin);

        context.drawImage(
          image,
          sx, sy, tilewidth, tileheight,
          x, y, tilewidth, tileheight
        );
      });

      context.restore();
    }

    /**
     * Pre-render the tiles to make drawing fast.
     * @private
     */
    function prerender() {
      if (tileEngine.layers) {
        tileEngine.layers.forEach(layer => {
          layerMap[layer.name] = layer;

          if (layer.visible) {
            tileEngine._r(layer, offscreenContext);
          }
        });
      }
    }

    /**
     * Render a tile engine canvas.
     * @private
     *
     * @param {HTMLCanvasElement} canvas - Tile engine canvas to draw.
     */
    function render(canvas) {
      kontra.context.drawImage(
        canvas,
        tileEngine.sx, tileEngine.sy, kontra.canvas.width, kontra.canvas.height,
        0, 0, kontra.canvas.width, kontra.canvas.height
      );
    }

    prerender();
    return tileEngine;
  };
})();