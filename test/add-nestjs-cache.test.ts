import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import yoAssert from 'yeoman-assert';

import type { PackageJson } from '../generators/lib/types';
import {
  nestjsAddGeneratorPath,
  readJson,
  scaffoldNestApp,
} from './helpers';

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function countOccurrences(contents: string, token: string): number {
  return contents.split(token).length - 1;
}

test('adds the cache feature to an existing generated NestJS base app', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('starter-cache');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['cache'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const cacheServicePath = path.join(
    projectRoot,
    'src/modules/cache/cache.service.ts',
  );

  assert.equal(packageJson.dependencies?.['@keyv/redis'], '^5.1.6');
  assert.equal(packageJson.dependencies?.['@nestjs/cache-manager'], '^3.1.0');
  assert.equal(packageJson.dependencies?.['cache-manager'], '^7.2.8');
  assert.equal(packageJson.dependencies?.['web-push'], undefined);

  yoAssert.file([
    path.join(projectRoot, 'src/modules/cache/index.ts'),
    path.join(projectRoot, 'src/modules/cache/cache.schemas.ts'),
    path.join(projectRoot, 'src/modules/cache/cache.controller.ts'),
    path.join(projectRoot, 'src/modules/cache/cache.module.ts'),
    cacheServicePath,
  ]);

  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'REDIS_HOST=localhost');
  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'REDIS_PORT=6379');
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'CacheModule.registerAsync({',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'CacheFeatureModule',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/cache/cache.controller.ts'),
    "@Controller('cache')",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/cache/cache.controller.ts'),
    "@Post('demo')",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/cache/cache.controller.ts'),
    "@Get('demo/:key')",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/cache/cache.schemas.ts'),
    'ttlMs: z.coerce.number().int().positive().max(86_400_000).optional(),',
  );
  yoAssert.fileContent(cacheServicePath, 'const ttlMs = request.ttlMs ?? 60_000;');
  yoAssert.fileContent(
    cacheServicePath,
    'value: (await this.cacheManager.get<string>(key)) ?? null,',
  );

  assert.equal(readFile(cacheServicePath).includes('webPush'), false);
  assert.equal(readFile(cacheServicePath).includes('VAPID'), false);
  assert.equal(readFile(cacheServicePath).includes('@prisma/client'), false);
});

test('queue and cache compose without duplicating shared Redis env wiring', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('queue-cache-compose');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['queue'])
    .run();

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['cache'])
    .run();

  const envExample = readFile(path.join(projectRoot, '.env.example'));
  const appModule = readFile(path.join(projectRoot, 'src/modules/app.module.ts'));

  assert.equal(countOccurrences(envExample, 'REDIS_HOST='), 1);
  assert.equal(countOccurrences(envExample, 'REDIS_PORT='), 1);
  assert.equal(appModule.includes('BullModule.forRoot({'), true);
  assert.equal(appModule.includes('CacheModule.registerAsync({'), true);
  assert.equal(appModule.includes('QueueFeatureModule'), true);
  assert.equal(appModule.includes('CacheFeatureModule'), true);
});
