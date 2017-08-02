// (function() {
  var cache = {};
  var totalSize = 0;

  // get date in yyy-mm-dd format
  // @see https://stackoverflow.com/a/41672057/2124254
  var todaysDate = (new Date()).toLocaleString('en-GB').slice(0,10).split('\/').reverse().join('-');

  var compression;
  var version;
  var rawGitUrl = 'https://raw.githubusercontent.com/straker/kontra/master/';

  var fileInputEls = Array.prototype.slice.call(document.querySelectorAll('#files input'));
  var compressionEls = Array.prototype.slice.call(document.querySelectorAll('#compression input'));
  var codeEl = document.getElementById('code');
  var totalSizeEl = document.getElementById('total-filesize');
  var downloadEl = document.getElementById('download');

  // check files from url
  var query = window.location.search.split('&').reduce(function(obj, string) {
    string = string.replace('?', '');
    var parts = string.split('=');

    obj[parts[0]] = parts[1];

    return obj;
  }, {});

  if (query.files) {
    query.files.split('+').forEach(function(file) {
      var input = document.querySelector('input[value="' + file + '"]');

      if (input) {
        input.checked = true;
      }
    });
  }

  // get initial compression level
  compressionEls.forEach(function(el) {
    if (el.checked) {
      compression = el.value;
    }
  });

  // get package.json for version
  getFileContents('package.json', 'package.json')
    .then(function(file) {
      version = JSON.parse(file.data).version;
    });

  // get all file sizes
  fetch('https://api.github.com/repos/straker/kontra/git/trees/master?recursive=1')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      data.tree.forEach(function(file) {

        // grab all src files
        if (file.path.indexOf('src/') === 0) {
          var path = file.path.substring(4, file.path.length - 3);

          if (!cache[path]) {
            cache[path] = {};
          }

          cache[path].dev = file;
          cache[path].dev.kb = getKB(file.size);
        }
        else if (file.path.indexOf('dist/') === 0) {
          var path = file.path.substring(5, file.path.length - 3);

          if (!cache[path]) {
            cache[path] = {};
          }

          cache[path].min = file;
          cache[path].min.kb = getKB(file.size);
        }
      });

      updateFileSizes();
      getCode();
    })
    .catch(function(err) {
      console.error(err);
    });

  document.querySelector('form').addEventListener('change', function(e) {
    compressionEls.forEach(function(el) {
      if (el.checked) {
        compression = el.value;
      }
    });

    updateFileSizes();
    getCode();
  });

  /**
   * Update the file size for all files.
   */
  function updateFileSizes() {
    totalSize = 0;

    fileInputEls.forEach(function(input) {
      var file = input.value;

      if (cache[file]) {
        input.nextElementSibling.textContent = cache[file][compression].kb;

        if (input.checked) {
          totalSize += cache[file][compression].size;
        }
      }
    });

    totalSizeEl.textContent = getKB(totalSize);
  }

  /**
   * Get the contents of a file.
   * @param {string} file - name of the file in the cache.
   * @param {string} path - path to file.
   */
  function getFileContents(file, path) {
    return fetch(rawGitUrl + path).then(function(response) {
      return response.text();
    })
    .then(function(data) {
      return {
        data: data,
        file: file
      };
    });
  }

  /**
   * Return the size in KB.
   */
  function getKB(size) {
    return Math.round(100 * size / 1024)/100 + ' kB';
  }

  /**
   * Get code output based on the selections.
   */
  function getCode() {

    // save the current state of the compression so changing it while files are
    // being fetched doesn't corrupt which file contents belong to which compression
    // level
    (function(compression) {
      var promises = [];

      fileInputEls.forEach(function(input) {
        if (input.checked) {
          var file = input.value;

          if (cache[file]) {

            if (!cache[file][compression].contents) {
              promises.push( getFileContents(file, cache[file][compression].path) );
            }
            else {
              promises.push(Promise.resolve({file: file, data: cache[file][compression].contents}));
            }
          }
        }
      });

      Promise.all(promises).then(function(files) {
        var code = '';
        var filesList = [];

        for (var i = 0; i < files.length; i++) {
          var data = files[i].data;
          var file = files[i].file;

          // core is assumed
          if (file !== 'core') {
            filesList.push(file);
          }

          if (!cache[file][compression].contents) {
            cache[file][compression].contents = data;
          }

          // remove var reference from each kontra
          if (i > 0 && compression === 'min') {
            data = data.replace('var kontra', 'kontra');
          }

          code += (i > 0 && compression === 'dev' ? '\n\n' : '\n') + data;
        }

        // remove eslint comment from core.js
        code = code.replace('/* global console */\n\n', '');

        code = '/*\n' +
               ' * Kontra.js v' + version + ' (Custom Build on ' + todaysDate + ') | MIT\n' +
               ' * Build: ' + window.location.origin + window.location.pathname + (filesList.length ? '?files=' + filesList.join('+') : '') + '\n' +
               ' */' + code;

        codeEl.textContent = code;
        // Prism.highlightElement(codeEl);  // really slow

        downloadEl.href = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(code);
      });

    })(compression);
  }
// })();