const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');

async function copyDirectory(source, target) {
  if (!fsSync.existsSync(source)) {
    return;
  }

  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true });
}

function packagePath(nodeModulesDir, packageName) {
  return path.join(nodeModulesDir, ...packageName.split('/'));
}

function readPackageJson(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (!fsSync.existsSync(packageJsonPath)) {
    return null;
  }

  return JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'));
}

async function copyDependencyTree(packageName, sourceNodeModules, targetNodeModules, copied) {
  if (copied.has(packageName)) {
    return;
  }

  const sourcePackageDir = packagePath(sourceNodeModules, packageName);
  if (!fsSync.existsSync(sourcePackageDir)) {
    return;
  }

  copied.add(packageName);
  await copyDirectory(sourcePackageDir, packagePath(targetNodeModules, packageName));

  const packageJson = readPackageJson(sourcePackageDir);
  if (!packageJson) {
    return;
  }

  const dependencyNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {})
  ]);

  for (const dependencyName of dependencyNames) {
    await copyDependencyTree(dependencyName, sourceNodeModules, targetNodeModules, copied);
  }
}

exports.default = async function afterPack(context) {
  const projectDir = context.packager.projectDir;
  const standaloneNodeModules = path.join(projectDir, 'web', '.next', 'standalone', 'node_modules');
  const projectNodeModules = path.join(projectDir, 'node_modules');
  const targetNodeModules = path.join(context.appOutDir, 'resources', 'next-standalone', 'node_modules');

  await copyDirectory(standaloneNodeModules, targetNodeModules);

  const rootPackage = readPackageJson(projectDir);
  const copied = new Set();
  for (const packageName of Object.keys(rootPackage?.dependencies ?? {})) {
    await copyDependencyTree(packageName, projectNodeModules, targetNodeModules, copied);
  }
};
