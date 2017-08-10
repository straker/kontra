// --------------------------------------------------
// store
// --------------------------------------------------
describe('kontra.store', function() {

  it('should be able to save all data types to local storage', function() {
    localStorage.clear();

    var fn = function() {
      kontra.store.set('boolean', true);
      kontra.store.set('null', null);
      kontra.store.set('undefined', undefined);
      kontra.store.set('number', 1);
      kontra.store.set('string', 'hello');
      kontra.store.set('object', {foo: 'bar'});
      kontra.store.set('array', [1,2]);
    }

    expect(fn).to.not.throw(Error);
  });

  it('should be able to read all data types out of local storage', function() {
    expect(kontra.store.get('boolean')).to.equal(true);
    expect(kontra.store.get('number')).to.equal(1);
    expect(kontra.store.get('string')).to.equal('hello');
    expect(kontra.store.get('object')).to.eql({foo: 'bar'});
    expect(kontra.store.get('array')).to.eql([1,2]);
  });

  it('should remove a key from local storage using the set function when passed undefined', function() {
    kontra.store.set('number', undefined);

    expect(kontra.store.get('number')).to.not.be.ok;
  });

});