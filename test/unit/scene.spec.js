import Scene from '../../src/scene.js';
import { srOnlyStyle } from '../../src/utils.js'

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

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should setup basic properties', () => {
      expect(scene.id).to.equal('myId');
      expect(scene.name).to.equal('myId');
    });

    it('should set all additional properties on the scene', () => {
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
      expect(scene._dn.getAttribute('aria-label')).to.equal(scene.name);
      expect(document.body.contains(scene._dn)).to.be.true;
    });

    it('should hide the DOM node', () => {
      srOnlyStyle.split(';').forEach(style => {
        let parts = style.split(':');
        expect(scene._dn.style[ parts[0] ]).to.equal(parts[1]);
      });
    });

    it('should allow children', () => {
      let child = {};
      scene = Scene({
        id: 'myId',
        children: [child]
      });

      expect(scene.children.length).to.equal(1);
      expect(scene.children[0]).to.equal(child);
    });

    it('should add any children with DOM nodes to the scenes DOM node', () => {
      let child = {
        _dn: document.createElement('div')
      };
      scene = Scene({
        id: 'myId',
        children: [child]
      });

      expect(scene._dn.contains(child._dn));
    });

  });





  // --------------------------------------------------
  // show
  // --------------------------------------------------
  describe('show', () => {

    it('should unset the hidden property', () => {
      scene.show();

      expect(scene.hidden).to.equal(false);
      expect(scene._dn.hidden).to.equal(false);
    });

    it('should focus the DOM node', () => {
      scene.show();

      expect(document.activeElement).to.equal(scene._dn);
    });

    it('should focus the first focusable child', () => {
      let child = {
        focus: sinon.spy()
      };
      scene = Scene({
        id: 'myId',
        children: [child]
      });
      scene.show();

      expect(child.focus.called).to.be.true;
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
  // addChild
  // --------------------------------------------------
  describe('addChild', () => {

    it('should add any children with DOM nodes to the scenes DOM node', () => {
      let child = {
        _dn: document.createElement('div')
      };
      scene.addChild(child);

      expect(scene._dn.contains(child._dn)).to.be.true;
    });

  });





  // --------------------------------------------------
  // removeChild
  // --------------------------------------------------
  describe('remove', () => {

    it('should remove the DOM node from the scenes DOM node', () => {
      let child = {
        _dn: document.createElement('div')
      };
      scene.addChild(child);
      scene.removeChild(child);

      expect(scene._dn.contains(child._dn)).to.be.false;
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

    it('should call destroy on all children', () => {
      let child = {
        destroy: sinon.spy()
      };
      scene.addChild(child);
      scene.destroy();

      expect(child.destroy.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    it('should call update on all children if scene is not hidden', () => {
      let child = {
        update: sinon.spy()
      };
      console.log('hidden:', scene.hidden);
      scene.addChild(child);
      scene.update();

      expect(child.update.called).to.be.true;
    });

    it('should not call update on all children if scene is hidden', () => {
      let child = {
        update: sinon.spy()
      };
      scene.addChild(child);
      scene.hide();
      scene.update();

      expect(child.update.called).to.be.false;
    });

  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    it('should call render on all children', () => {
      let child = {
        render: sinon.spy()
      };
      scene.addChild(child);
      scene.render();

      expect(child.render.called).to.be.true;
    });

    it('should not call render on all children if scene is hidden', () => {
      let child = {
        render: sinon.spy()
      };
      scene.addChild(child);
      scene.hide();
      scene.render();

      expect(child.render.called).to.be.false;
    });

  });

});