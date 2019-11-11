declare namespace kontra {
  function on(event: string, callback: Function): void;
  function off(event: string, callback: Function): void;
  function emit(event: string, ...args: any): void;
  function getCanvas(): HTMLCanvasElement;
  function getContext(): CanvasRenderingContext2D;
  function init(canvas?: string | HTMLCanvasElement): {canvas: HTMLCanvasElement, context: CanvasRenderingContext2D};
  interface Animation {
    spriteSheet: SpriteSheet;
    frames: number[];
    frameRate: number;
    loop: boolean;
    width: number;
    height: number;
    margin: number;
    clone(): Animation;
    reset(): void;
    update(dt?: number): void;
    render(properties: {x: number, y: number, width?: number, height?: number, context?: CanvasRenderingContext2D}): void;
  }
  interface AnimationConstructor {
    readonly class: AnimationConstructor;
    readonly prototype: Animation;
    new(properties: {spriteSheet: SpriteSheet, frames: number[], frameRate: number, loop?: boolean}): Animation;
    (properties: {spriteSheet: SpriteSheet, frames: number[], frameRate: number, loop?: boolean}): Animation;
  }
  var Animation: AnimationConstructor
  var imageAssets: {[name: string]: HTMLImageElement};
  var audioAssets: {[name: string]: HTMLAudioElement};
  var dataAssets: {[name: string]: any};
  function setImagePath(path: string): void;
  function setAudioPath(path: string): void;
  function setDataPath(path: string): void;
  function loadImage(url: string): Promise<HTMLImageElement>;
  function loadAudio(url: string): Promise<HTMLAudioElement>;
  function loadData(url: string): Promise<any>;
  function load(urls: string | string[]): Promise<any>;
  function collides(object1: object, object2: object): boolean | null;
  interface GameLoop {
    update(dt: number): void;
    render(): void;
    isStopped: boolean;
    start(): void;
    stop(): void;
  }
  interface GameLoopConstructor {
    readonly class: GameLoopConstructor;
    readonly prototype: GameLoop;
    new(properties: {update: Function, render: Function, fps?: number, clearCanvas?: boolean}): GameLoop;
    (properties: {update: Function, render: Function, fps?: number, clearCanvas?: boolean}): GameLoop;
  }
  var GameLoop: GameLoopConstructor
  var keyMap: object;
  function initKeys(): void;
  function bindKeys(keys: string | string[], callback: Function): void;
  function unbindKeys(keys: string | string[]): void;
  function keyPressed(key: string): boolean;
  function registerPlugin(kontraObj: object, pluginObj: object): void;
  function unregisterPlugin(kontraObj: object, pluginObj: object): void;
  function extendObject(kontraObj: object, properties: object): void;
  var pointer: object;
  function initPointer(): void;
  function track(objects: object | object[]): void;
  function untrack(objects: object | object[]): void;
  function pointerOver(object: object): boolean;
  function onPointerDown(callback: Function): void;
  function onPointerUp(callback: Function): void;
  function pointerPressed(button: string): boolean;
  interface Pool {
    objects: object[];
    size: number;
    maxSize: number;
    get(properties: object): object;
    getAliveObjects(): object[];
    clear(): void;
    update(dt?: number): void;
    render(): void;
  }
  interface PoolConstructor {
    readonly class: PoolConstructor;
    readonly prototype: Pool;
    new(properties: {create: Function, maxSize?: number}): Pool;
    (properties: {create: Function, maxSize?: number}): Pool;
  }
  var Pool: PoolConstructor
  interface Quadtree {
    maxDepth: number;
    maxObjects: number;
    bounds: object;
    clear(): void;
    get(object: object): object[];
    add(objects: object | object[]): void;
  }
  interface QuadtreeConstructor {
    readonly class: QuadtreeConstructor;
    readonly prototype: Quadtree;
    new(properties: {maxDepth?: number, maxObjects?: number, bounds?: object}): Quadtree;
    (properties: {maxDepth?: number, maxObjects?: number, bounds?: object}): Quadtree;
  }
  var Quadtree: QuadtreeConstructor
  interface Vector {
    add(vector: Vector, dt?: number): Vector;
    clamp(xMin: number, yMin: number, xMax: number, yMax: number): void;
    x: number;
    y: number;
  }
  interface VectorConstructor {
    readonly class: VectorConstructor;
    readonly prototype: Vector;
    new(x?: number, y?: number): Vector;
    (x?: number, y?: number): Vector;
  }
  var Vector: VectorConstructor
  interface GameObject {
    init(properties: object): void;
    position: Vector;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    localPosition: Vector;
    localRotation: Vector;
    parent: GameObject;
    children: GameObject[];
    velocity: Vector;
    acceleration: Vector;
    rotation: number;
    ttl: number;
    anchor: object;
    sx: number;
    sy: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    ddx: number;
    ddy: number;
    readonly viewX: number;
    readonly viewY: number;
    isAlive(): boolean;
    update(dt?: number): void;
    advance(dt?: number): void;
    render(): void;
    draw(): void;
    color: string;
    [prop: string]: any;
  }
  interface GameObjectConstructor {
    readonly class: GameObjectConstructor;
    readonly prototype: GameObject;
    new(properties?: {x?: number, y?: number, dx?: number, dy?: number, ddx?: number, ddy?: number, width?: number, height?: number, ttl?: number, rotation?: number, anchor?: object, context?: CanvasRenderingContext2D, update?: Function, render?: Function, [props: string]: any}): GameObject;
    (properties?: {x?: number, y?: number, dx?: number, dy?: number, ddx?: number, ddy?: number, width?: number, height?: number, ttl?: number, rotation?: number, anchor?: object, context?: CanvasRenderingContext2D, update?: Function, render?: Function, [props: string]: any}): GameObject;
  }
  var GameObject: GameObjectConstructor
  interface Sprite extends GameObject {
    width: number;
    height: number;
    image: HTMLImageElement | HTMLCanvasElement;
    animations: object;
    currentAnimation: Animation;
    playAnimation(name: string): void;
  }
  interface SpriteConstructor {
    readonly class: SpriteConstructor;
    readonly prototype: Sprite;
    new(properties?: {color?: string, image?: HTMLImageElement | HTMLCanvasElement, animations?: object, x?: number, y?: number, dx?: number, dy?: number, ddx?: number, ddy?: number, width?: number, height?: number, ttl?: number, rotation?: number, anchor?: object, context?: CanvasRenderingContext2D, update?: Function, render?: Function, [props: string]: any}): Sprite;
    (properties?: {color?: string, image?: HTMLImageElement | HTMLCanvasElement, animations?: object, x?: number, y?: number, dx?: number, dy?: number, ddx?: number, ddy?: number, width?: number, height?: number, ttl?: number, rotation?: number, anchor?: object, context?: CanvasRenderingContext2D, update?: Function, render?: Function, [props: string]: any}): Sprite;
  }
  var Sprite: SpriteConstructor
  interface SpriteSheet {
    animations: object;
    image: HTMLImageElement | HTMLCanvasElement;
    frame: object;
    createAnimations(animations: object): void;
  }
  interface SpriteSheetConstructor {
    readonly class: SpriteSheetConstructor;
    readonly prototype: SpriteSheet;
    new(properties: {image: HTMLImageElement | HTMLCanvasElement, frameWidth: number, frameHeight: number, frameMargin?: number, animations?: object}): SpriteSheet;
    (properties: {image: HTMLImageElement | HTMLCanvasElement, frameWidth: number, frameHeight: number, frameMargin?: number, animations?: object}): SpriteSheet;
  }
  var SpriteSheet: SpriteSheetConstructor
  function setStoreItem(key: string, value: any): void;
  function getStoreItem(key: string): any;
  interface TileEngine {
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    layers: object[];
    tilesets: object[];
    context: CanvasRenderingContext2D;
    mapwidth: number;
    mapheight: number;
    sx: number;
    sy: number;
    render(): void;
    renderLayer(name: string): void;
    layerCollidesWith(name: string, object: object): boolean;
    tileAtLayer(name: string, position: object): number;
    setTileAtLayer(name: string, position: object, tile: number): void;
    setLayer(name: string, data: number[]): void;
    addObject(object: object): void;
    removeObject(object: object): void;
  }
  interface TileEngineConstructor {
    readonly class: TileEngineConstructor;
    readonly prototype: TileEngine;
    new(properties: {width: number, height: number, tilewidth: number, tileheight: number, context?: CanvasRenderingContext2D, tilesets: object[], layers: object[]}): TileEngine;
    (properties: {width: number, height: number, tilewidth: number, tileheight: number, context?: CanvasRenderingContext2D, tilesets: object[], layers: object[]}): TileEngine;
  }
  var TileEngine: TileEngineConstructor
}

export = kontra