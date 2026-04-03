import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import {
  createYeomanTestHelpers,
  nestjsAppGeneratorPath,
  readJson,
  scaffoldNestApp,
} from './helpers';

const blockedDependencies = [
  '@apollo/server',
  '@as-integrations/fastify',
  '@keyv/redis',
  '@langchain/core',
  '@langchain/deepseek',
  '@langchain/openai',
  '@nestjs/apollo',
  '@nestjs/bullmq',
  '@nestjs/cache-manager',
  '@nestjs/graphql',
  '@types/jest',
  '@types/supertest',
  'bullmq',
  'cache-manager',
  'graphql',
  'jest',
  'openai',
  'react',
  'react-dom',
  'react-router-dom',
  'supertest',
  'ts-jest',
  'vite',
  'web-push',
];

test('generates the NestJS base app with the expected project structure', async () => {
  const { projectRoot } = await scaffoldNestApp('starter-server');
  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const hasPackageDependency = (dependencyName: string): boolean =>
    typeof packageJson.dependencies?.[dependencyName] === 'string' ||
    typeof packageJson.devDependencies?.[dependencyName] === 'string';

  yoAssert.file([
    path.join(projectRoot, 'package.json'),
    path.join(projectRoot, 'tsconfig.json'),
    path.join(projectRoot, 'tsconfig.eslint.json'),
    path.join(projectRoot, 'vitest.config.ts'),
    path.join(projectRoot, 'nodemon.json'),
    path.join(projectRoot, 'index.js'),
    path.join(projectRoot, '.eslintrc.cjs'),
    path.join(projectRoot, 'prettier.config.js'),
    path.join(projectRoot, '.gitignore'),
    path.join(projectRoot, '.env.example'),
    path.join(projectRoot, 'prisma/schema.prisma'),
    path.join(projectRoot, 'src/server.ts'),
    path.join(projectRoot, 'src/modules/app.module.ts'),
    path.join(projectRoot, 'src/modules/common/common.module.ts'),
    path.join(
      projectRoot,
      'src/modules/common/provider/config.provider.ts',
    ),
    path.join(projectRoot, 'src/modules/common/provider/prisma.provider.ts'),
    path.join(projectRoot, 'src/modules/common/flow/log.interceptor.ts'),
    path.join(projectRoot, 'src/modules/common/controller/health.controller.ts'),
    path.join(projectRoot, 'src/modules/common/security/health.guard.ts'),
    path.join(projectRoot, 'src/modules/auth/auth.module.ts'),
    path.join(projectRoot, 'src/modules/auth/jwt.strategy.ts'),
    path.join(projectRoot, 'src/test/health.test.ts'),
    path.join(projectRoot, 'src/modules/tokens.ts'),
    path.join(projectRoot, 'src/types/config.ts'),
  ]);

  assert.deepEqual(Object.keys(packageJson.scripts || {}), [
    'postinstall',
    'start',
    'dev',
    'build',
    'test',
    'lint',
    'prisma:generate',
    'prisma:push',
  ]);

  [
    '@fastify/cors',
    '@fastify/static',
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/passport',
    '@nestjs/platform-fastify',
    '@nestjs/swagger',
    '@nestjs/testing',
    '@nestjs/terminus',
    '@prisma/client',
    'class-transformer',
    'class-validator',
    'fastify',
    'jwks-rsa',
    'passport',
    'passport-jwt',
    'reflect-metadata',
    'rxjs',
    'vitest',
    'zod',
  ].forEach((dependencyName) => {
    assert.equal(hasPackageDependency(dependencyName), true, `${dependencyName} should exist`);
  });
  assert.equal(packageJson.dependencies?.zod, '^4.3.6');

  blockedDependencies.forEach((dependencyName) => {
    assert.equal(packageJson.dependencies?.[dependencyName], undefined);
    assert.equal(packageJson.devDependencies?.[dependencyName], undefined);
  });

  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'DATABASE_URL=mongodb://localhost:27017/starter-server',
  );
  yoAssert.fileContent(
    path.join(projectRoot, '.env.example'),
    'OIDC_AUTHORITY=https://example.auth0.com',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'imports: [',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'CommonModule,',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'AuthModule,',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/types/config.ts'),
    'export const configSchema = z.object({',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/types/config.ts'),
    'export type Config = z.infer<typeof configSchema>;',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/types/config.ts'),
    'export function getConfig(): Config {',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/server.ts'),
    'const port = config.API_PORT;',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/common/security/health.guard.ts'),
    'constructor(@Inject(Service.CONFIG) private readonly config: Config) {}',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/auth/jwt.strategy.ts'),
    'return jwtPayloadSchema.parse(payload);',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/auth/auth.module.ts'),
    'CommonModule',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'vitest.config.ts'),
    "include: ['src/**/*.test.ts']",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'vitest.config.ts'),
    "'@server': fileURLToPath(new URL('./src', import.meta.url))",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/test/health.test.ts'),
    'app.inject({',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/test/health.test.ts'),
    "service: 'starter-server'",
  );
  assert.equal(packageJson.scripts?.test, 'vitest run');

  assert.equal(fs.existsSync(path.join(projectRoot, 'src/main.tsx')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'vite.config.ts')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'jest.config.js')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/pages')), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/queue')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/push')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/cache')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/graphql')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/llm')),
    false,
  );
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/llm')), false);
});

test('prompts for the NestJS app name when one is not provided', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await helpers
    .run(nestjsAppGeneratorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withPrompts({ appName: 'Prompted Server' });

  const projectRoot = path.join(tmpDir, 'prompted-server');

  yoAssert.file([
    path.join(projectRoot, 'package.json'),
    path.join(projectRoot, 'src/server.ts'),
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, 'package.json'),
    '"name": "prompted-server"',
  );
});

test('fails when the NestJS target directory already exists and is not empty', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(nestjsAppGeneratorPath)
        .inTmpDir((directory) => {
          tmpDir = directory;
          const targetDirectory = path.join(directory, 'existing-server');

          fs.mkdirSync(targetDirectory, { recursive: true });
          fs.writeFileSync(path.join(targetDirectory, 'keep.txt'), 'existing');
        })
        .withArguments(['existing-server'])
        .run(),
    /already exists and is not empty/,
  );

  assert.equal(
    fs.existsSync(path.join(tmpDir, 'existing-server', 'keep.txt')),
    true,
  );
});
