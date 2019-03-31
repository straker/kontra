import kontra from '../../src/kontra.defaults.js'

// --------------------------------------------------
// kontra.defaults
// --------------------------------------------------
describe('kontra.defaults', () => {

  it('should add Animation api', () => {
    expect(kontra.Animation).to.exist;
  });

  it('should add assets api', () => {
    expect(kontra.images).to.exist;
    expect(kontra.audio).to.exist;
    expect(kontra.data).to.exist;
    expect(kontra.setImagePath).to.exist;
    expect(kontra.setAudioPath).to.exist;
    expect(kontra.setDataPath).to.exist;
    expect(kontra.loadImage).to.exist;
    expect(kontra.loadAudio).to.exist;
    expect(kontra.loadData).to.exist;
    expect(kontra.load).to.exist;
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

  it('should add keys api', () => {
    expect(kontra.keyMap).to.exist;
    expect(kontra.initKeys).to.exist;
    expect(kontra.bindKeys).to.exist;
    expect(kontra.unbindKeys).to.exist;
    expect(kontra.keyPressed).to.exist;
  });

  it('should add plugin api', () => {
    expect(kontra.registerPlugin).to.exist;
    expect(kontra.unregisterPlugin).to.exist;
    expect(kontra.extendObject).to.exist;
  });

  it('should add pointer api', () => {
    expect(kontra.initPointer).to.exist;
    expect(kontra.pointer).to.exist;
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

  it('should add sprite api', () => {
    expect(kontra.Sprite).to.exist;
  });

  it('should add spriteSheet api', () => {
    expect(kontra.SpriteSheet).to.exist;
  });

  it('should add store api', () => {
    expect(kontra.getStoreItem).to.exist;
    expect(kontra.setStoreItem).to.exist;
  });

  it('should add tileEngine api', () => {
    expect(kontra.TileEngine).to.exist;
  });

  it('should add vector api', () => {
    expect(kontra.Vector).to.exist;
  });

});