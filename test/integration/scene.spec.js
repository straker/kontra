import Scene from '../../src/scene.js'
import TileEngine from '../../src/tileEngine.js'
import { init, getCanvas } from '../../src/core.js'

describe('Scene integration', () => {

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  it('should render a tileEngine', () => {
    let spy = sinon.spy();
    let tileEngine = TileEngine({
      width: 10,
      height: 12,
      tilewidth: 32,
      tileheight: 32,
      tilesets: [],
      render: spy
    });

    let scene = Scene({
      id: 'myId',
      children: [tileEngine]
    });

    scene.render();

    expect(spy.called).to.be.true;
  });

});
