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

test('adds the queue feature to an existing generated NestJS base app', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('starter-queue');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['queue'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const queueServicePath = path.join(
    projectRoot,
    'src/modules/queue/queue.service.ts',
  );

  assert.equal(packageJson.dependencies?.['@nestjs/bullmq'], '^11.0.4');
  assert.equal(packageJson.dependencies?.bullmq, '^5.72.1');

  yoAssert.file([
    path.join(projectRoot, 'src/modules/queue/index.ts'),
    path.join(projectRoot, 'src/modules/queue/queue.constants.ts'),
    path.join(projectRoot, 'src/modules/queue/queue.schemas.ts'),
    path.join(projectRoot, 'src/modules/queue/queue.controller.ts'),
    path.join(projectRoot, 'src/modules/queue/queue.module.ts'),
    queueServicePath,
  ]);

  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'REDIS_HOST=localhost');
  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'REDIS_PORT=6379');
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'BullModule.forRoot({',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'QueueFeatureModule',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/queue/queue.constants.ts'),
    "export const DEMO_QUEUE_NAME = 'demo-queue';",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/queue/queue.controller.ts'),
    "@Controller('queue')",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/queue/queue.controller.ts'),
    'QueueDemoRequestSchema.parse(body)',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/queue/queue.module.ts'),
    'BullModule.registerQueue({',
  );
  yoAssert.fileContent(queueServicePath, 'this.demoQueue.add(DEMO_JOB_NAME, {');

  assert.equal(readFile(queueServicePath).includes('crawler'), false);
  assert.equal(readFile(queueServicePath).includes('document-extract'), false);
  assert.equal(readFile(queueServicePath).includes('CRAWL_'), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/queue/processors')),
    false,
  );
});
