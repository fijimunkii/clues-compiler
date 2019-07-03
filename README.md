# clues-compiler

Optimizing compiler for clues modules

Pre-processes function arguments for faster execution time

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
		var ff = Math.sqrt(100)  + Math.random();
		return (b,c) => a+b+c+ff;
  }
  a() { return 5; }
  b() { return 6; }
}

// and turns it into this
function WRAPFN(args, fn) {
  fn.__args__ = args;
  return fn;
}
const ARGS_1 = ['b','c'];
class Foo {
  bar(a) {
		var ff = Math.sqrt(100)  + Math.random();
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
