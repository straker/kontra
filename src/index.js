import kontra from './core.js'

import Animation from './animation.js'
import assets from './assets.js'
import GameLoop from './gameLoop.js'
import keys from './keyboard.js'
import plugin from './plugin.js'
import pointer from './pointer.js'
import Pool from './pool.js'
import Quadtree from './quadtree.js'
import Sprite from './sprite.js'
import SpriteSheet from './spriteSheet.js'
import store from './store.js'
import TileEngine from './tileEngine.js'
import Vector from './vector.js'

kontra.assets = assets;
kontra.keys = keys;
kontra.plugin = plugin;
kontra.pointer = pointer;
kontra.store = store;

kontra.animation = Animation;
kontra.gameLoop = GameLoop;
kontra.pool = Pool;
kontra.quadtree = Quadtree;
kontra.sprite = Sprite;
kontra.spriteSheet = SpriteSheet;
kontra.tileEngine = TileEngine;
kontra.vector = Vector;

export default kontra