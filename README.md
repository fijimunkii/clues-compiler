# clues-compiler

[Optimizing compiler](https://en.wikipedia.org/wiki/Optimizing_compiler) for clues modules

Applies various clues optimizations to functions

- Pre-processes function arguments for faster execution time
- Check for `$private` and `$prep`

Once loaded, subsequent `require`s that are in a subdirecty will be optimized.
Defaults to restricting from the directory of the parent module, otherwise
uses the current directory. Optionally pass in a directory to restrict

How to use:
```js
// just add this to the top of your index module
require('clues-compiler')();
```

To process all node_modules, pass in with `node -r`
```js
node -r clues-compiler index.js
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
