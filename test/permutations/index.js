// this file takes a long time to run as it tests each permutation of the game object preprocess options. only run this test for prs.

const fs = require('fs');
const pp = require('preprocess');
const path = require('path');
const execSync = require('child_process').execSync;

const options = [
  'GAMEOBJECT_GROUP',
  'GAMEOBJECT_VELOCITY',
  'GAMEOBJECT_ACCELERATION',
  'GAMEOBJECT_ROTATION',
  'GAMEOBJECT_TTL',
  'GAMEOBJECT_ANCHOR',
  'GAMEOBJECT_CAMERA'
];

// copy gameObject test so it's up-to-date
let test = fs.readFileSync(path.join(__dirname, '../unit/gameObject.spec.js'), 'utf-8');
test = test.replace('../../src/gameObject.js', './gameObject.js');
fs.writeFileSync(path.join(__dirname, 'gameObject.spec.js'), test, 'utf-8');

let gameObject = fs.readFileSync(path.join(__dirname, '../../src/gameObject.js'), 'utf-8');
gameObject = gameObject.replace('./core.js', '../../src/core.js');
gameObject = gameObject.replace('./vector.js', '../../src/vector.js');
gameObject = gameObject.replace('./utils.js', '../../src/utils.js');

// generate each option and run tests
const numPermutations = 2**(options.length);
for (let i = 0; i < numPermutations; i++) {
  const context = {};

  Object.keys(options).forEach((option, index) => {
    if (!!(2**index & i)) {
      context[ options[option] ] = true;
    }
  });

  let contents = pp.preprocess(
    gameObject,
    context,
    {type: 'js'}
  );
  fs.writeFileSync(path.join(__dirname, 'gameObject.js'), contents, 'utf-8');

  execSync('npx karma start ' + path.join(__dirname, 'karma.conf.js'), {stdio: 'inherit'});
}