import Scene from '../../src/scene.js';
import Sprite from '../../src/sprite.js';
import TileEngine from '../../src/tileEngine.js';
import { init, getCanvas } from '../../src/core.js';
import { depthSort } from '../../src/helpers.js';
import * as pointer from '../../src/pointer.js';
import { noop } from '../../src/utils.js';
import { emit } from '../../src/events.js';

describe('scene integration', () => {
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
      objects: [tileEngine]
    });

    scene.render();

    expect(spy.called).to.be.true;
  });

  it('should work with helpers.depthSort', () => {
    let objects = [];
    let spies = [];
    for (let i = 5; i > 0; i--) {
      let spy = sinon.spy();
      spies.push(spy);
      objects.push(
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
      objects,
      sortFunction: depthSort
    });
    scene.render();

    expect(spies[4].calledBefore(spies[3])).to.be.true;
    expect(spies[3].calledBefore(spies[2])).to.be.true;
    expect(spies[2].calledBefore(spies[1])).to.be.true;
    expect(spies[1].calledBefore(spies[0])).to.be.true;
  });

  it('should correctly track objects with pointer when camera is moved', () => {
    let pntr = pointer.initPointer({ radius: 1 });
    let object = {
      x: 100,
      y: 50,
      width: 10,
      height: 20,
      render: noop
    };
    let scene = Scene({
      id: 'myId',
      objects: [object]
    });
    pointer.track(object);
    object.render();
    emit('tick');

    pntr.x = 105;
    pntr.y = 55;
    expect(pointer.pointerOver(object)).to.equal(true);

    scene.camera.x += 100;
    expect(pointer.pointerOver(object)).to.equal(false);

    pntr.x = 5;
    expect(pointer.pointerOver(object)).to.equal(true);
  });
});
