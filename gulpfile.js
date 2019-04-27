const gulp = require('gulp');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const preprocess = require('gulp-preprocess');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const livingcss = require('gulp-livingcss');
const path = require('path');
const marked = require('marked');

// const gap = require('gulp-append-prepend');
// const replace = require('gulp-replace');
// const concat = require('gulp-concat');
// const path = require('path');

// Enables/Disables visual debugging in Kontra
const VISUAL_DEBUG = false;

// Enables/Disables DEBUG mode in Kontra
const DEBUG = false;

function sortByName(a, b) {
  return a.name < b.name
    ? -1
    : a.name > b.name
      ? 1
      : 0;
}

const optionalRegex = /^\[.*\]$/;
const kontraTypeRegex = /kontra\.(\w+)/g;

// fun hack to add @section and @page to every jsdoc without explicitly having
// to add them to every block :)
function addSectionAndPage() {
  let description = path.basename(this.file, '.js');
  let property = this.block.property;
  let fn = this.block.function;
  let clas = this.block.class;

  let sectionName = property
    ? property.name
    : fn
      ? fn
      : clas
        ? clas
        : description;

  let section = this.comment.tags.find(tag => tag.tag === 'section');
  if (!section) {
    this.comment.tags.push({
      tag: 'section',
      description: sectionName,
      type: '',
      name: '',
      source: `@section ${sectionName}`
    });
  }

  let page = this.comment.tags.find(tag => tag.tag === 'page');
  if (!page) {
    this.comment.tags.push({
      tag: 'page',
      description: description[0].toUpperCase() + description.substring(1),
      type: '',
      name: '',
      source: `@section ${description}`
    });
  }

  this.comment.description = parseType(this.comment.description);
}

function parseType(type) {
  let isArray = false;
  if (type.includes('|')) {
    type = type.split('|').join(' or ');
  }

  if (type.includes('[]')) {
    isArray = true;
    type = type.replace(/(\w+)\[\]/, function(match, p1, index) {
      return `${index === 0 ? 'A' : 'a'}n Array of ${p1}s`;
    });
  }

  type = type.replace(kontraTypeRegex, function(match, p1) {
    let url = p1;
    if (isArray) {
      url = url.substring(0, url.length - 1);
    }

    return `<a href="${url}.html">${p1}</a>`
  });

  if (type === '*') {
    type = 'Any type';
  }

  return type;
}

let tags = {
  param: function() {
    let { name, description, type } = this.tag;
    let paramValue = '';
    let entry = {};

    this.block.paramList = this.block.paramList || '';

    // optional param
    if (optionalRegex.test(name)) {
       name = name.substring(1, name.length - 1);
       entry.optional = true;
    }

    // default param
    if (name.indexOf('=') !== -1) {
      let parts = name.split('=');
      name = parts[0];
      entry.default = parts[1];
    }

    // build paramList
    if (entry.optional) {
      paramValue += '['
    }
    if (this.block.paramList.length > 1) {
      paramValue += ', ';
    }
    paramValue += name;
    if (entry.optional) {
      paramValue += ']';
    }

    type = parseType(type);
    description = `${type}. ${description}${entry.default ? ` Defaults to \`${entry.default}\`.` : ''}`;

    entry.name = name;
    entry.description = marked(description);
    entry.type = type;

    this.block.param = this.block.param || [];
    this.block.param.push(entry);

    // don't list nested params
    if (name.indexOf('.') === -1) {
      this.block.paramList += paramValue;
    }
  },
  returns: function() {
    let type = parseType(this.tag.type);
    let description = parseType(this.tag.description);

    this.block.returns = {
      name: '',
      description: marked(description),
      type: type
    };
  },

  class: function() {
    this.block.class = this.tag.description;
    addSectionAndPage.call(this);
  },
  function: function() {
    this.block.function = this.tag.description;
    addSectionAndPage.call(this);
  },
  property: function() {
    let type = parseType(this.tag.type);

    this.block.property = {
      name: this.tag.description,
      description: marked(this.tag.description),
      type: type
    };
    addSectionAndPage.call(this);
  },
  sectionName: function() {
    this.comment.tags.push({
      tag: 'section',
      description: this.tag.description,
      type: '',
      name: '',
      source: `@section ${this.tag.description}`
    });

    addSectionAndPage.call(this);
  }
};

function livingcssPreprocess(context, template, Handlebars) {
  if (context.navbar) {
    context.navbar.sort(sortByName);
  }

  context.otherSections = [];
  context.methods = [];
  context.properties = [];
  context.methodsAndProperties = [];
  context.sections.forEach((section, index) => {

    if (section.returns && section.returns.type.startsWith('kontra')) {
      let type = section.returns.type.split('.')[1];
      section.returns.type = `<a href="${type}.html">${type}</a>`;
    }

    // sort by methods and properties
    if (section.function) {
      context.methods.push(section);
      context.methodsAndProperties.push(section);
    }
    else if (section.property) {
      context.properties.push(section);
      context.methodsAndProperties.push(section);

      type = section.property.type;
      if (section.property.type.startsWith('kontra')) {
        type = section.property.type.split('.')[1];
        section.property.type = `<a href="${type}.html">${type}</a>`;
      }

      let desc = section.description;
      let index = desc.indexOf('>');
      section.description = desc.substring(0, index+1) + type + '. ' + desc.substring(index+1);
    }
    // the first section is always the description of the api
    else if (index > 0) {
      context.otherSections.push(section);
      section.link = section.name.toLowerCase().replace(' ', '-');
    }

    context.methods.sort(sortByName);
    context.properties.sort(sortByName);
    context.methodsAndProperties.sort(sortByName);
  });

  Handlebars.registerHelper('json', function(context) {
      return '<pre><code>'+JSON.stringify(context,null,2)+'</code></pre>';
  });

  // console.log(JSON.stringify(context,null,2));

  return livingcss.utils.readFileGlobs('docs/template/partials/*.hbs', function(data, file) {

    // make the name of the partial the name of the file
    var partialName = path.basename(file, path.extname(file));
    Handlebars.registerPartial(partialName, data);
  });
}

gulp.task('build', function() {
  return rollup({
    input: './src/kontra.defaults.js',
    format: 'iife',
    name: 'kontra'
  })
  .pipe(source('kontra.js'))
  .pipe(gulp.dest('.'))
});

// gulp.task('build:src', function() {
//   const externalId = path.resolve( __dirname, 'src/core.js' );

//   // first concat sprite and vector, and animation and spritesheet together
//   return rollup({
//     input: './src/sprite.js',
//     format: 'iife',
//     name: 'kontra.sprite',
//     external: [externalId],
//     globals: {
//       [externalId]: 'kontra'
//     }
//   })
//   .pipe(source('sprite.js'))
//   .pipe(gulp.dest('./build'))
// });

gulp.task('dist', function() {
  return gulp.src('kontra.js')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./docs/js'))
    .pipe(rename('kontra.min.js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'))
});

gulp.task('build:docs', function() {
  return gulp.src('./src/*.js')
    .pipe(livingcss('doc_test/api', {
      loadcss: false,
      template: 'docs/template/template.hbs',
      tags: {...tags},
      preprocess: livingcssPreprocess
    }))
    .pipe(gulp.dest('doc_test/api'))
});

// gulp.task('dist:src', function() {
//   return gulp.src(['src/*.js', '!src/index.js'])
//     .pipe(changed('./dist'))
//     .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
//     .pipe(replace('export default', function() {
//       return `kontra.${this.file.stem} = `;
//     }))
//     .pipe(gap.prependText('(function() {\n'))
//     .pipe(gap.appendText('})();'))
//     .pipe(plumber())
//     .pipe(terser())
//     .pipe(plumber.stop())
//     .pipe(size({
//       showFiles: true
//     }))
//     .pipe(size({
//       showFiles: true,
//       gzip: true
//     }))
//     .pipe(gulp.dest('./dist'));
// });

gulp.task('watch', function() {
  gulp.watch('src/*.js', gulp.series('build', 'dist'));
});

gulp.task('watch:docs', function() {
  gulp.watch(['src/*.js','docs/template/**/*.hbs'], gulp.series('build:docs'));
});

gulp.task('default', gulp.series('build', 'watch'));
