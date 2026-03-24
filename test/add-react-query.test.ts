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

function assertProviderOrder(
  appProvidersPath: string,
  orderedTokens: string[],
): void {
  const contents = readFile(appProvidersPath);
  let previousIndex = -1;

  orderedTokens.forEach((token) => {
    const currentIndex = contents.indexOf(token);

    assert.notEqual(currentIndex, -1, `Expected to find "${token}"`);
    assert.ok(
      currentIndex > previousIndex,
      `Expected "${token}" to appear after the previous provider.`,
    );
    previousIndex = currentIndex;
  });
}

test('adds the react-query feature to an existing generated base app', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('starter-react-query');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  assert.equal(packageJson.dependencies?.['@tanstack/react-query'], '^5.64.2');
  assert.equal(
    packageJson.dependencies?.['@tanstack/react-query-devtools'],
    '5.64.2',
  );
  assert.equal(packageJson.dependencies?.axios, '1.9.0');

  yoAssert.file([
    path.join(projectRoot, 'src/shared/api/createApiClient.ts'),
    path.join(projectRoot, 'src/shared/api/createQueryClient.ts'),
    path.join(projectRoot, 'src/shared/api/useApiQuery.ts'),
    path.join(projectRoot, 'src/shared/api/useApiMutation.ts'),
    path.join(projectRoot, 'src/shared/lib/decryptData.ts'),
    path.join(projectRoot, 'src/features/react-query-demo/api/useGetChatMessages.ts'),
    path.join(projectRoot, 'src/features/react-query-demo/api/useCallChatMutation.ts'),
    path.join(projectRoot, 'src/pages/react-query/index.ts'),
    path.join(projectRoot, 'src/pages/react-query/ui/ReactQueryPage.tsx'),
    path.join(projectRoot, 'src/pages/react-query/ui/ReactQueryPage.test.tsx'),
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'VITE_API_BASE_URL=/api',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/config/env.ts'),
    "apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '/api'",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/api/createQueryClient.ts'),
    'refetchOnWindowFocus: false',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/api/index.ts'),
    "export { useApiQuery } from './useApiQuery';",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/shared/api/index.ts'),
    "export { useApiMutation } from './useApiMutation';",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'QueryClientProvider client={queryClient}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/providers/AppProviders.tsx'),
    'import.meta.env.DEV ? <ReactQueryDevtools',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the React Query example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/react-query-demo/api/useGetChatMessages.ts'),
    'useApiQuery<ChatMessage[], AxiosError>',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/react-query-demo/api/useGetChatMessages.ts'),
    'placeholderData: (previousData) => previousData',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/react-query-demo/api/useCallChatMutation.ts'),
    'useApiMutation<ChatMessage, string, AxiosError>',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/features/react-query-demo/api/useCallChatMutation.ts'),
    'invalidateQueries',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/react-query/ui/ReactQueryPage.tsx'),
    'Query client and API hooks are wired in',
  );
});

test('prompt-based add can select the react-query feature', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'prompted-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: 'react-query' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/shared/api/createQueryClient.ts'),
    path.join(projectRoot, 'src/pages/react-query/index.ts'),
  ]);
});

test('react-query can be added after auth without removing auth wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'auth-first-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  const appProvidersPath = path.join(
    projectRoot,
    'src/app/providers/AppProviders.tsx',
  );

  assertProviderOrder(appProvidersPath, [
    '<QueryClientProvider client={queryClient}>',
    '<Auth0ProviderWithNavigate>',
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the authentication example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the React Query example',
  );
});

test('react-query can be added after ui-library without removing theme wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'ui-first-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  const appProvidersPath = path.join(
    projectRoot,
    'src/app/providers/AppProviders.tsx',
  );

  assertProviderOrder(appProvidersPath, [
    '<QueryClientProvider client={queryClient}>',
    '<ThemeProvider theme={appTheme}>',
  ]);
  yoAssert.fileContent(
    appProvidersPath,
    'ReactQueryDevtools',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Axios-based wrappers for feature-level data hooks',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/react-query"',
  );
});

test('react-query can be added after redux without removing Redux wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'redux-first-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  const appProvidersPath = path.join(
    projectRoot,
    'src/app/providers/AppProviders.tsx',
  );

  assertProviderOrder(appProvidersPath, [
    '<QueryClientProvider client={queryClient}>',
    '<Provider store={store}>',
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the Redux example',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'Open the React Query example',
  );
});

test('auth, redux, and ui-library can be added after react-query without removing query wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'react-query-first-stack',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['auth'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['redux'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['ui-library'])
    .run();

  const appProvidersPath = path.join(
    projectRoot,
    'src/app/providers/AppProviders.tsx',
  );

  assertProviderOrder(appProvidersPath, [
    '<QueryClientProvider client={queryClient}>',
    '<Auth0ProviderWithNavigate>',
    '<Provider store={store}>',
    '<ThemeProvider theme={appTheme}>',
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/app/routes/AppRouter.tsx'),
    'path="/react-query"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/redux"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/pages/home/ui/HomePage.tsx'),
    'to="/react-query"',
  );
});

test('react-query can be added after bff without re-running bff checks', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp('bff-react-query');

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['bff'])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );

  yoAssert.file([
    path.join(projectRoot, 'server/package.json'),
    path.join(projectRoot, 'src/shared/api/createQueryClient.ts'),
  ]);
  assert.equal(
    packageJson.scripts?.['dev:full'],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
});

test('fails when react-query is generated outside the t-generator base app', async () => {
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
        .withArguments(['react-query'])
        .run(),
    /React Query can only be generated inside a t-generator base app/,
  );

  assert.equal(
    fs.existsSync(path.join(tmpDir, 'src/shared/api/createApiClient.ts')),
    false,
  );
});

test('fails when react-query generation would overwrite existing react-query wiring', async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp(
    'repeatable-react-query',
  );

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(['react-query'])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(['react-query'])
      .run(),
    /@tanstack\/react-query|managed paths already exist/,
  );
});
