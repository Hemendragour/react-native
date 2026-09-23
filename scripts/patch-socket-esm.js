/**
 * Post-install script: patches socket.io ESM packages that break Metro bundler.
 *
 * Problem: engine.io-client, engine.io-parser, socket.io-parser, socket.io-client
 * all ship build/esm/package.json with { "type": "module" } which causes Metro
 * to fail resolving relative .js imports inside the ESM builds.
 *
 * Fix: Remove "type": "module" from those ESM package.json files so Metro
 * treats them as CJS and resolves .js extensions normally.
 *
 * Also: Remove the "browser" field from engine.io-client's root package.json
 * that remaps paths into the ESM directory, forcing Metro to stay on CJS.
 */

const fs = require('fs');
const path = require('path');

const PACKAGES_TO_PATCH = [
  'engine.io-client',
  'engine.io-parser',
  'socket.io-parser',
  'socket.io-client',
];

let patched = 0;

for (const pkgName of PACKAGES_TO_PATCH) {
  const esmPkgPath = path.join(
    __dirname,
    '..',
    'node_modules',
    pkgName,
    'build',
    'esm',
    'package.json',
  );

  if (!fs.existsSync(esmPkgPath)) continue;

  try {
    const content = JSON.parse(fs.readFileSync(esmPkgPath, 'utf8'));

    if (content.type === 'module') {
      delete content.type;
      fs.writeFileSync(esmPkgPath, JSON.stringify(content, null, 2) + '\n');
      patched++;
      console.log(`  ✅ Patched ${pkgName}/build/esm/package.json — removed "type":"module"`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Failed to patch ${pkgName}:`, err.message);
  }
}

if (patched > 0) {
  console.log(`\n  Patched ${patched} ESM package.json file(s) for Metro compatibility.\n`);
} else {
  console.log('  No ESM packages needed patching.\n');
}
