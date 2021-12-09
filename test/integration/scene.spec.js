import Scene from '../../src/scene.js';
import Sprite from '../../src/sprite.js';
import TileEngine from '../../src/tileEngine.js';
import { init, getCanvas } from '../../src/core.js';
import { depthSort } from '../../src/helpers.js';

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

  it('should work with helpers.depthSort', () => {
    let children = [];
    let spies = [];
    for (let i = 5; i > 0; i--) {
      let spy = sinon.spy();
      spies.push(spy);
      children.push(
        Sprite({
          id: i,
          x: 5,
          y: i * 10,
          width: 15,
          height: 25,
          render: spy
        })
      );
    }

    let scene = Scene({
      id: 'myId',
      children,
      sortFunction: depthSort
    });
    scene.render();

    expect(spies[4].calledBefore(spies[3])).to.be.true;
    expect(spies[3].calledBefore(spies[2])).to.be.true;
    expect(spies[2].calledBefore(spies[1])).to.be.true;
    expect(spies[1].calledBefore(spies[0])).to.be.true;
  });
});
