# clues-compiler

[Optimizing compiler](https://en.wikipedia.org/wiki/Optimizing_compiler) for clues modules

Applies various clues optimizations to functions

- Pre-processes function arguments for faster execution time
- Check for `$private` and `$prep`


How to use:
```js
// just add this to the top of your index module
require('clues-compiler')();
```

```js
node -r clues-compiler index.js
```

Once loaded, subsequent `require`s that are a child of a determined directory
will be optimized.  Defaults to the directory of the parent module, otherwise
uses the current directory.

A specific directory can be optimized:
```js
require('clues-compiler')({dirname:path.join(__dirname,'clues-stuff')});
```

To restrict modules or directories from being processed, provide an array of pathnames
```js
require('clues-compiler')({ restrict: [
  path.join(__dirname,'node_modules'),
  path.join(__dirname,'graphql')
]});
```

What it does:
```js
// takes this
class Foo {
  bar(a) {
    const ff = Math.sqrt(100) + Math.random();
    return (b,c) => a+b+c+ff;
  }
  a() { return 5; }
  b() { return 6; }
}

// and turns it into this
function WRAPFN(args, private, prep, fn) {
  fn.__args__ = args;
  if (private) { fn.private = true; }
  if (prep) { fn.prep = true; }
  return fn;
}
const ARGS_1 = ['b','c'];
class Foo {
  bar(a) {
    const ff = Math.sqrt(100) + Math.random();
    return WRAPFN(ARGS_1, false, false, (b,c) => a+b+c+ff);
  }
  a() { return 5; }
  b() { return 6; }
}
```
