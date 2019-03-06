import animation from './animation.js'
import assets from './assets.js'
import { on, off, emit } from './events.js'
import gameLoop from './gameLoop.js'
// import keys from './keys.js'
import kontra from './core.js'

kontra.animation = animation;
kontra.assets = assets;
kontra.on = on;
kontra.off = off;
kontra.emit = emit;
kontra.gameLoop = gameLoop;
// kontra.keys = keys;

export default kontra;