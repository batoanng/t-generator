import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import {
  createYeomanTestHelpers,
  nestjsAppGeneratorPath,
  reactAddGeneratorPath,
  reactAppGeneratorPath,
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
      path.join(distRoot, 'generators/index.js'),
      path.join(distRoot, 'generators/react-app/index.js'),
      path.join(distRoot, 'generators/react-app/templates/package.json.ejs'),
      path.join(distRoot, 'generators/react-add/index.js'),
      path.join(distRoot, 'generators/react-add/templates/auth/_env.example.ejs'),
      path.join(distRoot, 'generators/nestjs-app/index.js'),
      path.join(distRoot, 'generators/nestjs-app/templates/src/server.ts.ejs'),
      path.join(
        distRoot,
        'generators/react-add/templates/apollo/src/shared/apollo/ApolloWithAuthProvider.tsx.ejs',
      ),
      path.join(
        distRoot,
        'generators/react-add/templates/bff/server/server.js.ejs',
      ),
      path.join(distRoot, 'generators/react-add/templates/pwa/vite.config.ts.ejs'),
      path.join(
        distRoot,
        'generators/react-add/templates/redux/src/app/store/index.ts.ejs',
      ),
      path.join(
        distRoot,
        'generators/react-add/templates/react-query/src/shared/api/useApiQuery.ts.ejs',
      ),
    ]);

    assert.equal(distPackageJson.main, 'generators/index.js');
    assert.deepEqual(distPackageJson.files, ['generators', 'README.md']);

    let tmpDir = '';
    const helpers = await createYeomanTestHelpers();

    const runResult = await helpers
      .run(reactAppGeneratorPath)
      .inTmpDir((directory) => {
        tmpDir = directory;
      })
      .withArguments(['dist-smoke']);

    const projectRoot = path.join(tmpDir, 'dist-smoke');

    yoAssert.file([path.join(projectRoot, 'package.json')]);

    await runResult
      .create(
        reactAddGeneratorPath,
        { cwd: projectRoot, tmpdir: false },
        undefined,
      )
      .withArguments(['pwa'])
      .run();

    yoAssert.file([
      path.join(projectRoot, 'src/features/pwa/index.ts'),
      path.join(projectRoot, 'src/pages/pwa/index.ts'),
    ]);

    let reactTmpDir = '';
    const reactRunResult = await helpers
      .run(reactAppGeneratorPath)
      .inTmpDir((directory) => {
        reactTmpDir = directory;
      })
      .withArguments(['explicit-react']);

    const explicitReactRoot = path.join(reactTmpDir, 'explicit-react');

    await reactRunResult
      .create(
        reactAddGeneratorPath,
        { cwd: explicitReactRoot, tmpdir: false },
        undefined,
      )
      .withArguments(['auth'])
      .run();

    yoAssert.file([
      path.join(explicitReactRoot, 'src/pages/auth/index.ts'),
      path.join(
        explicitReactRoot,
        'src/app/providers/auth/Auth0ProviderWithNavigate.tsx',
      ),
    ]);

    let nestTmpDir = '';
    await helpers
      .run(nestjsAppGeneratorPath)
      .inTmpDir((directory) => {
        nestTmpDir = directory;
      })
      .withArguments(['dist-nest']);

    yoAssert.file([
      path.join(nestTmpDir, 'dist-nest/package.json'),
      path.join(nestTmpDir, 'dist-nest/src/server.ts'),
      path.join(nestTmpDir, 'dist-nest/prisma/schema.prisma'),
    ]);
  },
);
