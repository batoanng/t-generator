import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import { appGeneratorPath, createYeomanTestHelpers, readJson } from './helpers';

const blockedDependencies = [
  '@batoanng/mui-components',
  '@emotion/react',
  '@emotion/styled',
  '@apollo/client',
  '@auth0/auth0-react',
  '@types/redux-immutable-state-invariant',
  '@types/redux-logger',
  '@mui/material',
  '@mui/icons-material',
  '@reduxjs/toolkit',
  '@tanstack/react-query',
  '@tanstack/react-query-devtools',
  'react-redux',
  'redux',
  'redux-immutable-state-invariant',
  'redux-logger',
  'redux-persist',
  'axios',
  'graphql',
  'vite-plugin-pwa',
  'notistack',
];

test('generates the base app with the expected project structure', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await helpers
    .run(appGeneratorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withArguments(['starter-app']);

  const projectRoot = path.join(tmpDir, 'starter-app');
  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  yoAssert.file([
    path.join(projectRoot, 'package.json'),
    path.join(projectRoot, 'index.html'),
    path.join(projectRoot, 'tsconfig.json'),
    path.join(projectRoot, 'vite.config.ts'),
    path.join(projectRoot, 'vitest.config.ts'),
    path.join(projectRoot, 'eslint.config.js'),
    path.join(projectRoot, '.prettierrc.json'),
    path.join(projectRoot, '.prettierignore'),
    path.join(projectRoot, '.env.example'),
    path.join(projectRoot, 'src/main.tsx'),
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    path.join(projectRoot, 'src/app/styles/global.css'),
    path.join(projectRoot, 'src/pages/home/index.ts'),
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    path.join(projectRoot, 'src/pages/home/ui/HomePage.test.tsx'),
    path.join(projectRoot, 'src/shared/config/env.ts'),
    path.join(projectRoot, 'src/test/setup.ts'),
  ]);

  assert.deepEqual(Object.keys(packageJson.scripts || {}), [
    'dev',
    'build',
    'preview',
    'lint',
    'test',
  ]);

  assert.deepEqual(Object.keys(packageJson.dependencies || {}).sort(), [
    'react',
    'react-dom',
    'react-router-dom',
  ]);

  blockedDependencies.forEach((dependencyName) => {
    assert.equal(packageJson.dependencies?.[dependencyName], undefined);
    assert.equal(packageJson.devDependencies?.[dependencyName], undefined);
  });

  [
    'src/widgets',
    'src/features',
    'src/entities',
    'src/shared/ui',
    'src/shared/api',
    'src/shared/lib',
  ].forEach((directory) => {
    assert.equal(
      fs.statSync(path.join(projectRoot, directory)).isDirectory(),
      true,
      `${directory} should exist`,
    );
  });

  assert.equal(fs.existsSync(path.join(projectRoot, 'server')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/app/store')), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/features/auth')),
    false,
  );
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/pages/redux')), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/pages/react-query')),
    false,
  );
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/pages/apollo')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/shared/apollo')), false);

  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/config/env.ts'),
    'appName: import.meta.env.VITE_APP_NAME?.trim() || fallbackAppName',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    '<Route path="/" element={<HomePage />} />',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.test.tsx'),
    '<AppProviders>',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'README.md'),
    'yo t-generator:add',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'README.md'),
    'yo t-generator:add auth',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'README.md'),
    'yo t-generator:add redux',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'README.md'),
    'yo t-generator:add react-query',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'README.md'),
    'yo t-generator:add apollo',
  );
});

test('prompts for the app name when one is not provided', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await helpers
    .run(appGeneratorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withPrompts({ appName: 'Prompt Driven App' });

  const projectRoot = path.join(tmpDir, 'prompt-driven-app');

  yoAssert.file([
    path.join(projectRoot, 'package.json'),
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_APP_NAME=Prompt Driven App',
  );
});

test('fails when the target directory already exists and is not empty', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(appGeneratorPath)
        .inTmpDir((directory) => {
          tmpDir = directory;
          const targetDirectory = path.join(directory, 'existing-app');

          fs.mkdirSync(targetDirectory, { recursive: true });
          fs.writeFileSync(path.join(targetDirectory, 'keep.txt'), 'existing');
        })
        .withArguments(['existing-app'])
        .run(),
    /already exists and is not empty/,
  );

  assert.equal(
    fs.existsSync(path.join(tmpDir, 'existing-app', 'keep.txt')),
    true,
  );
});
