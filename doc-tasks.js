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

// hack to add @section and @page to every jsdoc without explicitly having
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

    return `<a href="${url}">${p1}</a>`
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
    description = `${type}. ${parseType(description)}${entry.default ? ` Defaults to \`${entry.default}\`.` : ''}`;

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
  example: function() {
    let width = 600;
    let height = 200;

    if (this.tag.type) {
      let parts = this.tag.type.split('x');
      width = parts[0];
      height = parts[1];
    }

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
  packageVersion: function() {
    this.block.description = this.block.description.replace(packageVersionRegex, packageJson.version);
  }
};

function livingcssPreprocess(context, template, Handlebars) {
  if (context.navbar) {
    // remove the .html
    context.navbar.forEach(navItem => navItem.url = navItem.url.replace('.html', ''));

    context.navbar.sort(sortByName);
    navbar = context.navbar;
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