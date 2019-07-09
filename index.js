// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
// type schema: https://babeljs.io/docs/en/babel-types
const shimRequire = require('shim-require');
const t = require('@babel/types');
const { parse } = require('@babel/parser');
const traverse = require('babel-traverse').default; // @babel/traverse had some funky errors
const generate = require('babel-generator').default;
const WRAPFN = `function WRAPFN(args, fn) { fn.__args__ = args; return fn; }`;

const wrapFn = (path, wrapRef) => {
  // do not wrap class methods
  if (path.type === 'ClassMethod') {
    return;
  }
  // prepended WRAPFN is the first function to get processed
  if (!wrapRef.path) {
    wrapRef.path = path;
    wrapRef.callId = path.node.id;
    return;
  }
  if (path.node.wrapped) {
    return;
  }
  wrapRef.index++;
  const args = t.variableDeclaration(
    'const', [
      t.variableDeclarator(
        t.identifier(`ARGS_${wrapRef.index}`),
        t.arrayExpression(path.node.params.map(d => t.stringLiteral(d.name)))
      )
    ]
  );
  wrapRef.path.insertAfter(args);
  const argsId = args.declarations[0].id;
  path.node.wrapped = true;
  path.replaceWith(
    t.callExpression(wrapRef.callId, [argsId, path.node])
  );
  // Regardless of whether or not the wrapped function is a an async method
  // or generator the outer function should not be
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

shimRequire((content,filename) => process(content,filename));
