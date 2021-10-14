import Button, { ButtonClass } from '../../src/button.js';
import Text, { TextClass } from '../../src/text.js';
import { initPointer, resetPointers } from '../../src/pointer.js';
import { srOnlyStyle } from '../../src/utils.js';

// --------------------------------------------------
// button
// --------------------------------------------------
describe('button', () => {
  let button;
  beforeEach(() => {
    initPointer();

    button = Button({
      text: {
        text: 'Hello'
      }
    });
  });

  afterEach(() => {
    button.destroy();
    resetPointers();
  });

  it('should export class', () => {
    expect(ButtonClass).to.be.a('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should set default properties', () => {
      button.destroy();
      button = Button();

      expect(button.padX).to.equal(0);
      expect(button.padY).to.equal(0);
      expect(button.textNode instanceof TextClass).to.be.true;
    });

    it('should setup text properties', () => {
      button.destroy();
      button = Button({
        text: {
          text: 'Hello',
          font: '32px Arial',
          width: 100,
          color: 'black'
        }
      });

      expect(button.textNode).to.exist;
      expect(button.textNode.width).to.equal(100);
      expect(button.textNode.height).to.equal(32);
      expect(button.textNode.font).to.equal('32px Arial');
      expect(button.textNode.text).to.equal('Hello');
      expect(button.textNode.color).to.equal('black');
    });

    it('should start disabled if specified', () => {
      button.destroy();
      button = Button({
        disabled: true
      });

      expect(button.disabled).to.be.true;
    });

    it('should default width to the text size', () => {
      button.destroy();
      button = Button({
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).to.equal(100);
    });

    it('should set the button to the width if it is greater', () => {
      button.destroy();
      button = Button({
        width: 150,
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).to.equal(150);
    });

    it('should set the button to the text width if it is greater', () => {
      button.destroy();
      button = Button({
        width: 50,
        text: {
          text: 'Hello',
          width: 100
        }
      });

      expect(button.width).to.equal(100);
    });

    it('should pass the context to the textNode', () => {
      let canvas = document.createElement('canvas');
      initPointer({ canvas });
      let context = canvas.getContext('2d');

      button.destroy();
      button = Button({
        context
      });

      expect(button.textNode.context).to.equal(context);
    });

    it('should create a DOM node and add it to the page', () => {
      expect(button._dn).to.exist;
      expect(button._dn instanceof HTMLButtonElement).to.be.true;
      expect(button._dn.textContent).to.equal('Hello');
      expect(document.body.contains(button._dn)).to.be.true;
    });

    it('should add the button as an immediate sibling to the canvas', () => {
      expect(button.context.canvas.nextSibling).to.equal(button._dn);
    });

    it('should hide the DOM node', () => {
      srOnlyStyle.split(';').forEach(style => {
        let parts = style.split(':');
        expect(button._dn.style[parts[0]]).to.equal(parts[1]);
      });
    });

    it('should setup focus event listeners on the DOM node', () => {
      sinon.spy(button, 'focus');
      button._dn.focus();

      expect(button.focus.called).to.be.true;
    });

    it('should setup blur event listeners on the DOM node', () => {
      sinon.spy(button, 'blur');
      button._dn.focus();
      button._dn.blur();

      expect(button.blur.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // keyboard events
  // --------------------------------------------------
  describe('keyboard events', () => {
    function simulateEvent(type, config) {
      let evt;

      // PhantomJS <2.0.0 throws an error for the `new Event` call, so we need to supply an
      // alternative form of creating an event just for PhantomJS
      // @see https://github.com/ariya/phantomjs/issues/11289#issuecomment-38880333
      try {
        evt = new Event(type);
      } catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(type, true, false);
      }

      config = config || {};
      for (let prop in config) {
        evt[prop] = config[prop];
      }

      button._dn.dispatchEvent(evt);
    }

    // --------------------------------------------------
    // onDown
    // --------------------------------------------------
    describe('onDown', () => {
      it('should call onDown if Enter is pressed', () => {
        sinon.spy(button, 'onDown');
        simulateEvent('keydown', { code: 'Enter' });

        expect(button.onDown.called).to.be.true;
      });

      it('should call onDown if Space is pressed', () => {
        sinon.spy(button, 'onDown');
        simulateEvent('keydown', { code: 'Space' });

        expect(button.onDown.called).to.be.true;
      });

      it('should not call onDown if any other key is pressed', () => {
        sinon.spy(button, 'onDown');
        simulateEvent('keydown', { code: 'KeyA' });

        expect(button.onDown.called).to.be.false;
      });
    });

    // --------------------------------------------------
    // onUp
    // --------------------------------------------------
    describe('onUp', () => {
      it('should call onUp if Enter is pressed', () => {
        sinon.spy(button, 'onUp');
        simulateEvent('keyup', { code: 'Enter' });

        expect(button.onUp.called).to.be.true;
      });

      it('should call onUp if Space is pressed', () => {
        sinon.spy(button, 'onUp');
        simulateEvent('keyup', { code: 'Space' });

        expect(button.onUp.called).to.be.true;
      });

      it('should not call onUp if any other key is pressed', () => {
        sinon.spy(button, 'onUp');
        simulateEvent('keyup', { code: 'KeyA' });

        expect(button.onUp.called).to.be.false;
      });
    });
  });

  // --------------------------------------------------
  // text
  // --------------------------------------------------
  describe('text', () => {
    it('should return the text of the textNode', () => {
      expect(button.text).to.equal('Hello');
    });

    it('should set the text of the textNode', () => {
      button.text = 'my text';

      expect(button.textNode.text).to.equal('my text');
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should remove the DOM node', () => {
      button.destroy();

      expect(document.body.contains(button._dn)).to.be.false;
    });
  });

  // --------------------------------------------------
  // prerender
  // --------------------------------------------------
  describe('prerender', () => {
    it('should be called if a property was changed since the last render', () => {
      sinon.stub(button, '_p');

      button.render();

      expect(button._p.called).to.be.false;

      button.text = 'Foo';

      button.render();

      expect(button._p.called).to.be.true;
    });

    it('should update the DOM node text if the button text has changed', () => {
      button.text = 'World!';
      button.render();

      expect(button.text).to.equal('World!');
    });

    it('should update the width and height of the button if the text changes', () => {
      expect(button.width).to.be.below(50);

      button.textNode.font = '32px Arial';
      button.text = 'Hello World!';
      button.render();

      expect(button.width).to.be.above(50);
      expect(button.height).to.equal(32);
    });

    it('should not update the wdith and height of the button if the button width is great', () => {
      button.width = 300;
      button.height = 300;

      button.textNode.font = '32px Arial';
      button.text = 'Hello World!';
      button.render();

      expect(button.width).to.be.equal(300);
      expect(button.height).to.equal(300);
    });
  });

  // --------------------------------------------------
  // focus
  // --------------------------------------------------
  describe('focus', () => {
    it('should set the focused property', () => {
      button.focused = false;
      button.focus();

      expect(button.focused).to.be.true;
    });

    it('should call onFocus', () => {
      sinon.spy(button, 'onFocus');
      button.focus();

      expect(button.onFocus.called).to.be.true;
    });

    it('should focus the DOM node', () => {
      sinon.spy(button._dn, 'focus');
      button.focus();

      expect(button._dn.focus.called).to.be.true;
    });

    it('should not focus the DOM node if it is already focused', () => {
      button._dn.focus();
      sinon.spy(button._dn, 'focus');
      button.focus();

      expect(button._dn.focus.called).to.be.false;
    });

    it('should not focus if button is disabled', () => {
      button.focused = false;
      button.disabled = true;
      sinon.spy(button, 'onFocus');
      button.focus();

      expect(button.focused).to.be.false;
      expect(button.onFocus.called).to.be.false;
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
      button.focused = true;
      button.blur();

      expect(button.focused).to.be.false;
    });

    it('should call onBlur', () => {
      sinon.spy(button, 'onBlur');
      button.blur();

      expect(button.onBlur.called).to.be.true;
    });

    it('should blur the DOM node', () => {
      button._dn.focus();
      sinon.spy(button._dn, 'blur');
      button.blur();

      expect(button._dn.blur.called).to.be.true;
    });

    it('should not blur the DOM node if it is already blurred', () => {
      button._dn.blur();
      sinon.spy(button._dn, 'blur');
      button.blur();

      expect(button._dn.blur.called).to.be.false;
    });
  });

  // --------------------------------------------------
  // enable
  // --------------------------------------------------
  describe('enable', () => {
    it('should unset the disabled property', () => {
      button.disabled = true;
      button.enable();

      expect(button.disabled).to.be.false;
    });

    it('should unset the DOM nodes disable property', () => {
      button.enable();

      expect(button._dn.disabled).to.be.false;
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
      button.disabled = false;
      button.disable();

      expect(button.disabled).to.be.true;
    });

    it('should set the DOM nodes disable property', () => {
      button.disable();

      expect(button._dn.disabled).to.be.true;
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
    it('should set the hovered property', () => {
      button.hovered = false;
      button.onOver();

      expect(button.hovered).to.be.true;
    });

    it('should not hover if button is disabled', () => {
      button.hovered = false;
      button.disabled = true;
      button.onOver();

      expect(button.hovered).to.be.false;
    });
  });

  // --------------------------------------------------
  // onOut
  // --------------------------------------------------
  describe('onOut', () => {
    it('should unset the hovered property', () => {
      button.hovered = true;
      button.onOut();

      expect(button.hovered).to.be.false;
    });
  });

  // --------------------------------------------------
  // onDown
  // --------------------------------------------------
  describe('onDown', () => {
    it('should set the pressed property', () => {
      button.pressed = false;
      button.onDown();

      expect(button.pressed).to.be.true;
    });

    it('should call onDown if passed', () => {
      let spy = sinon.spy();

      button = new Button({
        text: {
          text: 'Hello'
        },
        onDown: spy
      });
      button.onDown();

      expect(spy.called).to.be.true;
    });

    it('should not press if button is disabled', () => {
      button.pressed = false;
      button.disabled = true;
      button.onDown();

      expect(button.pressed).to.be.false;
    });
  });

  // --------------------------------------------------
  // onUp
  // --------------------------------------------------
  describe('onUp', () => {
    it('should unset the pressed property', () => {
      button.pressed = true;
      button.onUp();

      expect(button.pressed).to.be.false;
    });

    it('should call onUp if passed', () => {
      let spy = sinon.spy();

      button = new Button({
        text: {
          text: 'Hello'
        },
        onUp: spy
      });
      button.onUp();

      expect(spy.called).to.be.true;
    });

    it('should not press if button is disabled', () => {
      button.pressed = true;
      button.disabled = true;
      button.onUp();

      expect(button.pressed).to.be.true;
    });
  });
});
