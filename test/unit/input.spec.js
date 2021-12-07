import * as input from '../../src/input.js';
import { getPointer } from '../../src/pointer.js';

// --------------------------------------------------
// input
// --------------------------------------------------
describe('input', () => {
  it('should export api', () => {
    expect(input.initInput).to.be.an('function');
    expect(input.onInput).to.be.an('function');
    expect(input.offInput).to.be.an('function');
  });

  // --------------------------------------------------
  // initInput
  // --------------------------------------------------
  it('should init inputs', () => {
    input.initInput();
  });

  it('should pass pointer options', () => {
    input.initInput({
      pointer: { radius: 10 }
    });

    expect(getPointer().radius).to.equal(10);
  });

  // --------------------------------------------------
  // onInput
  // --------------------------------------------------
  it('should call the callback when key is pressed', () => {});
});
