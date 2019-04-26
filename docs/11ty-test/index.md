---
layout: layout.liquid
title: Kontra.store
methods:
  - name: set
    desc: Add or update a key value in local storage.
    params:
      - name: key
        type: string
        desc: Key to set.
      - name: value
        type: '*'
        desc: Value to add.
  - name: get
    desc: Get a keys value from local storage.
    params:
      - name: key
        type: string
        desc: Key to retrieve.
properties:
  - name: thing1
    type: object
---

A simple interface to local storage based on [store.js](https://github.com/marcuswestin/store.js), whose sole purpose is to ensure that any keys you save to local storage come out the same type as when they went in.

Normally when you save something to local storage, it converts it into a string. So if you were to save a number, it would be saved as `"12"` instead of `12`. This means when you retrieved the number, it would now be a string.

```js
kontra.store.set('highScore', 100);

kontra.store.get('highScore');  //=> 100
```