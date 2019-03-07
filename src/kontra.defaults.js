import animation from './animation.js'
// import assets from './assets.js'
import { on, off, emit } from './events.js'
import gameLoop from './gameLoop.js'
import { initKeys, bind, unbind, pressed } from './keys.js'
import { init, getCanvas, getContext } from './core.js'

let kontra = {
  init,
  _initKeys: initKeys,
  get canvas() {
    return getCanvas();
  },
  get context() {
    return getContext();
  },
  animation,
  on,
  off,
  emit,
  gameLoop,
  keys: {
    bind,
    unbind,
    pressed
  }
};

export default kontra;

// kontra.animation = animation;
// kontra.assets = assets;
// kontra.on = on;
// kontra.off = off;
// kontra.emit = emit;
// kontra.gameLoop = gameLoop;
// kontra.keys = keys;

// export default kontra;