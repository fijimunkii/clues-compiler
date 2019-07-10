# clues-compiler

[Optimizing compiler](https://en.wikipedia.org/wiki/Optimizing_compiler) for clues modules

Applies various clues optimizations to functions

- Pre-processes function arguments for faster execution time
- Check for `$private` and `$prep`

Once loaded into your project, all subsequent `require`s will be optimized

How to use:
```js
// just add this to the top of your index module
require('clues-compiler');
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
    return WRAPFN(ARGS_1, (b,c) => {
      return a + b + c + ff;
    });
  }
  a() { return 5; }
  b() { return 6; }
}
```

Related:
https://nodejs.org/api/modules.html#modules_the_module_object_1
https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js
