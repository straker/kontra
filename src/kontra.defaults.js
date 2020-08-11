import Animation from './animation.js';
import {
  imageAssets,
  audioAssets,
  dataAssets,
  setImagePath,
  setAudioPath,
  setDataPath,
  loadImage,
  loadAudio,
  loadData,
  load
} from './assets.js';
import Button from './button.js';
import { init, getCanvas, getContext } from './core.js';
import { on, off, emit } from './events.js';
import GameLoop from './gameLoop.js';
import GameObject from './gameObject.js';
import Grid from './grid.js';
import {
  radToDeg,
  degToRad,
  angleToTarget,
  randInt,
  seedRand,
  lerp,
  inverseLerp,
  clamp,
  setStoreItem,
  getStoreItem,
  collides
} from './helpers.js';
import { keyMap, initKeys, bindKeys, unbindKeys, keyPressed } from './keyboard.js';
import { registerPlugin, unregisterPlugin, extendObject } from './plugin.js';
import {
  initPointer,
  getPointer,
  track,
  untrack,
  pointerOver,
  onPointerDown,
  onPointerUp,
  pointerPressed
} from './pointer.js';
import Pool from './pool.js';
import Quadtree from './quadtree.js';
import Scene from './scene.js';
import Sprite from './sprite.js';
import SpriteSheet from './spriteSheet.js';
import Text from './text.js';
import TileEngine from './tileEngine.js';
import Vector from './vector.js';

let kontra = {
  Animation,

  imageAssets,
  audioAssets,
  dataAssets,
  setImagePath,
  setAudioPath,
  setDataPath,
  loadImage,
  loadAudio,
  loadData,
  load,

  Button,

  init,
  getCanvas,
  getContext,

  on,
  off,
  emit,

  GameLoop,
  GameObject,
  Grid,

  degToRad,
  radToDeg,
  angleToTarget,
  randInt,
  seedRand,
  lerp,
  inverseLerp,
  clamp,
  setStoreItem,
  getStoreItem,
  collides,

  keyMap,
  initKeys,
  bindKeys,
  unbindKeys,
  keyPressed,

  registerPlugin,
  unregisterPlugin,
  extendObject,

  initPointer,
  getPointer,
  track,
  untrack,
  pointerOver,
  onPointerDown,
  onPointerUp,
  pointerPressed,

  Pool,
  Quadtree,
  Scene,
  Sprite,
  SpriteSheet,

  Text,
  TileEngine,
  Vector
};

export default kontra
