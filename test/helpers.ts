import fs from 'node:fs';
import path from 'node:path';

import type { PackageJson } from '../generators/lib/types';

const useDistBuild = process.env.TEST_TARGET === 'dist';
const generatorExtension = useDistBuild
  ? '.js'
  : path.extname(__filename) === '.ts'
    ? '.ts'
    : '.js';
const generatorRoot = useDistBuild
  ? path.join(__dirname, '../dist/generators')
  : path.join(__dirname, '../generators');

export const appGeneratorPath = path.join(
  generatorRoot,
  'app',
  `index${generatorExtension}`,
);
export const addGeneratorPath = path.join(
  generatorRoot,
  'add',
  `index${generatorExtension}`,
);
export const reactAppGeneratorPath = path.join(
  generatorRoot,
  'react-app',
  `index${generatorExtension}`,
);
export const reactAddGeneratorPath = path.join(
  generatorRoot,
  'react-add',
  `index${generatorExtension}`,
);
export const nestjsAppGeneratorPath = path.join(
  generatorRoot,
  'nestjs-app',
  `index${generatorExtension}`,
);

export function readJson<T = PackageJson>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export async function createYeomanTestHelpers() {
  const { createHelpers } = await import('yeoman-test');

  return createHelpers({});
}

export function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function collectDirectoryFiles(rootPath: string): string[] {
  const files: string[] = [];

  function visit(currentPath: string, prefix = ''): void {
    fs.readdirSync(currentPath, { withFileTypes: true }).forEach((entry) => {
      const relativePath = prefix ? path.join(prefix, entry.name) : entry.name;
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        visit(absolutePath, relativePath);
        return;
      }

      files.push(relativePath);
    });
  }

  visit(rootPath);

  return files.sort();
}

export function snapshotDirectory(rootPath: string): Record<string, string> {
  return Object.fromEntries(
    collectDirectoryFiles(rootPath).map((relativePath) => [
      relativePath,
      readText(path.join(rootPath, relativePath)),
    ]),
  );
}

export async function scaffoldAppWithGenerator(
  generatorPath: string,
  appName: string,
) {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  const runResult = await helpers
    .run(generatorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withArguments([appName]);

  return {
    runResult,
    projectRoot: path.join(tmpDir, appName),
    tmpDir,
  };
}

export async function scaffoldBaseApp(appName: string) {
  return scaffoldAppWithGenerator(appGeneratorPath, appName);
}

export async function scaffoldReactApp(appName: string) {
  return scaffoldAppWithGenerator(reactAppGeneratorPath, appName);
}

export async function scaffoldNestApp(appName: string) {
  return scaffoldAppWithGenerator(nestjsAppGeneratorPath, appName);
}
