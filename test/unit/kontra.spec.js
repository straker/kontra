import * as kontraExports from '../../src/kontra.js';
import kontra from '../../src/kontra.defaults.js';

// --------------------------------------------------
// kontra
// --------------------------------------------------
describe('kontra', () => {
  it('should export animation api and class', () => {
    expect(kontraExports.Animation).to.exist;
    expect(kontraExports.AnimationClass).to.exist;
  });

  it('should export assets api', () => {
    expect(kontraExports.imageAssets).to.exist;
    expect(kontraExports.audioAssets).to.exist;
    expect(kontraExports.dataAssets).to.exist;
    expect(kontraExports.setImagePath).to.exist;
    expect(kontraExports.setAudioPath).to.exist;
    expect(kontraExports.setDataPath).to.exist;
    expect(kontraExports.loadImage).to.exist;
    expect(kontraExports.loadAudio).to.exist;
    expect(kontraExports.loadData).to.exist;
    expect(kontraExports.load).to.exist;
  });

  it('should export button api and class', () => {
    expect(kontraExports.Button).to.exist;
    expect(kontraExports.ButtonClass).to.exist;
  });

  it('should export core api', () => {
    expect(kontraExports.init).to.exist;
    expect(kontraExports.getCanvas).to.exist;
    expect(kontraExports.getContext).to.exist;
  });

  it('should export events api', () => {
    expect(kontraExports.on).to.exist;
    expect(kontraExports.off).to.exist;
    expect(kontraExports.emit).to.exist;
  });

  it('should export gameLoop api', () => {
    expect(kontraExports.GameLoop).to.exist;
  });

  it('should export gameObject api and class', () => {
    expect(kontraExports.GameObject).to.exist;
    expect(kontraExports.GameObjectClass).to.exist;
  });

  it('should export gamepad api', () => {
    expect(kontraExports.gamepadMap).to.exist;
    expect(kontraExports.updateGamepad).to.exist;
    expect(kontraExports.initGamepad).to.exist;
    expect(kontraExports.onGamepad).to.exist;
    expect(kontraExports.offGamepad).to.exist;
    expect(kontraExports.gamepadPressed).to.exist;
    expect(kontraExports.gamepadAxis).to.exist;
  });

  it('should export gesture api', () => {
    expect(kontraExports.gestureMap).to.exist;
    expect(kontraExports.initGesture).to.exist;
    expect(kontraExports.onGesture).to.exist;
    expect(kontraExports.offGesture).to.exist;
  });

  it('should export grid api and class', () => {
    expect(kontraExports.Grid).to.exist;
    expect(kontraExports.GridClass).to.exist;
  });

  it('should export helpers api', () => {
    expect(kontraExports.degToRad).to.exist;
    expect(kontraExports.radToDeg).to.exist;
    expect(kontraExports.angleToTarget).to.exist;
    expect(kontraExports.rotatePoint).to.exist;
    expect(kontraExports.movePoint).to.exist;
    expect(kontraExports.randInt).to.exist;
    expect(kontraExports.seedRand).to.exist;
    expect(kontraExports.lerp).to.exist;
    expect(kontraExports.inverseLerp).to.exist;
    expect(kontraExports.clamp).to.exist;
    expect(kontraExports.getStoreItem).to.exist;
    expect(kontraExports.setStoreItem).to.exist;
    expect(kontraExports.collides).to.exist;
    expect(kontraExports.getWorldRect).to.exist;
    expect(kontraExports.depthSort).to.exist;
  });

  it('should export keyboard api', () => {
    expect(kontraExports.keyMap).to.exist;
    expect(kontraExports.initKeys).to.exist;
    expect(kontraExports.onKey).to.exist;
    expect(kontraExports.offKey).to.exist;
    expect(kontraExports.keyPressed).to.exist;
  });

  it('should export plugin api', () => {
    expect(kontraExports.registerPlugin).to.exist;
    expect(kontraExports.unregisterPlugin).to.exist;
    expect(kontraExports.extendObject).to.exist;
  });

  it('should export pointer api', () => {
    expect(kontraExports.initPointer).to.exist;
    expect(kontraExports.getPointer).to.exist;
    expect(kontraExports.track).to.exist;
    expect(kontraExports.untrack).to.exist;
    expect(kontraExports.pointerOver).to.exist;
    expect(kontraExports.onPointer).to.exist;
    expect(kontraExports.offPointer).to.exist;
    expect(kontraExports.pointerPressed).to.exist;
  });

  it('should export pool api and class', () => {
    expect(kontraExports.Pool).to.exist;
    expect(kontraExports.PoolClass).to.exist;
  });

  it('should export quadtree api and class', () => {
    expect(kontraExports.Quadtree).to.exist;
    expect(kontraExports.QuadtreeClass).to.exist;
  });

  it('should export scene api and class', () => {
    expect(kontraExports.Scene).to.exist;
    expect(kontraExports.SceneClass).to.exist;
  });

  it('should export sprite api and class', () => {
    expect(kontraExports.Sprite).to.exist;
    expect(kontraExports.SpriteClass).to.exist;
  });

  it('should export spriteSheet api and class', () => {
    expect(kontraExports.SpriteSheet).to.exist;
    expect(kontraExports.SpriteSheetClass).to.exist;
  });

  it('should export text api and class', () => {
    expect(kontraExports.Text).to.exist;
    expect(kontraExports.TextClass).to.exist;
  });

  it('should export tileEngine api and class', () => {
    expect(kontraExports.TileEngine).to.exist;
    expect(kontraExports.TileEngineClass).to.exist;
  });

  it('should export vector api and class', () => {
    expect(kontraExports.Vector).to.exist;
    expect(kontraExports.VectorClass).to.exist;
  });

  it('should export kontra object', () => {
    expect(kontraExports.default).to.exist;
    expect(kontraExports.default).to.equal(kontra);
  });
});
