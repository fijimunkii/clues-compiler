// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
// type schema: https://babeljs.io/docs/en/babel-types
const shimRequire = require('shim-require');
const t = require('@babel/types');
const { parse } = require('@babel/parser');
const traverse = require('babel-traverse').default; // @babel/traverse had some funky errors
const generate = require('babel-generator').default;
const path = require('path');
const inPath = (parentPathname, pathname) => {
  const relative = path.relative(parentPathname, pathname);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};
// various clues optimizations
// pre-process args
// check for private and prep
const WRAPFN = `function WRAPFN(args, private, prep, fn) {
  fn.__args__ = args;
  if (private) { fn.private = true; }
  if (prep) { fn.prep = true; }
  return fn;
}`;

const wrapFn = (path, wrapRef) => {
  // store reference to prepended WRAPFN
  if (!wrapRef.path) {
    wrapRef.path = path;
    return;
  }
  // do not wrap class methods
  if (path.type === 'ClassMethod') {
    return;
  }
  // check if already wrapped
  if (path.node.wrapped) {
    return;
  }
  path.node.wrapped = true;

  // inject ARGS variable
  wrapRef.index++;
  const argNames = path.node.params.map(d => d.name);
  const args = t.variableDeclaration(
    'const', [
      t.variableDeclarator(
        t.identifier(`ARGS_${wrapRef.index}`),
        t.arrayExpression(argNames.map(d => t.stringLiteral(d)))
      )
    ]
  );
  wrapRef.path.insertAfter(args);

  // replace with WRAPFN call
  const argsId = args.declarations[0].id;
  const isPrivate = t.booleanLiteral(argNames.includes('$private'));
  const isPrep = t.booleanLiteral(argNames.includes('$prep'));
  path.replaceWith(
    t.callExpression(wrapRef.path.node.id, [argsId, isPrivate, isPrep, path.node])
  );
  path.node.async = false;
  path.node.generator = false;
};

const process = (d,filename) => {
  d = `${WRAPFN}${d}`;
  const ast = parse(d, { sourceType: 'unambiguous' });
  const wrapRef = { index: 0 };
  traverse(ast, {
    Function: {
      enter: path => wrapFn(path, wrapRef)
    }
  });
  const { code } = generate(ast, {
    retainFunctionParens: true
  }, d);
  //console.log(`${filename}\n${code}`);
  return code;
};

module.exports = dirname => shimRequire((content,filename) => {
  // default to restricting from directory of parent module
  // otherwise use the current directory
  // optionally pass in a directory
  const pathToRestrict = dirname || (module.parent && module.parent.filename) || __dirname;
  if (inPath(path.dirname(pathToRestrict), filename)) {
    content = process(content, filename);
  }
  return content;
});
