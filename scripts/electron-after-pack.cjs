const fs = require('node:fs/promises');
const path = require('node:path');

exports.default = async function afterPack(context) {
  const source = path.join(context.packager.projectDir, 'web', '.next', 'standalone', 'node_modules');
  const target = path.join(context.appOutDir, 'resources', 'next-standalone', 'node_modules');

  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true });
};
