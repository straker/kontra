import * as kontra from '../../kontra.js';

let img: HTMLImageElement = kontra.imageAssets.image;
let audio: HTMLAudioElement = kontra.audioAssets.audio;
let data: string = kontra.dataAssets.myStr;
let json: object = kontra.dataAssets.json;

kontra.setImagePath('/imgs');
kontra.setAudioPath('/audio');
kontra.setDataPath('/data');

kontra.loadImage('./path/to/img.png')
  .then(img => {
    let image: HTMLImageElement = img;
  });
kontra.loadAudio('./path/to/audio.mp3')
  .then(audio => {
    let song: HTMLAudioElement = audio;
  });
kontra.loadData('./path/to/data.txt')
  .then(data => {
    let txt: string = data;
  });
kontra.loadData('./path/to/data.json')
  .then(data => {
    let json: object = data;
  });

kontra.load('./path/to/img.png')
  .then(assets => {
    let image: HTMLImageElement = assets[0];
  });
kontra.load(
  './path/to/img.png',
  './path/to/audio.mp3',
  './path/to/data.txt',
  './path/to/data.json'
)
  .then(assets => {
    let image: HTMLImageElement = assets[0];
    let audio: HTMLAudioElement = assets[1];
    let data: string = assets[2];
    let json: object = assets[3];
  });