import * as kontraExports from '../../src/kontra.js';
import kontra from '../../src/kontra.defaults.js';

// --------------------------------------------------
// kontra
// --------------------------------------------------
describe('kontra', () => {
  it('should export animation api', () => {
    expect(kontraExports.Animation).to.exist;
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

  it('should export button api', () => {
    expect(kontraExports.Button).to.exist;
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
  });

  it('should export gameLoop api', () => {
    expect(kontraExports.GameLoop).to.exist;
  });

  it('should export gameObject api', () => {
    expect(kontraExports.GameObject).to.exist;
  });

  it('should add gesture api', () => {
    expect(kontraExports.gestureMap).to.exist;
    expect(kontraExports.initGesture).to.exist;
    expect(kontraExports.onGesture).to.exist;
  });

  it('should export grid api', () => {
    expect(kontraExports.Grid).to.exist;
  });

  it('should export keyboard api', () => {
    expect(kontraExports.keyMap).to.exist;
    expect(kontraExports.initKeys).to.exist;
    expect(kontraExports.bindKeys).to.exist;
    expect(kontraExports.unbindKeys).to.exist;
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
    expect(kontraExports.onPointerDown).to.exist;
    expect(kontraExports.onPointerUp).to.exist;
    expect(kontraExports.pointerPressed).to.exist;
  });

  it('should export pool api', () => {
    expect(kontraExports.Pool).to.exist;
  });

  it('should export quadtree api', () => {
    expect(kontraExports.Quadtree).to.exist;
  });

  it('should add scene api', () => {
    expect(kontraExports.Scene).to.exist;
  });

  it('should export sprite api', () => {
    expect(kontraExports.Sprite).to.exist;
  });

  it('should export spriteSheet api', () => {
    expect(kontraExports.SpriteSheet).to.exist;
  });

  it('should export text api', () => {
    expect(kontraExports.Text).to.exist;
  });

  it('should export tileEngine api', () => {
    expect(kontraExports.TileEngine).to.exist;
  });

  it('should export vector api', () => {
    expect(kontraExports.Vector).to.exist;
  });

  it('should export kontra object', () => {
    expect(kontraExports.default).to.exist;
    expect(kontraExports.default).to.equal(kontra);
  });
});
