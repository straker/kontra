import Animation from './animation.js'
import {
  images,
  audio,
  data,
  setImagePath,
  setAudioPath,
  setDataPath,
  loadImage,
  loadAudio,
  loadData,
  load
} from './assets.js'
import { init, getCanvas, getContext } from './core.js'
import { on, off, emit } from './events.js'
import GameLoop from './gameLoop.js'
import { initKeys, bindKeys, unbindKeys, keyPressed } from './keys.js'
import {
  initPointer,
  pointer,
  track,
  untrack,
  pointerOver,
  onPointerDown,
  onPointerUp,
  pointerPressed
} from './pointer.js'
import Pool from './pool.js'
import Quadtree from './quadtree.js'
import Sprite from './sprite.js'
import SpriteSheet from './spriteSheet.js'
import { setStoreItem, getStoreItem } from './store.js'
import TileEngine from './tileEngine.js'
import Vector from './vector.js'

let kontra = {
  Animation,

  images,
  audio,
  data,
  setImagePath,
  setAudioPath,
  setDataPath,
  loadImage,
  loadAudio,
  loadData,
  load,

  init,
  getCanvas,
  getContext,

  on,
  off,
  emit,

  GameLoop,

  initKeys,
  bindKeys,
  unbindKeys,
  keyPressed,

  initPointer,
  pointer,
  track,
  untrack,
  pointerOver,
  onPointerDown,
  onPointerUp,
  pointerPressed,

  Pool,
  Quadtree,
  Sprite,
  SpriteSheet,

  setStoreItem,
  getStoreItem,

  TileEngine,
  Vector
};

export default kontra