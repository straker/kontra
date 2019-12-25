import Button from '../../src/button.js';
import { init, getCanvas, getContext } from '../../src/core.js'
import { noop, srOnlyStyle } from '../../src/utils.js'

if (!getCanvas()) {
  let canvas = document.createElement('canvas');
  canvas.width = canvas.height = 600;
  init(canvas);
}

// --------------------------------------------------
// text
// --------------------------------------------------
describe('button', () => {

  let button;
  beforeEach(() => {
   button = Button({
      text: 'Hello'
    });
  });

  afterEach(() => {
    button.destory();
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should create a DOM node and add it to the page', () => {
      expect(button._b).to.exist;
      expect(button._b instanceof HTMLButtonElement).to.be.true;
      expect(button._b.textContent).to.equal('Hello');
      expect(document.body.contains(button._b));
    });

    it('should hide the DOM node', () => {
      srOnlyStyle.split(';').forEach(style => {
        let parts = style.split(':');
        expect(button._b.style[ parts[0] ]).to.equal(parts[1]);
      });
    });

    it('should setup focus event listeners on the DOM node', () => {
      sinon.spy(button, 'focus');
      button._b.focus();
      expect(button.focus.called).to.be.true;
    });

    it('should setup blur event listeners on the DOM node', () => {
      sinon.spy(button, 'blur');
      button._b.focus();
      button._b.blur();
      expect(button.blur.called).to.be.true;
    });

    it('should setup click event listeners on the DOM node', () => {
      sinon.spy(button, 'onUp');
      button._b.click();
      expect(button.onUp.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    it('should update the DOM node text if the button text has changed', () => {
      button.text = 'World!';
      button.render();
      expect(button.text).to.equal('World!');
    });

  });





  // --------------------------------------------------
  // focus
  // --------------------------------------------------
  describe('focus', () => {

    it('should set the focused property', () => {
      button.focus();
      expect(button.focused).to.be.true;
    });

    it('should call onFocus', () => {
      sinon.spy(button, 'onFocus');
      button.focus();
      expect(button.onFocus.called).to.be.true;
    });

    it('should focus the DOM node', () => {
      sinon.spy(button._b, 'focus');
      button.focus();
      expect(button._b.focus.called).to.be.true;
    });

    it('should not focus the DOM node if it is already focused', () => {
      button._b.focus();
      sinon.spy(button._b, 'focus');
      button.focus();
      expect(button._b.focus.called).to.be.false;
    });

  });





  // --------------------------------------------------
  // blur
  // --------------------------------------------------
  describe('blur', () => {

    beforeEach(() => {
      button.focus();
    });

    it('should unset the focused property', () => {
      button.blur();
      expect(button.focused).to.be.false;
    });

    it('should call onBlur', () => {
      sinon.spy(button, 'onBlur');
      button.blur();
      expect(button.onBlur.called).to.be.true;
    });

    it('should blur the DOM node', () => {
      button._b.focus();
      sinon.spy(button._b, 'blur');
      button.blur();
      expect(button._b.blur.called).to.be.true;
    });

    it('should not blur the DOM node if it is already blurred', () => {
      button._b.blur();
      sinon.spy(button._b, 'blur');
      button.blur();
      expect(button._b.blur.called).to.be.false;
    });

  });





  // --------------------------------------------------
  // enable
  // --------------------------------------------------
  describe('enable', () => {

    it('should unset the disabled property', () => {
      button.enable();
      expect(button.disabled).to.be.false;
    });

    it('should unset the DOM nodes disable property', () => {
      button.enable();
      expect(button._b.disabled).to.be.false;
    });

    it('should call onEnable', () => {
      sinon.spy(button, 'onEnable');
      button.enable();
      expect(button.onEnable.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // disable
  // --------------------------------------------------
  describe('disable', () => {

    it('should set the disabled property', () => {
      button.disable();
      expect(button.disabled).to.be.true;
    });

    it('should set the DOM nodes disable property', () => {
      button.disable();
      expect(button._b.disabled).to.be.true;
    });

    it('should call onDisable', () => {
      sinon.spy(button, 'onDisable');
      button.disable();
      expect(button.onDisable.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // onOver
  // --------------------------------------------------
  describe('onOver', () => {

    it('should call focus', () => {
      sinon.spy(button, 'focus');
      button.onOver();
      expect(button.focus.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // onOut
  // --------------------------------------------------
  describe('onOut', () => {

    it('should call blur', () => {
      sinon.spy(button, 'blur');
      button.onOut();
      expect(button.blur.called).to.be.true;
    });

  });

});