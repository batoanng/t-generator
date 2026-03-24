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

test('adds the redux feature to an existing generated base app', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('starter-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  assert.equal(packageJson.dependencies?.['@reduxjs/toolkit'], '^2.2.7');
  assert.equal(packageJson.dependencies?.['react-redux'], '^8.0.2');
  assert.equal(packageJson.dependencies?.redux, '^4.2.0');
  assert.equal(packageJson.dependencies?.['redux-persist'], '^6.0.0');
  assert.equal(
    packageJson.devDependencies?.['redux-immutable-state-invariant'],
    '^2.1.0',
  );
  assert.equal(packageJson.devDependencies?.['redux-logger'], '^3.0.6');
  assert.equal(
    packageJson.devDependencies?.['@types/redux-immutable-state-invariant'],
    '^2.1.4',
  );
  assert.equal(
    packageJson.devDependencies?.['@types/redux-logger'],
    '^3.0.13',
  );

  yoAssert.file([
    path.join(projectRoot, 'src/app/store/index.ts'),
    path.join(projectRoot, 'src/app/store/GlobalSlice.ts'),
    path.join(projectRoot, 'src/app/store/actions.ts'),
    path.join(projectRoot, 'src/pages/redux/index.ts'),
    path.join(projectRoot, 'src/pages/redux/ui/ReduxPage.tsx'),
    path.join(projectRoot, 'src/pages/redux/ui/ReduxPage.test.tsx'),
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_ENABLE_REDUX_LOGGING=false',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/config/env.ts'),
    "enableReduxLogging: import.meta.env.VITE_ENABLE_REDUX_LOGGING === 'true'",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    '<Provider store={store}>{children}</Provider>',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Redux example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/redux/ui/ReduxPage.tsx'),
    'Persisted storage key',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/redux/ui/ReduxPage.test.tsx'),
    'persist:${PERSIST_STORAGE_KEY}',
  );
});

test('prompt-based add can select the redux feature', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('prompted-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: 'redux' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/app/store/index.ts'),
    path.join(projectRoot, 'src/pages/redux/index.ts'),
  ]);
});

test('redux can be added after auth without removing auth wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('auth-first-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  assert.equal(packageJson.dependencies?.['@auth0/auth0-react'], '^2.8.0');
  assert.equal(packageJson.dependencies?.['@reduxjs/toolkit'], '^2.2.7');

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the authentication example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Redux example',
  );
});

test('redux can be added after ui-library without removing theme wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('ui-first-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'createDefaultTheme({})',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Redux Toolkit and redux-persist',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/redux"',
  );
});

test('redux can be added after auth and ui-library while preserving both setups', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'ui-auth-first-redux',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
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
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/redux"',
  );
});

test('redux can be added after bff without re-running bff checks', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('bff-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['bff'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  yoAssert.file([
    path.join(projectRoot, 'server/package.json'),
    path.join(projectRoot, 'src/app/store/index.ts'),
  ]);
  assert.equal(
    packageJson.scripts?.['dev:full'],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
});

test('fails when redux is generated outside the t-generator base app', async () => {
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
        .withArguments(['redux'])
        .run(),
    /Redux can only be generated inside a t-generator base app/,
  );

  assert.equal(fs.existsSync(path.join(tmpDir, 'src/app/store')), false);
});

test('fails when redux generation would overwrite existing redux wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('repeatable-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['redux'])
      .run(),
    /@reduxjs\/toolkit|react-redux|managed paths already exist/,
  );
});
