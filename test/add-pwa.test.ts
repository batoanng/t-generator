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

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function assertTokenOrder(filePath: string, orderedTokens: string[]): void {
  const contents = readFile(filePath);
  let previousIndex = -1;

  orderedTokens.forEach((token) => {
    const currentIndex = contents.indexOf(token);

    assert.notEqual(currentIndex, -1, `Expected to find "${token}"`);
    assert.ok(
      currentIndex > previousIndex,
      `Expected "${token}" to appear after the previous token.`,
    );
    previousIndex = currentIndex;
  });
}

test('adds the pwa feature to an existing generated base app', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('starter-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const appPath = path.join(projectRoot, 'src/app/entrypoint/App.tsx');
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');

  assert.equal(packageJson.devDependencies?.['vite-plugin-pwa'], '^1.0.3');
  assert.equal(packageJson.dependencies?.['vite-plugin-pwa'], undefined);

  yoAssert.file([
    path.join(projectRoot, 'src/features/pwa/index.ts'),
    path.join(projectRoot, 'src/features/pwa/model/index.ts'),
    path.join(projectRoot, 'src/features/pwa/model/PwaProvider.tsx'),
    path.join(projectRoot, 'src/features/pwa/ui/PwaStatus.tsx'),
    path.join(projectRoot, 'src/features/pwa/ui/pwa-status.css'),
    path.join(projectRoot, 'src/pages/pwa/index.ts'),
    path.join(projectRoot, 'src/pages/pwa/ui/PwaPage.tsx'),
    path.join(projectRoot, 'src/pages/pwa/ui/PwaPage.test.tsx'),
    path.join(projectRoot, 'public/pwa-icon.svg'),
  ]);

  yoAssert.fileContent(viteConfigPath, "import { VitePWA } from 'vite-plugin-pwa';");
  yoAssert.fileContent(viteConfigPath, "strategies: 'generateSW'");
  yoAssert.fileContent(viteConfigPath, "registerType: 'prompt'");
  yoAssert.fileContent(viteConfigPath, "image: 'public/pwa-icon.svg'");
  yoAssert.fileContent(viteConfigPath, "name: 'starter-pwa'");
  yoAssert.fileContent(viteConfigPath, "start_url: '/'");
  yoAssert.fileContent(appPath, "import { PwaProvider, PwaStatus } from '@/features/pwa';");
  yoAssert.fileContent(appPath, '<PwaStatus />');
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the PWA example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/pwa/ui/PwaPage.tsx'),
    'vite-plugin-pwa',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/pwa/ui/PwaPage.tsx'),
    'generateSW',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/pwa/model/PwaProvider.tsx'),
    "useRegisterSW({",
  );

  assertTokenOrder(appPath, [
    '<PwaProvider>',
    '<AppProviders>',
    '<PwaStatus />',
    '<AppRouter />',
  ]);
  assertTokenOrder(viteConfigPath, ['react(),', 'VitePWA({']);
});

test('prompt-based add can select the pwa feature', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('prompted-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: 'pwa' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/features/pwa/index.ts'),
    path.join(projectRoot, 'src/pages/pwa/index.ts'),
  ]);
});

test('pwa can be added after auth without removing auth wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('auth-first-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaStatus',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the authentication example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the PWA example',
  );
});

test('auth can be added after pwa without removing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('pwa-first-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaProvider',
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
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('pwa can be added after ui-library without removing theme wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('ui-first-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'createDefaultTheme({})',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaStatus',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/pwa"',
  );
});

test('ui-library can be added after pwa without removing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('pwa-first-ui');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/pwa"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'ui-library feature wires Material UI theme setup',
  );
});

test('pwa can be added after redux without removing Redux wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('redux-first-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('redux can be added after pwa without removing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('pwa-first-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaStatus',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('pwa can be added after react-query without removing query wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'react-query-first-pwa',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'QueryClientProvider client={queryClient}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('react-query can be added after pwa without removing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'pwa-first-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaStatus',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'QueryClientProvider client={queryClient}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('pwa can be added after apollo without removing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('apollo-first-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('apollo can be added after pwa without removing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('pwa-first-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/entrypoint/App.tsx'),
    'PwaProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/pwa"',
  );
});

test('pwa can be added after bff without re-running bff checks', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('bff-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['bff'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  yoAssert.file([
    path.join(projectRoot, 'server/package.json'),
    path.join(projectRoot, 'src/features/pwa/index.ts'),
  ]);
  assert.equal(
    packageJson.scripts?.['dev:full'],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
});

test('fails when pwa is generated outside the t-generator base app', async () => {
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
        .withArguments(['pwa'])
        .run(),
    /PWA can only be generated inside a t-generator base app/,
  );

  assert.equal(fs.existsSync(path.join(tmpDir, 'src/features/pwa')), false);
});

test('fails when pwa generation would overwrite existing PWA wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('repeatable-pwa');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['pwa'])
      .run(),
    /vite-plugin-pwa|managed paths already exist/,
  );
});
