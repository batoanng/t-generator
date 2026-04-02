import fs from 'node:fs';
import path from 'node:path';

import type { PackageJson } from '../generators/lib/types';

const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.join(projectRoot, 'dist');
const rootPackageJsonPath = path.join(projectRoot, 'package.json');
const readmePath = path.join(projectRoot, 'README.md');

const rootPackageJson = JSON.parse(
  fs.readFileSync(rootPackageJsonPath, 'utf8'),
) as PackageJson;

const distPackageJson: PackageJson = {
  name: rootPackageJson.name,
  version: rootPackageJson.version,
  description: rootPackageJson.description,
  type: 'commonjs',
  main: 'generators/index.js',
  files: ['generators', 'README.md'],
  keywords: rootPackageJson.keywords,
  engines: rootPackageJson.engines,
  dependencies: rootPackageJson.dependencies,
};

fs.copyFileSync(readmePath, path.join(distRoot, 'README.md'));
fs.writeFileSync(
  path.join(distRoot, 'package.json'),
  `${JSON.stringify(distPackageJson, null, 2)}\n`,
);

copyDirectory(
  path.join(projectRoot, 'generators', 'react-app', 'templates'),
  path.join(distRoot, 'generators', 'react-app', 'templates'),
);
copyDirectory(
  path.join(projectRoot, 'generators', 'react-add', 'templates'),
  path.join(distRoot, 'generators', 'react-add', 'templates'),
);
copyDirectory(
  path.join(projectRoot, 'generators', 'nestjs-app', 'templates'),
  path.join(distRoot, 'generators', 'nestjs-app', 'templates'),
);

function copyDirectory(sourcePath: string, destinationPath: string): void {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}
