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

test('adds the apollo feature to an existing generated base app', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('starter-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const apolloProviderPath = path.join(
    projectRoot,
    'src/shared/apollo/ApolloWithAuthProvider.tsx',
  );

  assert.equal(packageJson.dependencies?.['@apollo/client'], '^4.1.6');
  assert.equal(packageJson.dependencies?.graphql, '^16.13.2');
  assert.equal(packageJson.dependencies?.['@auth0/auth0-react'], undefined);

  yoAssert.file([
    apolloProviderPath,
    path.join(projectRoot, 'src/shared/apollo/index.ts'),
    path.join(projectRoot, 'src/features/apollo-demo/index.ts'),
    path.join(projectRoot, 'src/features/apollo-demo/api/index.ts'),
    path.join(
      projectRoot,
      'src/features/apollo-demo/api/useApolloDemoRootTypeQuery.ts',
    ),
    path.join(projectRoot, 'src/features/apollo-demo/model/index.ts'),
    path.join(projectRoot, 'src/features/apollo-demo/model/queries.ts'),
    path.join(projectRoot, 'src/features/apollo-demo/model/types.ts'),
    path.join(projectRoot, 'src/pages/apollo/index.ts'),
    path.join(projectRoot, 'src/pages/apollo/ui/ApolloPage.tsx'),
    path.join(projectRoot, 'src/pages/apollo/ui/ApolloPage.test.tsx'),
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_GRAPHQL_URL=/graphql',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/config/env.ts'),
    "graphqlUrl: import.meta.env.VITE_GRAPHQL_URL?.trim() || '/graphql'",
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
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Apollo example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/apollo/ui/ApolloPage.tsx'),
    'query ApolloDemoRootType',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/apollo/ui/ApolloPage.tsx'),
    'useApolloDemoRootTypeQuery',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/apollo-demo/model/queries.ts'),
    '__typename',
  );

  assertTokenOrder(path.join(projectRoot, 'src/app/routes/AppRouter.tsx'), [
    '<ApolloWithAuthProvider>',
    '<Routes>',
    'path="/apollo"',
  ]);
  assert.equal(readFile(apolloProviderPath).includes('useAuth0'), false);
  assert.equal(
    readFile(apolloProviderPath).includes('Authorization: `Bearer ${token}`'),
    false,
  );
});

test('prompt-based add can select the apollo feature', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('prompted-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: 'apollo' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/shared/apollo/index.ts'),
    path.join(projectRoot, 'src/pages/apollo/index.ts'),
  ]);
});

test('apollo can be added after auth without removing auth wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('auth-first-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  const apolloProviderPath = path.join(
    projectRoot,
    'src/shared/apollo/ApolloWithAuthProvider.tsx',
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
    'path="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the authentication example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Apollo example',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'useAuth0',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'getAccessTokenSilently',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'env.auth0.isConfigured',
  );
});

test('auth can be added after apollo without removing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('apollo-first-auth');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  const apolloProviderPath = path.join(
    projectRoot,
    'src/shared/apollo/ApolloWithAuthProvider.tsx',
  );

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Auth0ProviderWithNavigate',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'useAuth0',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'Authorization: `Bearer ${token}`',
  );
  yoAssert.fileContent(
    apolloProviderPath,
    'ApolloWithoutAuthProvider',
  );
});

test('apollo can be added after ui-library without removing theme wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('ui-first-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'createDefaultTheme({})',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    '<CssBaseline />',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    '@batoanng/mui-components',
  );
});

test('ui-library can be added after apollo without removing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('apollo-first-ui');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'createDefaultTheme({})',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'ui-library feature wires Material UI theme setup',
  );
});

test('apollo can be added after redux without removing Redux wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('redux-first-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
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
    'path="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Redux example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Apollo example',
  );
});

test('redux can be added after apollo without removing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('apollo-first-redux');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'Provider store={store}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
});

test('apollo can be added after react-query without removing query wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'react-query-first-apollo',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'QueryClientProvider client={queryClient}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the React Query example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Apollo example',
  );
});

test('react-query can be added after apollo without removing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'apollo-first-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'QueryClientProvider client={queryClient}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'ApolloWithAuthProvider',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/apollo"',
  );
});

test('apollo can be added after bff without re-running bff checks', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('bff-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['bff'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  yoAssert.file([
    path.join(projectRoot, 'server/package.json'),
    path.join(projectRoot, 'src/shared/apollo/index.ts'),
  ]);
  assert.equal(
    packageJson.scripts?.['dev:full'],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
});

test('fails when apollo is generated outside the t-generator base app', async () => {
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
        .withArguments(['apollo'])
        .run(),
    /Apollo can only be generated inside a t-generator base app/,
  );

  assert.equal(fs.existsSync(path.join(tmpDir, 'src/shared/apollo')), false);
});

test('fails when apollo generation would overwrite existing Apollo wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('repeatable-apollo');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['apollo'])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['apollo'])
      .run(),
    /@apollo\/client|graphql|managed paths already exist/,
  );
});
