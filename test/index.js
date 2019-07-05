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
      const pkg = await mkpkg('test1.js', `
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
      const pkg = await mkpkg('test2.js', `
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
    t.test('contains blocks');
    t.test('contains function');
  });

  t.test('arrow function', { autoend: true }, t => {
    t.test('single level');
    t.test('contains blocks');
    t.test('contains function');
  });

};

if (!module.parent) module.exports(require('tap'));
