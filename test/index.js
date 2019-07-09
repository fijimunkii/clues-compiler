const promisify = require('util').promisify
const writeFile = promisify(require('fs').writeFile);
const path = require('path');
const mkpkg = async (pkgname, content) => {
  const filepath = path.join(__dirname, 'testpackages', pkgname);
  await writeFile(filepath, content);
  return filepath;
};

module.exports = t => {

  // load clues compiler
  require('../index');

  t.test('regular function', { autoend: true }, t => {

    t.test('top level', async t => {
      const pkg = await mkpkg('regular-fn-top-level.js', `
        module.exports = {
          a: function(b,c) {
            return b+c;
          },
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
    });
    t.test('nested', async t => {
      const pkg = await mkpkg('regular-fn-nested.js', `
        module.exports = {
          a: function(b,c) {
            const ff = Math.sqrt(100) + Math.random();
            return function(b,c) { return a+b+c+ff; }
          },
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
      t.same(d.a().__args__, ['b','c']);
    });
    t.test('named', async t => {
      const pkg = await mkpkg('regular-fn-named.js', `
        module.exports = {
          a: function named(b,c) {
            return b+c;
          },
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
    });
    t.test('no-name', async t => {
      const pkg = await mkpkg('regular-fn-no-name.js', `
        module.exports = {
          a: function(b,c) {
            return b+c;
          },
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
    });
  });

  t.test('arrow function', { autoend: true }, t => {
    t.test('top level', async t => {
      const pkg = await mkpkg('arrow-fn-top-level.js', `
        module.exports = {
          a: (b,c) => b+c,
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
    });
    t.test('nested', async t => {
      const pkg = await mkpkg('arrow-fn-nested.js', `
        module.exports = {
          a: (b,c) => {
            const ff = Math.sqrt(100) + Math.random();
            return (b,c) => a+b+c+ff;
          },
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
      t.same(d.a().__args__, ['b','c']);
    });
    t.test('return object', async t => {
      const pkg = await mkpkg('arrow-fn-return-object.js', `
        module.exports = {
          a: (b,c) => ({a:b+c}),
          b: 5,
          c: 6
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, ['b','c']);
    });
    t.test('no args', async t => {
      const pkg = await mkpkg('arrow-fn-no-args.js', `
        module.exports = {
          a: () => 'foo',
        };
      `);
      const d = require(pkg);
      t.same(d.a.__args__, []);
    });
  });

  t.test('class function', { autoend: true }, t => {
    t.test('thisIsThing', async t => {
      const pkg = await mkpkg('class-fn-thisIsThing.js', `
        module.exports = class Logic {
          thisIsThingA() { return 5; }
          thisIsThingB() { return 5; }
          thisIsThingA2() { return 5; }
          thisIsThingB2() { return 5; }
          test() {
            return (thisIsThingA,thisIsThingB) => {
              return (thisIsThingA2,thisIsThingB2) => {
                return thisIsThingA + thisIsThingB;
              };
            };
          }
        }
      `);
      const d = require(pkg);
      t.same((new d()).test.__args__, undefined);
      t.same((new d()).test().__args__, ['thisIsThingA','thisIsThingB']);
      t.same((new d()).test()().__args__, ['thisIsThingA2', 'thisIsThingB2']);
    });
  });

  t.test('private', async t => {
    const pkg = await mkpkg('private-fn.js', `
      module.exports = {
        a: function($private) {
          return 'foo';
        },
        b: ($private) => 'foo',
        c: $private => 'foo',
        d: () => 'foo'
      };
    `);
    const d = require(pkg);
    t.same(d.a.private, true);
    t.same(d.b.private, true);
    t.same(d.c.private, true);
    t.same(d.d.private, undefined);
  });

  t.test('prep', async t => {
    const pkg = await mkpkg('prep-fn.js', `
      module.exports = {
        a: function($prep) {
          return 'foo';
        },
        b: ($prep) => 'foo',
        c: $prep => 'foo',
        d: () => 'foo'
      };
    `);
    const d = require(pkg);
    t.same(d.a.prep, true);
    t.same(d.b.prep, true);
    t.same(d.c.prep, true);
    t.same(d.d.prep, undefined);
  });
 

};

if (!module.parent) module.exports(require('tap'));
