// this file takes a very long time to run as it tests each permutation of the different objects preprocess options. only run this test for prs.

const fs = require('fs');
const pp = require('preprocess');
const path = require('path');
const execSync = require('child_process').execSync;
const rollup = require('rollup');

let options = {
  updatable: ['GAMEOBJECT_VELOCITY', 'GAMEOBJECT_ACCELERATION', 'GAMEOBJECT_TTL', 'VECTOR_SCALE'],
  gameObject: [
    'GAMEOBJECT_ANCHOR',
    'GAMEOBJECT_CAMERA',
    'GAMEOBJECT_GROUP',
    'GAMEOBJECT_OPACITY',
    'GAMEOBJECT_ROTATION',
    'GAMEOBJECT_SCALE'
  ],
  sprite: ['SPRITE_IMAGE', 'SPRITE_ANIMATION'],
  text: ['TEXT_AUTONEWLINE', 'TEXT_NEWLINE', 'TEXT_RTL', 'TEXT_ALIGN'],
  vector: [
    'VECTOR_ANGLE',
    'VECTOR_CLAMP',
    'VECTOR_DISTANCE',
    'VECTOR_DOT',
    'VECTOR_LENGTH',
    'VECTOR_NORMALIZE',
    'VECTOR_SCALE',
    'VECTOR_SUBTRACT'
  ]
};

// run permutations in parallel by passing in which permutation suite to run
const optionName = process.argv.slice(2)[0];
if (optionName && options[optionName]) {
  options = {
    [optionName]: options[optionName]
  };
}

Object.keys(options).forEach(async option => {
  try {
    // get the setup code
    let setup = fs.readFileSync(path.join(__dirname, '../setup.js'), 'utf-8');
    setup = setup.replace('../src/core.js', '../../src/core.js');

    // copy test suite and change path
    let test = fs.readFileSync(path.join(__dirname, `../unit/${option}.spec.js`), 'utf-8');

    // since loading the setup code causes the core file to be loaded
    // twice (and destroying context references) we'll need to inject
    // the setup code into each test suite manually
    let matches = test.match(/(import.*?from.*?[\n\r])/g);
    let lastImport = matches[matches.length - 1];
    test = test.replace(lastImport, `${lastImport}${setup}`);

    fs.writeFileSync(path.join(__dirname, `${option}.spec.js`), test, 'utf-8');

    // rollup test file
    let bundle = await rollup.rollup({
      input: path.join(__dirname, `${option}.spec.js`)
    });
    let { output } = await bundle.generate({
      file: path.join(__dirname, `${option}.spec.js`),
      format: 'iife'
    });

    // copy karma.conf and change path
    let karma = fs.readFileSync(path.join(__dirname, `./karma.conf.template.js`), 'utf-8');
    karma = karma.replace(/__option__/g, option);
    fs.writeFileSync(path.join(__dirname, 'karma.conf.js'), karma, 'utf-8');

    // generate each option and run tests
    let numPermutations = 2 ** options[option].length;
    for (let i = 0; i < numPermutations; i++) {
      let context = {};

      options[option].forEach((optionName, index) => {
        context[optionName] = !!((2 ** index) & i);
      });

      // replace context in test suite
      let testContents = output[0].code.replace(
        /\/\/ test-context([\s\S])*\/\/ test-context:end/,
        `let testContext = ${JSON.stringify(context)};`
      );

      // console.log('testContents:', testContents);

      let contents = pp.preprocess(testContents, context, { type: 'js' });
      fs.writeFileSync(path.join(__dirname, `${option}.spec.js`), contents, 'utf-8');

      execSync('npx karma start ' + path.join(__dirname, 'karma.conf.js'), {
        stdio: 'inherit'
      });
    }
  } catch (e) {
    // for some reason a failing test/exec does not error the program
    console.log(e);
    return process.exit(1);
  }
});
