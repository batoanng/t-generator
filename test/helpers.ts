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

export function readJson<T = PackageJson>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export async function createYeomanTestHelpers() {
  const { createHelpers } = await import('yeoman-test');

  return createHelpers({});
}

export async function scaffoldBaseApp(appName: string) {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  const runResult = await helpers
    .run(appGeneratorPath)
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
