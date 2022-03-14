import Animation, { AnimationClass } from './animation.js';
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
import Button, { ButtonClass } from './button.js';
import { init, getCanvas, getContext } from './core.js';
import { on, off, emit } from './events.js';
import GameLoop from './gameLoop.js';
import GameObject, { GameObjectClass } from './gameObject.js';
import {
  gamepadMap,
  updateGamepad,
  initGamepad,
  onGamepad,
  offGamepad,
  gamepadPressed,
  gamepadAxis
} from './gamepad.js';
import {
  gestureMap,
  initGesture,
  onGesture,
  offGesture
} from './gesture.js';
import Grid, { GridClass } from './grid.js';
import {
  radToDeg,
  degToRad,
  angleToTarget,
  rotatePoint,
  movePoint,
  randInt,
  seedRand,
  lerp,
  inverseLerp,
  clamp,
  setStoreItem,
  getStoreItem,
  collides,
  getWorldRect,
  depthSort
} from './helpers.js';
import { initInput, onInput, offInput } from './input.js';
import {
  keyMap,
  initKeys,
  onKey,
  offKey,
  keyPressed
} from './keyboard.js';
import {
  registerPlugin,
  unregisterPlugin,
  extendObject
} from './plugin.js';
import {
  initPointer,
  getPointer,
  track,
  untrack,
  pointerOver,
  onPointer,
  offPointer,
  pointerPressed
} from './pointer.js';
import Pool, { PoolClass } from './pool.js';
import Quadtree, { QuadtreeClass } from './quadtree.js';
import Scene, { SceneClass } from './scene.js';
import Sprite, { SpriteClass } from './sprite.js';
import SpriteSheet, { SpriteSheetClass } from './spriteSheet.js';
import Text, { TextClass } from './text.js';
import TileEngine, { TileEngineClass } from './tileEngine.js';
import Vector, { VectorClass } from './vector.js';

let kontra = {
  Animation,
  AnimationClass,

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
  ButtonClass,

  init,
  getCanvas,
  getContext,

  on,
  off,
  emit,

  GameLoop,
  GameObject,
  GameObjectClass,

  gamepadMap,
  updateGamepad,
  initGamepad,
  onGamepad,
  offGamepad,
  gamepadPressed,
  gamepadAxis,

  gestureMap,
  initGesture,
  onGesture,
  offGesture,

  Grid,
  GridClass,

  degToRad,
  radToDeg,
  angleToTarget,
  rotatePoint,
  movePoint,
  randInt,
  seedRand,
  lerp,
  inverseLerp,
  clamp,
  setStoreItem,
  getStoreItem,
  collides,
  getWorldRect,
  depthSort,

  initInput,
  onInput,
  offInput,

  keyMap,
  initKeys,
  onKey,
  offKey,
  keyPressed,

  registerPlugin,
  unregisterPlugin,
  extendObject,

  initPointer,
  getPointer,
  track,
  untrack,
  pointerOver,
  onPointer,
  offPointer,
  pointerPressed,

  Pool,
  PoolClass,

  Quadtree,
  QuadtreeClass,

  Scene,
  SceneClass,

  Sprite,
  SpriteClass,

  SpriteSheet,
  SpriteSheetClass,

  Text,
  TextClass,

  TileEngine,
  TileEngineClass,

  Vector,
  VectorClass
};

export default kontra;
