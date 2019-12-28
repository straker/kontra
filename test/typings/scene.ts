import * as kontra from '../../kontra.js';

let scene: kontra.Scene = kontra.Scene({
  id: 'game'
});

let id: String = scene.id;
let name: String = scene.name;
let children: Object[] = scene.children;
let hidden: Boolean = scene.hidden;

scene.show();
scene.hide();
scene.add({x: 1, y: 1});
scene.remove({x: 1, y: 1});
scene.destroy();
scene.update();
scene.update(1/60);
scene.render();

// options
kontra.Scene({
  id: 'options',
  name: 'Options Menu',
  children: [{x: 1, y: 1}],
  onShow() {},
  onHide() {}
});

// custom props
kontra.Scene({
  id: 'game',
  foo: 'bar'
});