import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import {
  addGeneratorPath,
  createYeomanTestHelpers,
  readJson,
  scaffoldBaseApp,
} from './helpers';

test('adds the auth feature to an existing generated base app', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('starter-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  assert.equal(packageJson.dependencies?.['@auth0/auth0-react'], '^2.8.0');
  assert.equal(
    packageJson.dependencies?.['@batoanng/mui-components'],
    undefined,
  );

  yoAssert.file([
    path.join(
      projectRoot,
      'src/app/providers/auth/Auth0ProviderWithNavigate.tsx',
    ),
    path.join(projectRoot, 'src/pages/auth/index.ts'),
    path.join(projectRoot, 'src/pages/auth/ui/AuthPage.tsx'),
    path.join(projectRoot, 'src/pages/auth/ui/AuthPage.test.tsx'),
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_AUTH0_DOMAIN=',
  );
  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_AUTH0_CLIENT_ID=',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/config/env.ts'),
    'isConfigured: Boolean(auth0Domain && auth0ClientId)',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the authentication example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/auth/ui/AuthPage.tsx'),
    'Connect Auth0',
  );
});

test('prompt-based add can select the auth feature', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('prompted-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: 'auth' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/pages/auth/index.ts'),
    path.join(
      projectRoot,
      'src/app/providers/auth/Auth0ProviderWithNavigate.tsx',
    ),
  ]);
});

test('auth can be added after ui-library without removing theme wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('ui-first-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  assert.equal(packageJson.dependencies?.['@auth0/auth0-react'], '^2.8.0');
  assert.equal(
    packageJson.dependencies?.['@batoanng/mui-components'],
    '^3.0.30',
  );

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    '<CssBaseline />',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/auth/ui/AuthPage.tsx'),
    'Log in with Auth0',
  );
});

test('fails when auth is generated outside the t-generator base app', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(addGeneratorPath)
        .inTmpDir((directory) => {
          tmpDir = directory;
          fs.writeFileSync(
            path.join(directory, 'package.json'),
            JSON.stringify(
              {
                name: 'custom-app',
                scripts: {
                  dev: 'vite',
                  build: 'vite build',
                  preview: 'vite preview',
                  lint: 'eslint src',
                  test: 'vitest run',
                },
              },
              null,
              2,
            ),
          );
        })
        .withArguments(['auth'])
        .run(),
    /Auth can only be generated inside a t-generator base app/,
  );

  assert.equal(fs.existsSync(path.join(tmpDir, 'src/pages/auth')), false);
});

test('fails when auth generation would overwrite existing auth wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('repeatable-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['auth'])
      .run(),
    /@auth0\/auth0-react/,
  );
});
