import kontra from '../../src/kontra.defaults.js';

// --------------------------------------------------
// kontra.defaults
// --------------------------------------------------
describe('kontra.defaults', () => {
  it('should add animation api', () => {
    expect(kontra.Animation).to.exist;
  });

  it('should add assets api', () => {
    expect(kontra.imageAssets).to.exist;
    expect(kontra.audioAssets).to.exist;
    expect(kontra.dataAssets).to.exist;
    expect(kontra.setImagePath).to.exist;
    expect(kontra.setAudioPath).to.exist;
    expect(kontra.setDataPath).to.exist;
    expect(kontra.loadImage).to.exist;
    expect(kontra.loadAudio).to.exist;
    expect(kontra.loadData).to.exist;
    expect(kontra.load).to.exist;
  });

  it('should add button api', () => {
    expect(kontra.Button).to.exist;
  });

  it('should add core api', () => {
    expect(kontra.init).to.exist;
    expect(kontra.getCanvas).to.exist;
    expect(kontra.getContext).to.exist;
  });

  it('should add events api', () => {
    expect(kontra.on).to.exist;
    expect(kontra.off).to.exist;
    expect(kontra.emit).to.exist;
  });

  it('should add gameLoop api', () => {
    expect(kontra.GameLoop).to.exist;
  });

  it('should add gameObject api', () => {
    expect(kontra.GameObject).to.exist;
  });

  it('should add gamepad api', () => {
    expect(kontra.gamepadMap).to.exist;
    expect(kontra.updateGamepad).to.exist;
    expect(kontra.initGamepad).to.exist;
    expect(kontra.onGamepad).to.exist;
    expect(kontra.offGamepad).to.exist;
    expect(kontra.gamepadPressed).to.exist;
    expect(kontra.gamepadAxis).to.exist;
  });

  it('should add gesture api', () => {
    expect(kontra.gestureMap).to.exist;
    expect(kontra.initGesture).to.exist;
    expect(kontra.onGesture).to.exist;
  });

  it('should add grid api', () => {
    expect(kontra.Grid).to.exist;
  });

  it('should add helpers api', () => {
    expect(kontra.degToRad).to.exist;
    expect(kontra.radToDeg).to.exist;
    expect(kontra.angleToTarget).to.exist;
    expect(kontra.rotatePoint).to.exist;
    expect(kontra.movePoint).to.exist;
    expect(kontra.randInt).to.exist;
    expect(kontra.seedRand).to.exist;
    expect(kontra.lerp).to.exist;
    expect(kontra.inverseLerp).to.exist;
    expect(kontra.clamp).to.exist;
    expect(kontra.getStoreItem).to.exist;
    expect(kontra.setStoreItem).to.exist;
    expect(kontra.collides).to.exist;
    expect(kontra.getWorldRect).to.exist;
  });

  it('should add keyboard api', () => {
    expect(kontra.keyMap).to.exist;
    expect(kontra.initKeys).to.exist;
    expect(kontra.onKey).to.exist;
    expect(kontra.offKey).to.exist;
    expect(kontra.keyPressed).to.exist;
  });

  it('should add plugin api', () => {
    expect(kontra.registerPlugin).to.exist;
    expect(kontra.unregisterPlugin).to.exist;
    expect(kontra.extendObject).to.exist;
  });

  it('should add pointer api', () => {
    expect(kontra.initPointer).to.exist;
    expect(kontra.getPointer).to.exist;
    expect(kontra.track).to.exist;
    expect(kontra.untrack).to.exist;
    expect(kontra.pointerOver).to.exist;
    expect(kontra.onPointerDown).to.exist;
    expect(kontra.onPointerUp).to.exist;
    expect(kontra.pointerPressed).to.exist;
  });

  it('should add pool api', () => {
    expect(kontra.Pool).to.exist;
  });

  it('should add quadtree api', () => {
    expect(kontra.Quadtree).to.exist;
  });

  it('should add scene api', () => {
    expect(kontra.Scene).to.exist;
  });

  it('should add sprite api', () => {
    expect(kontra.Sprite).to.exist;
  });

  it('should add spriteSheet api', () => {
    expect(kontra.SpriteSheet).to.exist;
  });

  it('should add text api', () => {
    expect(kontra.Text).to.exist;
  });

  it('should add tileEngine api', () => {
    expect(kontra.TileEngine).to.exist;
  });

  it('should add vector api', () => {
    expect(kontra.Vector).to.exist;
  });
});
