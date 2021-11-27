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
import { gestureMap, initGesture, onGesture } from './gesture.js';
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
  getWorldRect
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
import Pool, { PoolClass } from './pool.js';
import Quadtree, { QuadtreeClass } from './quadtree.js';
import Scene, { SceneClass } from './scene.js';
import Sprite, { SpriteClass } from './sprite.js';
import SpriteSheet, { SpriteSheetClass } from './spriteSheet.js';
import Text, { TextClass } from './text.js';
import TileEngine from './tileEngine.js';
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

  gestureMap,
  initGesture,
  onGesture,

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

  Vector,
  VectorClass
};

export default kontra;
