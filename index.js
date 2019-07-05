const shimRequire = require('shim-require');

// apply clues pre-processing
// https://regex101.com/r/zD3nE9/1
const createReFn = () => /function\s*([A-z0-9]+)?\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*\{(?:[^}{]+|\{(?:[^}{]+|\{[^}{]*\})*\})*\}/g;
const createReFnArgs = () => /^\s*function.*?\(([^)]*?)\).*/;
const reEs6 =  /^\s*\({0,1}([^)]*?)\){0,1}\s*=>/;
const reEs6Class = /^\s*[a-zA-Z0-9\-$_]+\s*\((.*?)\)\s*{/;
const WRAPFN = `function WRAPFN(args, fn) {
  fn.__args__ = args;
  return fn;
}`;

function optimize(rawData) {
  // walk through function and optimize
  let processed;
  let wrapIndex = 0;
  let argsDefs = [];

	// regular functions
  function regularFunctions(d) {
    const reFn = createReFn();
		for (let matches = reFn.exec(d); matches; matches = reFn.exec(d)) {
      // This is necessary to avoid infinite loops with zero-width matches
      // TODO is this necessary? creating the new regex objects?
      if (matches.index === reFn.lastIndex) {
        reFn.lastIndex++;
      }
      matches.filter(d => d).forEach(match => {
        wrapIndex++;
        // wrap fn
        const optimized = `WRAPFN(ARGS_${wrapIndex}, ${match})`;
        d = d.replace(match, optimized);
        // collect arguments
        const reFnArgs = createReFnArgs();
        const args = reFnArgs.exec(match);
        argsDefs.push(`const ARGS_${wrapIndex} = [${args[1].split(/\,(?:\s)?/).map(d => '"'+d+'"')}];`);
        // check for nested fn
        const nestedReFn = createReFn();
        const substr = match.substring(1);
		    for (let nestedMatches = nestedReFn.exec(substr); nestedMatches; nestedMatches = nestedReFn.exec(substr)) {
          if (nestedMatches.index === nestedReFn.lastIndex) {
            nestedReFn.lastIndex++;
          }
          nestedMatches.filter(d => d).forEach(nestedMatch => {
            d = d.replace(nestedMatch, regularFunctions(nestedMatch));
          });
        }
        // TODO check for nested other fn types
      });
    }
    return d;
	}
  processed = regularFunctions(rawData);

  // TODO arrow functions
  // TODO class functions

  // prepend wrapfn if any functions are wrapped
  if (wrapIndex) {
    processed = `${WRAPFN}
      ${argsDefs.join("\n")}
      ${processed}`;
  }

  //console.log(`\n\n\n>>>>>>>>>>>>>>>>>>>>>\noptimized output:\n${processed}\n<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n`);
  return processed;
}

shimRequire(function(content, filename, module) {
  const optimized = optimize(content);
  return optimized;
});
