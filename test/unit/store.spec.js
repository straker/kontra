import * as store from '../../src/store.js'

// --------------------------------------------------
// store
// --------------------------------------------------
describe('store', () => {

  it('should export api', () => {
    expect(store.getStoreItem).to.be.an('function');
    expect(store.setStoreItem).to.be.an('function');
  });

  it('should be able to save all data types to local storage', () => {
    localStorage.clear();

    var fn = function() {
      store.setStoreItem('boolean', true);
      store.setStoreItem('null', null);
      store.setStoreItem('undefined', undefined);
      store.setStoreItem('number', 1);
      store.setStoreItem('string', 'hello');
      store.setStoreItem('object', {foo: 'bar'});
      store.setStoreItem('array', [1,2]);
    }

    expect(fn).to.not.throw(Error);
  });

  it('should be able to read all data types out of local storage', () => {
    expect(store.getStoreItem('boolean')).to.equal(true);
    expect(store.getStoreItem('number')).to.equal(1);
    expect(store.getStoreItem('string')).to.equal('hello');
    expect(store.getStoreItem('object')).to.eql({foo: 'bar'});
    expect(store.getStoreItem('array')).to.eql([1,2]);
  });

  it('should remove a key from local storage using the set function when passed undefined', () => {
    store.setStoreItem('number', undefined);

    expect(store.getStoreItem('number')).to.not.be.ok;
  });

});