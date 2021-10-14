import * as kontra from '../../kontra.js';

let scene: kontra.Scene = kontra.Scene({
  id: 'game'
});

let id: string = scene.id;
let name: string = scene.name;
let hidden: boolean = scene.hidden;
let cullObjects: boolean = scene.cullObjects;
let camera: kontra.GameObject = scene.camera;

scene.cullFunction();
scene.show();
scene.hide();
scene.destroy();
scene.update();
scene.update(1/60);
scene.render();
scene.lookAt({x: 10, y: 20});
scene.onShow();
scene.onHide();

// options
kontra.Scene({
  id: 'options',
  name: 'Options Menu',
  children: [kontra.GameObject()],
  onShow() {},
  onHide() {}
});

// custom props
kontra.Scene({
  id: 'game',
  foo: 'bar'
});

// extends
class CustomScene extends kontra.SceneClass {}
let myScene = new CustomScene({
  id: 'game'
});
myScene.lookAt({x: 10, y: 20});