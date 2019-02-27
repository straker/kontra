import assets from './assets.js'
import animation from './animation.js'
import { on, off, emit } from './events.js'
import gameLoop from './gameLoop.js'
import kontra from './core.js'

kontra.animation = animation;
kontra.assets = assets;
kontra.on = on;
kontra.off = off;
kontra.emit = emit;
kontra.gameLoop = gameLoop;

export default kontra;