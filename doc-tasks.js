const gulp = require('gulp');
const livingcss = require('gulp-livingcss');
const path = require('path');
const marked = require('marked');
const packageJson = require('./package.json');

const optionalRegex = /^\[.*\]$/;
const kontraTypeRegex = /kontra\.(\w+)/g;
const packageVersionRegex = /{{\s?packageVersion\s?}}/g;
const excludeCodeRegex = /\s*\/\/ exclude-code:start[\s\S]*?\/\/ exclude-code:end/g;
const excludeScriptRegex = /\s*\/\/ exclude-script:start[\r\n]([\s\S]*?[\r\n])\/\/ exclude-script:end[\r\n]/g;
let uuid = 0;
let navbar;

/**
 * Sort sections by name
 * @param {Object} a
 * @param {Object} b
 */
function sortByName(a, b) {
  return a.name < b.name
    ? -1
    : a.name > b.name
      ? 1
      : 0;
}

// hack to add @section and @page to every jsdoc section without explicitly having
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

  // don't add multiple section tags
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

  // don't add multiple page tags
  let page = this.comment.tags.find(tag => tag.tag === 'page');
  if (!page) {
    this.comment.tags.push({
      tag: 'page',
      description: description[0].toUpperCase() + description.substring(1),
      type: '',
      name: '',
      source: `@page ${description}`
    });
  }

  this.comment.description = parseType(this.comment.description);
}

/**
 * Parse information about the type.
 * @param {String} type
 */
function parseType(type) {
  // parse or types
  if (type.includes('|')) {
    type = type.split('|').join(' or ');
  }

  // parse array types
  let isArray = false;
  if (type.includes('[]')) {
    isArray = true;
    type = type.replace(/(\w+)\[\]/, function(match, p1, index) {
      return `${index === 0 ? 'A' : 'a'}n Array of ${p1}s`;
    });
  }

  // parse kontra object types and turn them into links
  type = type.replace(kontraTypeRegex, function(match, p1) {
    let url = p1;
    if (isArray) {
      url = url.substring(0, url.length - 1);
    }

    return `<a href="${url}">${p1}</a>`
  });

  // parse any types
  if (type === '*') {
    type = 'Any type';
  }

  return type;
}

let tags = {

  // output information about the function parameter
  param: function() {
    let { name, description, type } = this.tag;
    let paramValue = '';
    let entry = {};

    // used to display the list of parameters in the function title
    // (e.g. myFunc(a, b[, c]) )
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
    description = `${type}. ${parseType(description)}${entry.default ? ` Defaults to \`${entry.default}\`.` : ''}`;

    entry.name = name;
    entry.description = marked(description);
    entry.type = type;

    this.block.param = this.block.param || [];
    this.block.param.push(entry);

    // don't list nested params (e.g. properties.foo.bar)
    if (name.indexOf('.') === -1) {
      this.block.paramList += paramValue;
    }
  },

  // output information about the function return value
  returns: function() {
    let type = parseType(this.tag.type);
    let description = parseType(this.tag.description);

    this.block.returns = {
      name: '',
      description: marked(description),
      type: type
    };
  },

  // create a canvas element and code block that shows code and it actually working
  // as written.
  example: function() {
    let width = 600;
    let height = 200;

    if (this.tag.type) {
      let parts = this.tag.type.split('x');
      width = parts[0];
      height = parts[1];
    }

    /**
     * The @example tags creates the canvas and context objects, and makes them available in the code block and script. Typically the context is used to make sure kontra draws to the right canvas if there are multiple canvases on the page.
     *
     * Since the kontra.js file is loaded as a global, examples can't import it, but the code should show it being imported. To handle this, there are two special comments that will be filtered out in either the code block or the script.
     *
     * To exclude code from the code block, use the comments `// exclude-code:start` and `// exclude-code:end`. All lines between the two comments will not be displayed in the code block but will be run in the script. Typically setup code and setting the correct context will be put in the exclude comments.
     *
     * To exclude code form the script, use the comments `// exclude-script:start` and `// exclude-script:end`. All lines between the two comments will not be run in the script but will be show in the code block. Typically the ES import syntax is excluded will be put in the exclude comments so the script doesn't try to import from the global kontra object.
     */
    let id = `game-canvas-${uuid++}`;
    this.block.example = {
      id: id,
      scriptOutput: `(function() {
  kontra.init("${id}");
  var canvas = document.querySelector("#${id}");
  canvas.width = ${width};
  canvas.height = ${height};
  var context = canvas.getContext("2d");
  ${this.tag.description.replace(excludeScriptRegex, '')}
})();`,
      codeOutput: this.tag.description.trim()
        .replace(excludeCodeRegex, '')
        .replace(excludeScriptRegex, '$1')
    };
  },

  // automatically make @class, @function, @property, and @sectionName add their own
  // @section and @page tags for ease of use
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
  },

  // put the package version anywhere there is `{{ packageVersion }}` in the description.
  // primarily used for the download page
  packageVersion: function() {
    this.block.description = this.block.description.replace(packageVersionRegex, packageJson.version);
  }
};

function livingcssPreprocess(context, template, Handlebars) {
  if (context.navbar) {
    // remove the .html from the nav item urls
    context.navbar.forEach(navItem => navItem.url = navItem.url.replace('.html', ''));

    context.navbar.sort(sortByName);
    navbar = context.navbar;
  }

  // create 4 different sections that can be used to organize the page
  context.otherSections = [];
  context.methods = [];
  context.properties = [];
  context.methodsAndProperties = [];

  context.sections.forEach((section, index) => {

    // sort by methods and properties
    if (section.function) {
      context.methods.push(section);
      context.methodsAndProperties.push(section);
    }
    else if (section.property) {
      context.properties.push(section);
      context.methodsAndProperties.push(section);
    }
    // the first section is always the description of the API
    else if (index > 0) {
      context.otherSections.push(section);
      section.link = section.name.toLowerCase().replace(' ', '-');
    }

    context.methods.sort(sortByName);
    context.properties.sort(sortByName);
    context.methodsAndProperties.sort(sortByName);
  });

  // load all handlebar partials
  return livingcss.utils.readFileGlobs('docs/template/partials/*.hbs', function(data, file) {

    // make the name of the partial the name of the file
    var partialName = path.basename(file, path.extname(file));
    Handlebars.registerPartial(partialName, data);
  });
}

function buildPages() {
  navbar.forEach(navItem => {
    navItem.selected = false;
  });

  return gulp.src('./docs/pages/*.js')
    .pipe(livingcss('docs', {
      loadcss: false,
      template: 'docs/template/template.hbs',
      tags: {...tags},
      preprocess: function(context, template, Handlebars) {
        context.navbar = navbar;
        context.otherSections = context.sections.slice(1);
        context['nav-'+context.id] = true;

        // load all handlebar partials
        return livingcss.utils.readFileGlobs('docs/template/partials/*.hbs', function(data, file) {

          // make the name of the partial the name of the file
          var partialName = path.basename(file, path.extname(file));
          Handlebars.registerPartial(partialName, data);
        });
      }
    }))
    .pipe(gulp.dest('docs'))
}

function buildApi() {
  return gulp.src('./src/*.js')
    .pipe(livingcss('docs/api', {
      loadcss: false,
      template: 'docs/template/template.hbs',
      tags: {...tags},
      preprocess: livingcssPreprocess
    }))
    .pipe(gulp.dest('docs/api'))
}

gulp.task('build:docs', gulp.series(buildApi, buildPages));

gulp.task('watch:docs', function() {
  gulp.watch(['./src/*.js','./docs/pages/*.js','./docs/template/**/*.hbs'], gulp.series('build:docs'));
});