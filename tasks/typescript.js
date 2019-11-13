const gulp = require('gulp');
const livingcss = require('gulp-livingcss');
const rename = require('gulp-rename');
const path = require('path');

const optionalRegex = /^\[.*\]$/;
const baseTypesRegex = /\b(String|Boolean|Number|Object)\b/g;

function addSection() {
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
}

function parseType(type) {
  type = type.split('|').map(t => {
    t = t.replace(baseTypesRegex, (match, p1) => p1.toLowerCase());
    if (t === 'function') {
      t = 'Function'
    }
    if (type === '*') {
      t = 'any';
    }
    if (type === 'Promise') {
      t = 'Promise<any>'
    }
    return t;
  }).join(' | ');

  return type;
}

const tags = {
  param: function() {
    let { name, type } = this.tag;
    let entity = {};
    let optional = false;

    if (optionalRegex.test(name)) {
      optional = true;
      name = name.substring(1, name.length - 1);
    }

    if (name.indexOf('=') !== -1) {
      let parts = name.split('=');
      name = parts[0];
    }

    let parentName = '';
    if (name.split('.').length > 2) {
      return;
    }

    if (name.includes('.')) {
      parentName = name.split('.')[0];
      name = name.split('.')[1];
    }

    type = parseType(type);
    if (type.startsWith('...')) {
      type = type.substr(3);
      name = '...' + name;
    }

    if (type === '*') {
      type = 'any';
    }

    if (name.includes('<')) {
      return;
    }

    entity.name = name;
    entity.type = type;
    entity.optional = optional;

    this.block.param = this.block.param || [];

    if (parentName) {
      let parentEntity = this.block.param.find(param => param.name === parentName);
      parentEntity.children = parentEntity.children || [];

      // turn nested rest parameter into [name: string]: any
      // @see https://stackoverflow.com/questions/50288205/destructuring-a-function-parameter-object-and-rest
      if (name.startsWith('...')) {
        entity.name = `[${name.substr(3)}: string]`;
      }

      parentEntity.children.push(entity);
    }
    else {
      this.block.param.push(entity);
    }
  },

  memberof: function() {
    this.block.memberof = this.tag.description;
    let parent = this.sections.find(section => section.class === this.tag.description);
    if (!parent) {
      return;
    }

    parent.children = parent.children || [];
    parent.children.push(this.block);
  },

  returns: function() {
    this.block.returns = parseType(this.tag.type);
  },

  // automatically make @class, @function, @property, and @sectionName add their own
  // @section and @page tags for ease of use
  class: function() {
    this.block.class = this.tag.description;
    addSection.call(this);
  },
  function: function() {
    this.block.function = this.tag.description;
    this.block.returns = 'void';
    addSection.call(this);
  },
  property: function() {
    let type = parseType(this.tag.type);

    this.block.property = {
      name: this.tag.description,
      type: type
    };
    addSection.call(this);
  },
  sectionName: function() {
    this.comment.tags.push({
      tag: 'section',
      description: this.tag.description,
      type: '',
      name: '',
      source: `@section ${this.tag.description}`
    });
  }
}

function normalizeParams(param) {
  let children = '';
  if (param.children) {
    children = param.children
      .map(child => `${child.name}${child.optional ? '?' : ''}: ${child.type}`)
      .join(', ');
  }

  let str = `${param.name}${param.optional ? '?' : ''}: ${param.type}`;

  if (children) {
    str = `${param.name}${param.optional ? '?' : ''}: {${children}}`;
  }

  return str;
}

function mergeParam(obj1, obj2) {
  obj2.param.forEach(param => {
    let rootParam = obj1.param.find(p => p.name === param.name);
    if (rootParam && rootParam.children && param.children) {
      rootParam.children = rootParam.children
        .concat(param.children)
        // unique set
        .filter((p, index, array) => {
          let item = array.find(pa => pa.name === p.name);
          return array.indexOf(item) === index;
        });
    }
  });
}

function livingcssPreprocess(context, template, Handlebars) {
  context.allSections.forEach(section => {
    // add any prop to GameObject
    if (section.name === 'GameObject') {
      section.children.push({
        memberof: 'GameObject',
        property: {
          name: '[prop: string]',
          type: 'any'
        }
      });
    }

    // merge parent function parameters onto child
    if (section.extends) {
      let parentSection = context.allSections.find(parent => parent.name === section.extends);
      mergeParam(section, parentSection);
    }

    if (section.param) {
      section.params = section.param
        .map(normalizeParams)
        .join(', ');
    }
    if (section.children) {
      section.children = section.children
        .map(child => {
          if (child.param) {
            child.params = child.param
              .map(normalizeParams)
              .join(', ');
          }

          return child;
        });
    }
  });

  // console.log(JSON.stringify(context,null,2));
}

function buildDeclarationFile() {
  return gulp.src('./kontra.js')
    .pipe(livingcss('./', {
      loadcss: false,
      template: './tasks/ts-template.hbs',
      tags: {...tags},
      preprocess: livingcssPreprocess
    }))
    .pipe(rename('kontra.d.ts'))
    .pipe(gulp.dest('./'))
}

gulp.task('build:ts', gulp.series(buildDeclarationFile));