import * as kontra from '../../kontra.js';

kontra.setStoreItem('key', true);

let item: boolean = kontra.getStoreItem('key');