import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import {
  addGeneratorPath,
  appGeneratorPath,
  createYeomanTestHelpers,
  readJson,
} from './helpers';

const distSmokeTest = process.env.DIST_SMOKE === '1' ? test : test.skip;

distSmokeTest(
  'staged dist package keeps the expected Yeoman layout',
  async () => {
    const distRoot =
      process.env.TEST_TARGET === 'dist'
        ? path.join(__dirname, '..', 'dist')
        : path.join(__dirname, '..');
    const distPackageJson = readJson<PackageJson>(
      path.join(distRoot, 'package.json'),
    );

    yoAssert.file([
      path.join(distRoot, 'README.md'),
      path.join(distRoot, 'package.json'),
      path.join(distRoot, 'generators/app/index.js'),
      path.join(distRoot, 'generators/app/templates/package.json.ejs'),
      path.join(distRoot, 'generators/add/index.js'),
      path.join(distRoot, 'generators/add/templates/auth/_env.example.ejs'),
      path.join(distRoot, 'generators/add/templates/bff/server/server.js.ejs'),
    ]);

    assert.equal(distPackageJson.main, 'generators/app/index.js');
    assert.deepEqual(distPackageJson.files, ['generators', 'README.md']);

    let tmpDir = '';
    const helpers = await createYeomanTestHelpers();

    const runResult = await helpers
      .run(appGeneratorPath)
      .inTmpDir((directory) => {
        tmpDir = directory;
      })
      .withArguments(['dist-smoke']);

    const projectRoot = path.join(tmpDir, 'dist-smoke');

    yoAssert.file([path.join(projectRoot, 'package.json')]);

    await runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['auth'])
      .run();

    yoAssert.file([
      path.join(projectRoot, 'src/pages/auth/index.ts'),
      path.join(
        projectRoot,
        'src/app/providers/auth/Auth0ProviderWithNavigate.tsx',
      ),
    ]);
  },
);
