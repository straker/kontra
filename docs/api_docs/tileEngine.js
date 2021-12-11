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
 * Once all tileset images and all layers have been added, you can render the tile engine by calling its [render()](api/tileEngine#render) function.
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
 * img.src = 'assets/imgs/mapPack_tilesheet.png';
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
 * **Note:** The Layer Format must be set to CSV (not Base64) and any `source` files must also be JSON files (not XML or TMX).
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
 * load('assets/imgs/mapPack_tilesheet.png', 'assets/data/tile_engine_basic.json')
 *   .then(assets => {
 *     let tileEngine = TileEngine(dataAssets['assets/data/tile_engine_basic']);
 *     // exclude-code:start
 *     tileEngine.context = context;
 *     // exclude-code:end
 *     tileEngine.render();
 *   });
 */

/**
 * If your tilemap is larger than the canvas size, you can move the tilemap camera to change how the tilemap is drawn. Use the tile engines [sx](api/tileEngine#sx) and [sy](api/tileEngine#sy) properties to move the camera. Just like drawing an image, the cameras coordinates are the top left corner.
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
 * load('assets/imgs/mapPack_tilesheet.png', 'assets/data/tile_engine_camera.json')
 *   .then(function() {
 *     let tileEngine = TileEngine(dataAssets['assets/data/tile_engine_camera']);
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

/**
 * Managing the correct x and y position of sprites on a large tile map can be tricky. You can add objects to the tile map and the tile map will render each object with the correct camera position.
 *
 * @sectionName Adding Objects to the TileMap
 * @example
 * @example {576x576}
 * // exclude-code:start
 * let { TileEngine, load, dataAssets, imageAssets, SpriteSheet, Sprite, GameLoop } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { load, TileEngine, dataAssets, imageAssets, SpriteSheet, Sprite, GameLoop } from 'kontra';
 * // exclude-script:end
 *
 * load('assets/imgs/mapPack_tilesheet.png', 'assets/data/tile_engine_add.json')
 *   .then(function() {
 *     let tileEngine = TileEngine(dataAssets['assets/data/tile_engine_add']);
 *     // exclude-code:start
 *     tileEngine.context = context;
 *     // exclude-code:end
 *
 *     let spriteSheet = SpriteSheet({
 *       image: imageAssets['assets/imgs/mapPack_tilesheet.png'],
 *       frameWidth: 64,
 *       frameHeight: 64,
 *       animations: {
 *         player: {
 *           frames: 168,
 *           frameRate: 1
 *         }
 *       }
 *     });
 *
 *     // draw the pink alien on the tile map at position {192,128}
 *     let sprite = Sprite({
 *       x: 192,
 *       y: 128,
 *       animations: spriteSheet.animations
 *     });
 *
 *     // sync the tile map camera and the sprite
 *     tileEngine.add(sprite);
 *
 *     let sx = 1;
 *     let loop = GameLoop({
 *       update: function() {
 *         tileEngine.sx += sx;
 *
 *         if (tileEngine.sx <= 0 || tileEngine.sx >= 256) {
 *           sx = -sx;
 *         }
 *       },
 *       render: function() {
 *         // the alien will now draw to the correct spot even while the camera moves
 *         tileEngine.render();
 *       }
 *     });
 *
 *     loop.start();
 *   });
 */
