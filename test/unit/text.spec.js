import Text from '../../src/text.js';
import { init, getCanvas, getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

if (!getCanvas()) {
  let canvas = document.createElement('canvas');
  canvas.width = canvas.height = 600;
  init(canvas);
}

let testText = Text({
  text: 'Hello\nWorld',
  font: '32px Arial',
  color: 'black',
});

// optional properties
sinon.spy(testText.context, 'fillText');

let hasNewline = testText._s.length === 2;

testText.width = 1000;
let hasAutoNewline = testText.hasOwnProperty('_fw');

testText.context.canvas.dir = 'rtl';
testText.render(0, 0);

let hasRTL = testText.context.fillText.calledWith(testText.text, 1000, 0) === true;

testText.context.canvas.dir = 'left';
testText.textAlign = 'right';

let hasTextAlign = testText.context.fillText.calledWith(testText.text, 1000, 0) === true;

testText.context.fillText.restore();

let properties = {
  autoNewline: hasAutoNewline,
  newline: hasNewline,
  rtl: hasRTL,
  textAlign: hasTextAlign
};

// --------------------------------------------------
// text
// --------------------------------------------------
describe('text with properties: ' + JSON.stringify(properties,null,4), () => {

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should prerender the text and setup needed properties', () => {
      let text = Text({
        text: 'Hello',
        font: '32px Arial',
        color: 'black'
      });

      expect(text._s).to.exist;
      expect(text.width).to.be.above(70);
      expect(text.height).to.equal(32);
      expect(text.font).to.equal('32px Arial');
      expect(text.text).to.equal('Hello');
      expect(text.color).to.equal('black');
    });

    it('should set the text as dirty when setting font', () => {
      let text = Text({text: ''});

      expect(text._d).to.be.false;

      text.font = '32px Arial';

      expect(text._d).to.be.true;
    });

    it('should set the text as dirty when setting text', () => {
      let text = Text({text: ''});

      expect(text._d).to.be.false;

      text.text = 'Hello';

      expect(text._d).to.be.true;
    });

    it('should set the text as dirty when setting width', () => {
      let text = Text({text: ''});

      expect(text._d).to.be.false;

      text.width = 100;

      expect(text._d).to.be.true;
    });

  });





  // --------------------------------------------------
  // prerender
  // --------------------------------------------------
  describe('prerender', () => {

    it('should calculate the width based on the size of the text and font', () => {
      let text = Text({
        text: 'Hello',
        font: '32px Arial',
        color: 'black'
      });
      text.context.font = text.font;
      let width = text.context.measureText(text.text).width;

      expect(text.width).to.equal(width);
    });

    it('should calculate the height based on the font', () => {
      let text = Text({
        text: 'Hello',
        font: '32px Arial',
        color: 'black'
      });

      expect(text.height).to.equal(32);
    });

    if (hasNewline) {
      it('should calculate new lines', () => {
        let text = Text({
          text: 'Hello\nWorld',
          font: '32px Arial',
          color: 'black'
        });

        expect(text._s.length).to.equal(2);
        expect(text._s).to.deep.equal(['Hello', 'World']);
      });

      it('should calculate the width of a text with new lines as the width of the longest line', () => {
        let text = Text({
          text: 'Hello There\nWorld',
          font: '32px Arial',
          color: 'black'
        });
        text.context.font = text.font;
        let width = text.context.measureText('Hello There').width;

        expect(text.width).to.equal(width);
      });


      it('should calculate the height based on the number of lines', () => {
        let text = Text({
          text: 'Hello\nWorld',
          font: '32px Arial',
          color: 'black'
        });

        expect(text.height).to.be.above(32);
      });
    }

    if (hasAutoNewline) {
      it('should calculate new lines when the width is set', function() {
        let text = Text({
          text: 'Hello World',
          font: '32px Arial',
          color: 'black',
          width: 50
        });

        expect(text._s.length).to.equal(2);
        expect(text._s).to.deep.equal(['Hello', 'World']);
      });

      it('should calculate the height based on the number of lines', () => {
        let text = Text({
          text: 'Hello World',
          font: '32px Arial',
          color: 'black',
          width: 50
        });

        expect(text.height).to.be.above(32);
      });
    }

  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    it('should render the text', () => {
      let text = Text({
        text: 'Hello World',
        font: '32px Arial',
        color: 'black',
      });

      sinon.spy(text.context, 'fillText');

      text.render(0, 0);

      expect(text.context.fillText.called).to.be.true;
      text.context.fillText.restore();
    });

    if (hasTextAlign) {
      it('should respect textAlign property', () => {
        let text = Text({
          text: 'Hello World',
          font: '32px Arial',
          color: 'black',
          width: 1000
        });

        sinon.spy(text.context, 'fillText');

        text.textAlign = 'center';
        text.render(0, 0);

        expect(text.context.fillText.calledWith(text.text, 500, 0)).to.be.true;

        text.textAlign = 'right';
        text.render(0, 0);

        expect(text.context.fillText.calledWith(text.text, 1000, 0)).to.be.true;
        text.context.fillText.restore();
      });
    }

    if (hasRTL) {
      it('should handle RTL languages', () => {
        let text = Text({
          text: 'Hello World',
          font: '32px Arial',
          color: 'black',
          width: 1000
        });

        sinon.spy(text.context, 'fillText');

        text.context.canvas.dir = 'rtl';
        text.render(0, 0);

        expect(text.context.fillText.calledWith(text.text, 1000, 0)).to.be.true;
        text.context.fillText.restore();
      });
    }

  });

});