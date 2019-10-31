// this file takes a long time to run as it tests each permutation of the sprite preprocess options. only run this test for prs.

const fs = require('fs');
const pp = require('preprocess');
const path = require('path');
const execSync = require('child_process').execSync;

const options = [
  'VELOCITY',
  'ACCELERATION',
  'ROTATION',
  'TTL',
  'ANCHOR',
  'CAMERA',
  'IMAGE',
  'ANIMATION'
];

// copy sprite test so it's up-to-date
let test = fs.readFileSync(path.join(__dirname, '../unit/sprite.spec.js'), 'utf-8');
test = test.replace('../../src/sprite.js', './sprite.js');
fs.writeFileSync(path.join(__dirname, 'sprite.spec.js'), test, 'utf-8');

let sprite = fs.readFileSync(path.join(__dirname, '../../src/sprite.js'), 'utf-8');
sprite = sprite.replace('./core.js', '../../src/core.js');
sprite = sprite.replace('./vector.js', '../../src/vector.js');

// generate each option and run tests
const numPermutations = 2**(options.length);
for (let i = 0; i < numPermutations; i++) {
  const context = {};

  Object.keys(options).forEach((option, index) => {
    if (!!(2**index & i)) {
      context[ options[option] ] = true;
    }
  });

  let spriteContents = pp.preprocess(
    sprite,
    context,
    {type: 'js'}
  );
  fs.writeFileSync(path.join(__dirname, 'sprite.js'), spriteContents, 'utf-8');

  execSync('npx karma start ' + path.join(__dirname, 'karma.conf.js'), {stdio: 'inherit'});
}