import store from '../../src/store.js'

// --------------------------------------------------
// store
// --------------------------------------------------
describe('store', () => {

  it('should be able to save all data types to local storage', () => {
    localStorage.clear();

    var fn = function() {
      store.set('boolean', true);
      store.set('null', null);
      store.set('undefined', undefined);
      store.set('number', 1);
      store.set('string', 'hello');
      store.set('object', {foo: 'bar'});
      store.set('array', [1,2]);
    }

    expect(fn).to.not.throw(Error);
  });

  it('should be able to read all data types out of local storage', () => {
    expect(store.get('boolean')).to.equal(true);
    expect(store.get('number')).to.equal(1);
    expect(store.get('string')).to.equal('hello');
    expect(store.get('object')).to.eql({foo: 'bar'});
    expect(store.get('array')).to.eql([1,2]);
  });

  it('should remove a key from local storage using the set function when passed undefined', () => {
    store.set('number', undefined);

    expect(store.get('number')).to.not.be.ok;
  });

});