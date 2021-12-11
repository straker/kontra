import * as kontra from '../../kontra.js';

let scene: kontra.Scene = kontra.Scene({
  id: 'game'
});

let id: string = scene.id;
let name: string = scene.name;
let hidden: boolean = scene.hidden;
let context: CanvasRenderingContext2D = scene.context;
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

scene.add({x: 10, y: 20});

let sprite = kontra.Sprite();
scene.add(sprite);
scene.add({x: 10, y: 20}, sprite);
scene.add([{x: 10, y: 20}, sprite]);

scene.remove({x: 10, y: 20});
scene.remove(sprite);
scene.remove({x: 10, y: 20}, sprite);
scene.remove([{x: 10, y: 20}, sprite]);

// options
kontra.Scene({
  id: 'options',
  name: 'Options Menu',
  objects: [kontra.GameObject()],
  onShow() {},
  onHide() {}
});

// custom props
kontra.Scene({
  id: 'game'
});

// extends
class CustomScene extends kontra.SceneClass {}
let myScene = new CustomScene({
  id: 'game'
});
myScene.lookAt({x: 10, y: 20});