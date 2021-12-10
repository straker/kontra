import Scene, { SceneClass } from '../../src/scene.js';
import { getContext, getCanvas } from '../../src/core.js';
import { noop, srOnlyStyle } from '../../src/utils.js';
import { collides } from '../../src/helpers.js';

// --------------------------------------------------
// scene
// --------------------------------------------------
describe('scene', () => {
  let scene;
  beforeEach(() => {
    scene = Scene({
      id: 'myId'
    });
  });

  afterEach(() => {
    scene.destroy();
  });

  it('should export class', () => {
    expect(SceneClass).to.be.a('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should setup basic properties', () => {
      expect(scene.id).to.equal('myId');
      expect(scene.name).to.equal('myId');
      expect(scene.objects).to.deep.equal([]);
      expect(scene.context).to.equal(getContext());
      expect(scene.cullObjects).to.equal(true);
      expect(scene.cullFunction).to.equal(collides);
    });

    it('should override basic properties', () => {
      let context = {
        canvas: getCanvas()
      };

      scene.destroy();
      scene = Scene({
        context,
        cullObjects: false,
        cullFunction: noop,
        onShow: noop,
        onHide: noop
      });

      expect(scene.context).to.equal(context);
      expect(scene.cullObjects).to.be.false;
      expect(scene.cullFunction).to.equal(noop);
      expect(scene.onShow).to.equal(noop);
      expect(scene.onHide).to.equal(noop);
    });

    it('should set all additional properties on the scene', () => {
      scene.destroy();
      scene = Scene({
        foo: 'bar',
        alive: true
      });

      expect(scene.foo).to.equal('bar');
      expect(scene.alive).to.be.true;
    });

    it('should create a DOM node and add it to the page', () => {
      expect(scene._dn).to.exist;
      expect(scene._dn.id).to.equal(scene.id);
      expect(scene._dn.tabIndex).to.equal(-1);
      expect(scene._dn.getAttribute('aria-label')).to.equal(
        scene.name
      );
      expect(document.body.contains(scene._dn)).to.be.true;
    });

    it('should add objects', () => {
      let object = {};
      scene.destroy();
      scene = Scene({
        objects: [object]
      });

      expect(scene.objects.length).to.equal(1);
      expect(scene.objects[0]).to.equal(object);
    });

    it('should add the scene as an immediate sibling to the canvas', () => {
      expect(scene.context.canvas.nextSibling).to.equal(scene._dn);
    });

    it('should hide the DOM node', () => {
      let styles = srOnlyStyle
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style);

      scene._dn
        .getAttribute('style')
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style)
        .forEach((prop, index) => {
          expect(styles[index]).to.equal(prop);
        });
    });

    it('should allow objects', () => {
      let object = {};
      scene.destroy();
      scene = Scene({
        id: 'myId',
        objects: [object]
      });

      expect(scene.objects.length).to.equal(1);
      expect(scene.objects[0]).to.equal(object);
    });

    it('should create the camera and center it', () => {
      let canvas = scene.context.canvas;
      expect(scene.camera).to.exist;
      expect(scene.camera.x).to.equal(canvas.width / 2);
      expect(scene.camera.y).to.equal(canvas.height / 2);
      expect(scene.camera.width).to.equal(canvas.width);
      expect(scene.camera.height).to.equal(canvas.height);
      expect(scene.camera.anchor).to.deep.equal({ x: 0.5, y: 0.5 });
    });
  });

  // --------------------------------------------------
  // show
  // --------------------------------------------------
  describe('show', () => {
    it('should unset the hidden property', () => {
      scene.hidden = true;
      scene.show();

      expect(scene.hidden).to.equal(false);
      expect(scene._dn.hidden).to.equal(false);
    });

    it('should focus the DOM node', () => {
      scene.show();

      expect(document.activeElement).to.equal(scene._dn);
    });

    it('should focus the first focusable object', () => {
      let object = {
        focus: sinon.spy()
      };
      scene.add(object);
      scene.show();

      expect(object.focus.called).to.be.true;
    });

    it('should call onShow', () => {
      scene.onShow = sinon.spy();
      scene.show();

      expect(scene.onShow.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // hide
  // --------------------------------------------------
  describe('hide', () => {
    it('should set the hidden property', () => {
      scene.hidden = false;
      scene.hide();

      expect(scene.hidden).to.equal(true);
      expect(scene._dn.hidden).to.equal(true);
    });

    it('should call onHide', () => {
      scene.onHide = sinon.spy();
      scene.hide();

      expect(scene.onHide.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // add
  // --------------------------------------------------
  describe('add', () => {
    it('should add the object', () => {
      let object = {};
      scene.add(object);

      expect(scene.objects.length).to.equal(1);
    });

    it('should add multiple objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);

      expect(scene.objects.length).to.equal(2);
    });

    it('should add array of objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add([object1, object2]);

      expect(scene.objects.length).to.equal(2);
    });

    it('should add any objects with DOM nodes to the scenes DOM node', () => {
      let object = {
        _dn: document.createElement('div')
      };
      scene.add(object);

      expect(scene._dn.contains(object._dn)).to.be.true;
    });

    it('should add DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        children: [
          {
            children: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.add(object);

      expect(scene._dn.contains(node1)).to.be.true;
      expect(scene._dn.contains(node2)).to.be.true;
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.add(object);

      expect(scene._dn.contains(node1)).to.be.true;
      expect(scene._dn.contains(node2)).to.be.false;
    });
  });

  // --------------------------------------------------
  // remove
  // --------------------------------------------------
  describe('remove', () => {
    it('should remove the object', () => {
      let object = {};
      scene.add(object);
      scene.remove(object);

      expect(scene.objects.length).to.equal(0);
    });

    it('should remove multiple objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);
      scene.remove(object1, object2);

      expect(scene.objects.length).to.equal(0);
    });

    it('should remove array of objects', () => {
      let object1 = {};
      let object2 = {};
      scene.add(object1, object2);
      scene.remove([object1, object2]);

      expect(scene.objects.length).to.equal(0);
    });

    it('should remove any objects with DOM nodes', () => {
      let object = {
        _dn: document.createElement('div')
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(object._dn)).to.be.false;
      expect(document.body.contains(object._dn)).to.be.true;
    });

    it('should remove DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let object = {
        objects: [
          {
            objects: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(node1)).to.be.false;
      expect(scene._dn.contains(node2)).to.be.false;
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      node1.appendChild(node2);

      let object = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.add(object);
      scene.remove(object);

      expect(scene._dn.contains(node1)).to.be.false;
      expect(scene._dn.contains(node2)).to.be.false;
      expect(node1.contains(node2)).to.be.true;
    });
  });

  // --------------------------------------------------
  // objects
  // --------------------------------------------------
  describe('objects', () => {
    it('should properly handle setting objects', () => {
      scene.add({ foo: 'bar' });
      scene.add({ faz: 'baz' });
      scene.add({ hello: 'world' });

      let removeSpy = sinon.spy(scene, 'remove');
      let addSpy = sinon.spy(scene, 'add');
      let object = {
        thing1: 'thing2'
      };

      scene.objects = [object];

      expect(removeSpy.calledThrice).to.be.true;
      expect(addSpy.calledWith([object])).to.be.true;
      expect(scene.objects.length).to.equal(1);
      expect(scene.objects[0]).to.equal(object);
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should remove the DOM node', () => {
      scene.destroy();

      expect(document.body.contains(scene._dn)).to.be.false;
    });

    it('should call destroy on all objects', () => {
      let object = {
        destroy: sinon.spy()
      };
      scene.add(object);
      scene.destroy();

      expect(object.destroy.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {
    it('should call update on all objects if scene is not hidden', () => {
      let object = {
        update: sinon.spy()
      };
      scene.add(object);
      scene.update();

      expect(object.update.called).to.be.true;
    });

    it('should not call update on all objects if scene is hidden', () => {
      let object = {
        update: sinon.spy()
      };
      scene.add(object);
      scene.hide();
      scene.update();

      expect(object.update.called).to.be.false;
    });

    it('should not error on objects without update function', () => {
      let object = {};
      scene.add(object);

      function fn() {
        scene.update();
      }

      expect(fn).to.not.throw();
    });
  });

  // --------------------------------------------------
  // lookAt
  // --------------------------------------------------
  describe('lookAt', () => {
    it('should set the camera position to the object', () => {
      scene.lookAt({ x: 10, y: 10 });

      expect(scene.camera.x).to.equal(10);
      expect(scene.camera.y).to.equal(10);
    });

    it('should take into account world', () => {
      scene.lookAt({ x: 5, y: 5, world: { x: 10, y: 10 } });

      expect(scene.camera.x).to.equal(10);
      expect(scene.camera.y).to.equal(10);
    });
  });

  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should call render on all objects', () => {
      let object = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.add(object);
      scene.render();

      expect(object.render.called).to.be.true;
    });

    it('should not call render on all objects if scene is hidden', () => {
      let object = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.add(object);
      scene.hide();
      scene.render();

      expect(object.render.called).to.be.false;
    });

    it('should cull objects outside camera bounds', () => {
      let object = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.add(object);
      scene.render();

      expect(object.render.called).to.be.false;
    });

    it('should not cull objects if cullObjects is false', () => {
      let object = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.cullObjects = false;
      scene.add(object);
      scene.render();

      expect(object.render.called).to.be.true;
    });

    it('should not error on objects without render function', () => {
      let object = {};
      scene.add(object);

      function fn() {
        scene.render();
      }

      expect(fn).to.not.throw();
    });

    it('should translate the canvas to the camera', () => {
      let spy = sinon.spy(scene.context, 'translate');

      scene.lookAt({ x: 10, y: 10 });
      scene.render();

      expect(spy.firstCall.calledWith(290, 290)).to.be.true;
      let calls = spy.getCalls();
      expect(calls[calls.length - 2].calledWith(290, 290)).to.be.true;

      spy.restore();
    });

    it('should sort objects', () => {
      scene.cullObjects = false;
      scene.objects = [{ y: 20 }, { y: 10 }];
      scene.sortFunction = (a, b) => a.y - b.y;
      scene.render();

      expect(scene.objects[0].y).to.equal(10);
      expect(scene.objects[1].y).to.equal(20);
    });

    it('should sort objects after being culled', () => {
      let cullSpy = sinon.stub().returns(true);
      let sortSpy = sinon.spy();

      let object1 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      let object2 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };

      scene.objects = [object1, object2];
      scene.cullFunction = cullSpy;
      scene.sortFunction = sortSpy;
      scene.render();

      expect(sortSpy.calledAfter(cullSpy)).to.be.true;
    });
  });
});
