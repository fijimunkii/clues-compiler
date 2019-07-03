var Module = require('module');
var fs = require('fs');
var path = require('path');

/**
 * Whenever a .js file is run via require(), calls callback with the contents
 * of the required file, the name of the required file, and the module object
 * for the required module. callback should return the processed contents of
 * the file, which will be executed instead of the original contents.
 * @param {function(string, string, !Module):string} callback
 */
function shimRequire(callback) {
  // adapted from https://github.com/joyent/node/blob/master/lib/module.js
  Module._extensions['.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    content = stripBOM(content);
    content = stripShebang(content);

    module._compile(callback(content, filename, module), filename);
  };

  // taken from https://github.com/joyent/node/blob/master/lib/module.js
  function stripBOM(content) {
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM) because
    // the buffer-to-string conversion in `fs.readFileSync()` translates it to
    // FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  function stripShebang(content) {
    if (/^#!/.test(content)) {
      return content.replace(/[^\r\n]+(\r|\n)/, '$1');
    }
    return content;
  }
}

// apply clues pre-processing
var reArgs = /^\s*function.*?\(([^)]*?)\).*/;
var reEs6 =  /^\s*\({0,1}([^)]*?)\){0,1}\s*=>/;
var reEs6Class = /^\s*[a-zA-Z0-9\-$_]+\s*\((.*?)\)\s*{/;
const WRAPFN = `function WRAPFN(args, fn) {
  fn.__args__ = args;
  return fn;
}`;

function optimize(d) {
  return d;
  // walk through function and optimize
  let len = d.length;
  let wrapIndex = 0;

  // regular functions
  for (let index = 0, match = reArgs.exec(d.substring(index, len); match; index=d.indexOf(match[0]))) {
    wrapNum++;
    const argsFn = `const ARGS_${wrapNum} = [${match1.split(/\,(?:\s)?/).map(d => '"'+d+'"')}]`;
    const optimized = `WRAPFN(ARGS_${wrapNum}, (${match[1]}) => { return ${the rest of the function}; }`;
    d = `${argsFn}${d}`;
    // TODO: replace whole function
    d = `${d.substring(0, index)}${optimized}${d.substring(index, len)}`;
    len = d.length;
  }

  // es6 () =>
  for (let index = 0, match = reEs6.exec(d.substring(index, len); match; index=d.indexOf(match[0]))) {
  }

  // es6 class
  for (let index = 0, match = reEs6Class.exec(d.substring(index, len); match; index=d.indexOf(match[0]))) {
  }

  // prepend wrapfn
  if (wrapIndex) {
    d = `${WRAPFN}${d}`;
  }

  return d;
}

shimRequire(function(content, filename, module) {
  const optimized = optimize(content);
  return optimized;
//  return `console.log("loading ${filename}");\n${optimized}`;
});
