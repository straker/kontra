import { getCanvas, getContext } from './core.js'

/**
 * A tile engine for managing and drawing tilesets.
 *
 * <figure>
 *   <a href="../assets/imgs/mapPack_tilesheet.png">
 *     <img src="../assets/imgs/mapPack_tilesheet.png" alt="Tileset to create an overworld map in various seasons.">
 *   </a>
 *   <figcaption>Tileset image courtesy of <a href="https://kenney.nl/assets">Kenney</a>.</figcaption>
 * </figure>
 * @sectionName TileEngine
 *
 * @param {Object} properties - Properties of the tile engine.
 * @param {Number} properties.width - Width of the tile map (in number of tiles).
 * @param {Number} properties.height - Height of the tile map (in number of tiles).
 * @param {Number} properties.tilewidth - Width of a single tile (in pixels).
 * @param {Number} properties.tileheight - Height of a single tile (in pixels).
 * @param {Canvas​Rendering​Context2D} [properties.context] - The context the tile engine should draw to. Defaults to [core.getContext()](api/core#getContext)
 *
 * @param {Object[]} properties.tilesets - Array of tileset objects.
 * @param {Number} properties.tilesetN.firstgid - First tile index of the tileset. The first tileset will have a firstgid of 1 as 0 represents an empty tile.
 * @param {String|HTMLImageElement} properties.tilesetN.image - Relative path to the HTMLImageElement or an HTMLImageElement. If passing a relative path, the image file must have been [loaded](./assets) first.
 * @param {Number} [properties.tilesetN.margin=0] - The amount of whitespace between each tile (in pixels).
 * @param {Number} [properties.tilesetN.tilewidth] - Width of the tileset (in pixels). Defaults to properties.tilewidth.
 * @param {Number} [properties.tilesetN.tileheight] - Height of the tileset (in pixels). Defaults to properties.tileheight.
 * @param {String} [properties.tilesetN.source] - Relative path to the source JSON file. The source JSON file must have been [loaded](./assets) first.
 * @param {Number} [properties.tilesetN.columns] - Number of columns in the tileset image.
 *
 * @param {Object[]} properties.layers - Array of layer objects.
 * @param {String} properties.layerN.name - Unique name of the layer.
 * @param {Number[]} properties.layerN.data - 1D array of tile indices.
 * @param {Boolean} [properties.layerN.visible=true] - If the layer should be drawn or not.
 * @param {Number} [properties.layerN.opacity=1] - Percent opacity of the layer.
 */

/**
 * Creating a tile map requires three things:
 *
 * 1. Dimensions of the tile map and a tile
 * 1. At least one tileset with an image
 * 1. At least one layer with data
 *
 * To set up the tile engine, you'll need to pass it the width and height of a tile (in pixels) and the width and height of the map (in number of tiles).
 *
 * You'll then need to add at least one tileset with an image as well as firstgid, or first tile index of the tileset. The first tileset will always have a firstgid of 1 as 0 represents an empty tile.
 *
 * Lastly, you'll need to add at least one named layer with data. A layer tells the tile engine which tiles from the tileset image to use at what position on the map.
 *
 * Once all tileset images and all layers have been added, you can render the tile engine by calling its [render()](#render) function.
 *
 * @sectionName Basic Use
 * @example {576x576}
 * // exclude-code:start
 * let { TileEngine } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { TileEngine } from 'kontra';
 * // exclude-script:end
 *
 * let img = new Image();
 * img.src = '../assets/imgs/mapPack_tilesheet.png';
 * img.onload = function() {
 *   let tileEngine = TileEngine({
 *     // tile size
 *     tilewidth: 64,
 *     tileheight: 64,
 *
 *     // map size in tiles
 *     width: 9,
 *     height: 9,
 *
 *     // tileset object
 *     tilesets: [{
 *       firstgid: 1,
 *       image: img
 *     }],
 *
 *     // layer object
 *     layers: [{
 *       name: 'ground',
 *       data: [ 0,  0,  0,  0,  0,  0,  0,  0,  0,
 *               0,  0,  6,  7,  7,  8,  0,  0,  0,
 *               0,  6,  27, 24, 24, 25, 0,  0,  0,
 *               0,  23, 24, 24, 24, 26, 8,  0,  0,
 *               0,  23, 24, 24, 24, 24, 26, 8,  0,
 *               0,  23, 24, 24, 24, 24, 24, 25, 0,
 *               0,  40, 41, 41, 10, 24, 24, 25, 0,
 *               0,  0,  0,  0,  40, 41, 41, 42, 0,
 *               0,  0,  0,  0,  0,  0,  0,  0,  0 ]
 *     }]
 *   });
 *   // exclude-code:start
 *   tileEngine.context = context;
 *   // exclude-code:end
 *
 *   tileEngine.render();
 * }
 */

/**
 * Adding all the tileset images and layers to a tile engine can be tedious, especially if you have multiple layers. If you want a simpler way to create a tile engine, Kontra has been written to work directly with the JSON output of the [Tiled Map Editor](http://www.mapeditor.org/).
 *
 * The one requirement is that you must preload all of the tileset images and tileset sources using the appropriate [asset loader functions](./assets) before you create the tile engine.
 *
 * @sectionName Advance Use
 * @example {576x576}
 * // exclude-code:start
 * let { TileEngine, load, dataAssets } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { load, TileEngine, dataAssets } from 'kontra';
 * // exclude-script:end
 *
 * load('../assets/imgs/mapPack_tilesheet.png', '../assets/data/tile_engine_basic.json')
 *   .then(assets => {
 *     let tileEngine = TileEngine(dataAssets['../assets/data/tile_engine_basic']);
 *     // exclude-code:start
 *     tileEngine.context = context;
 *     // exclude-code:end
 *     tileEngine.render();
 *   });
 */

/**
 * If your tilemap is larger than the canvas size, you can move the tilemap camera to change how the tilemap is drawn. Use the tile engines [sx](#sx) and [sy](#sy) properties to move the camera. Just like drawing an image, the cameras coordinates are the top left corner.
 *
 * The `sx` and `sy` coordinates will never draw the tile map below 0 or beyond the last row or column of the tile map.
 *
 * @sectionName Moving the Camera
 * @example {576x576}
 * // exclude-code:start
 * let { TileEngine, load, dataAssets, GameLoop } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { load, TileEngine, dataAssets, GameLoop } from 'kontra';
 * // exclude-script:end
 *
 * load('../assets/imgs/mapPack_tilesheet.png', '../assets/data/tile_engine_camera.json')
 *   .then(function() {
 *     let tileEngine = TileEngine(dataAssets['../assets/data/tile_engine_camera']);
 *     // exclude-code:start
 *     tileEngine.context = context;
 *     // exclude-code:end
 *
 *     let sx = 1;
 *     let loop = GameLoop({
 *       update: function() {
 *         tileEngine.sx += sx;
 *
 *         if (tileEngine.sx <= 0 || tileEngine.sx >= 320) {
 *           sx = -sx;
 *         }
 *       },
 *       render: function() {
 *         tileEngine.render();
 *       }
 *     });
 *
 *     loop.start();
 *   });
 */
export default function TileEngine(properties = {}) {
  let {
    width,
    height,
    tilewidth,
    tileheight,
    context = getContext(),
    tilesets,
    layers
  } = properties;

  let mapwidth = width * tilewidth;
  let mapheight = height * tileheight

  // create an off-screen canvas for pre-rendering the map
  // @see http://jsperf.com/render-vs-prerender
  let offscreenCanvas = document.createElement('canvas');
  let offscreenContext = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = mapwidth;
  offscreenCanvas.height = mapheight;

  // map layer names to data
  let layerMap = {};
  let layerCanvases = {};

  /**
   * The width of tile map (in tiles).
   * @memberof TileEngine
   * @property {Number} width
   */

  /**
   * The height of tile map (in tiles).
   * @memberof TileEngine
   * @property {Number} height
   */

  /**
   * The width a tile (in pixels).
   * @memberof TileEngine
   * @property {Number} tilewidth
   */

  /**
   * The height of a tile (in pixels).
   * @memberof TileEngine
   * @property {Number} tileheight
   */

  /**
   * Array of all layers of the tile engine.
   * @memberof TileEngine
   * @property {Object[]} layers
   */

  /**
   * Array of all tilesets of the tile engine.
   * @memberof TileEngine
   * @property {Object[]} tilesets
   */

  let tileEngine = Object.assign({

    /**
     * The context the tile engine will draw to.
     * @memberof TileEngine
     * @property {CanvasRenderingContext2D} context
     */
    context: context,

    /**
     * The width of the tile map (in pixels).
     * @memberof TileEngine
     * @property {Number} mapwidth
     */
    mapwidth: mapwidth,

    /**
     * The height of the tile map (in pixels).
     * @memberof TileEngine
     * @property {Number} mapheight
     */
    mapheight: mapheight,
    _sx: 0,
    _sy: 0,

    /**
     * X coordinate of the tile map camera.
     * @memberof TileEngine
     * @property {Number} sx
     */
    get sx() {
      return this._sx;
    },

    /**
     * Y coordinate of the tile map camera.
     * @memberof TileEngine
     * @property {Number} sy
     */
    get sy() {
      return this._sy;
    },

    // when clipping an image, sx and sy must within the image region, otherwise
    // Firefox and Safari won't draw it.
    // @see http://stackoverflow.com/questions/19338032/canvas-indexsizeerror-index-or-size-is-negative-or-greater-than-the-allowed-a
    set sx(value) {
      this._sx = Math.min( Math.max(0, value), mapwidth - getCanvas().width );
    },

    set sy(value) {
      this._sy = Math.min( Math.max(0, value), mapheight - getCanvas().height );
    },

    /**
     * Render all visible layers.
     * @memberof TileEngine
     * @function render
     */
    render() {
      render(offscreenCanvas);
    },

    /**
     * Render a specific layer by name.
     * @memberof TileEngine
     * @function renderLayer
     *
     * @param {String} name - Name of the layer to render.
     */
    renderLayer(name) {
      let canvas = layerCanvases[name];
      let layer = layerMap[name];

      if (!canvas) {
        // cache the rendered layer so we can render it again without redrawing
        // all tiles
        canvas = document.createElement('canvas');
        canvas.width = mapwidth;
        canvas.height = mapheight;

        layerCanvases[name] = canvas;
        tileEngine._r(layer, canvas.getContext('2d'));
      }

      render(canvas);
    },

    /**
     * Check if the object collides with the layer (shares a gird coordinate with any positive tile index in layers data). The object being checked must have the properties `x`, `y`, `width`, and `height` so that its position in the grid can be calculated. kontra.Sprite defines these properties for you.
     *
     * ```js
     * import { TileEngine, Sprite } from 'kontra';
     *
     * let tileEngine = TileEngine({
     *   tilewidth: 32,
     *   tileheight: 32,
     *   width: 4,
     *   height: 4,
     *   tilesets: [{
     *     // ...
     *   }],
     *   layers: [{
     *     name: 'collision',
     *     data: [ 0,0,0,0,
     *             0,1,4,0,
     *             0,2,5,0,
     *             0,0,0,0 ]
     *   }]
     * });
     *
     * let sprite = Sprite({
     *   x: 50,
     *   y: 20,
     *   width: 5,
     *   height: 5
     * });
     *
     * tileEngine.layerCollidesWith('collision', sprite);  //=> false
     *
     * sprite.y = 28;
     *
     * tileEngine.layerCollidesWith('collision', sprite);  //=> true
     * ```
     * @memberof TileEngine
     * @function layerCollidesWith
     *
     * @param {String} name - The name of the layer to check for collision.
     * @param {Object} object - Object to check collision against.
     *
     * @returns {boolean} `true` if the object collides with a tile, `false` otherwise.
     */
    layerCollidesWith(name, object) {
      let row = getRow(object.y);
      let col = getCol(object.x);
      let endRow = getRow(object.y + object.height);
      let endCol = getCol(object.x + object.width);

      let layer = layerMap[name];

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
     * Get the tile at the specified layer using either x and y coordinates or row and column coordinates.
     *
     * ```js
     * import { TileEngine } from 'kontra';
     *
     * let tileEngine = TileEngine({
     *   tilewidth: 32,
     *   tileheight: 32,
     *   width: 4,
     *   height: 4,
     *   tilesets: [{
     *     // ...
     *   }],
     *   layers: [{
     *     name: 'collision',
     *     data: [ 0,0,0,0,
     *             0,1,4,0,
     *             0,2,5,0,
     *             0,0,0,0 ]
     *   }]
     * });
     *
     * tileEngine.tileAtLayer('collision', {x: 50, y: 50});  //=> 1
     * tileEngine.tileAtLayer('collision', {row: 2, col: 1});  //=> 2
     * ```
     * @memberof TileEngine
     * @function tileAtLayer
     *
     * @param {String} name - Name of the layer.
     * @param {Object} position - Position of the tile in either {x, y} or {row, col} coordinates.
     *
     * @returns {Number} The tile index. Will return `-1` if no layer exists by the provided name.
     */
    tileAtLayer(name, position) {
      let row = position.row || getRow(position.y);
      let col = position.col || getCol(position.x);

      if (layerMap[name]) {
        return layerMap[name].data[col + row * tileEngine.width];
      }

      return -1;
    },

    // expose for testing
    _r: renderLayer,

    // @if DEBUG
    layerCanvases: layerCanvases
    // @endif
  }, properties);

  // resolve linked files (source, image)
  tileEngine.tilesets.map(tileset => {
    // get the url of the Tiled JSON object (in this case, the properties object)
    let url = (window.__k ? window.__k.dm.get(properties) : '') || window.location.href;

    if (tileset.source) {
      // @if DEBUG
      if (!window.__k) {
        throw Error(`You must use "load" or "loadData" to resolve tileset.source`);
      }
      // @endif

      let source = window.__k.d[window.__k.u(tileset.source, url)];

      // @if DEBUG
      if (!source) {
        throw Error(`You must load the tileset source "${tileset.source}" before loading the tileset`);
      }
      // @endif

      Object.keys(source).map(key => {
        tileset[key] = source[key];
      });
    }

    if (''+tileset.image === tileset.image) {
      // @if DEBUG
      if (!window.__k) {
        throw Error(`You must use "load" or "loadImage" to resolve tileset.image`);
      }
      // @endif

      let image = window.__k.i[window.__k.u(tileset.image, url)];

      // @if DEBUG
      if (!image) {
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
   * @param {Number} y - Y coordinate.
   *
   * @return {Number}
   */
  function getRow(y) {
    return (tileEngine.sy + y) / tileEngine.tileheight | 0;
  }

  /**
   * Get the col from the x coordinate.
   * @private
   *
   * @param {Number} x - X coordinate.
   *
   * @return {Number}
   */
  function getCol(x) {
    return (tileEngine.sx + x) / tileEngine.tilewidth | 0;
  }

  /**
   * Render a layer.
   * @private
   *
   * @param {Object} layer - Layer data.
   * @param {Context} context - Context to draw layer to.
   */
  function renderLayer(layer, context) {
    context.save();
    context.globalAlpha = layer.opacity;

    layer.data.map((tile, index) => {

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

      let tilewidth = tileset.tilewidth || tileEngine.tilewidth;
      let tileheight = tileset.tileheight || tileEngine.tileheight;
      let margin = tileset.margin || 0;

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
      tileEngine.layers.map(layer => {
        layerMap[layer.name] = layer;

        if (layer.visible !== false) {
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
    let { width, height } = getCanvas();
    tileEngine.context.drawImage(
      canvas,
      tileEngine.sx, tileEngine.sy, width, height,
      0, 0, width, height
    );
  }

  prerender();
  return tileEngine;
};