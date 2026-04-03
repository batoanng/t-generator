import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  createYeomanTestHelpers,
  nestjsAddGeneratorPath,
  scaffoldNestApp,
} from './helpers';

test('fails when nestjs-add is run outside a NestJS server project', async () => {
  let tmpDir = '';
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(nestjsAddGeneratorPath)
        .inTmpDir((directory) => {
          tmpDir = directory;
        })
        .withArguments(['graphql'])
        .run(),
    /can only be generated inside a NestJS server project/,
  );

  assert.equal(fs.readdirSync(tmpDir).length, 0);
});

test('fails when package.json does not declare NestJS dependencies', async () => {
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(nestjsAddGeneratorPath)
        .inTmpDir((directory) => {
          fs.writeFileSync(
            path.join(directory, 'package.json'),
            `${JSON.stringify(
              {
                name: 'not-a-nest-server',
                dependencies: {
                  react: '^19.2.0',
                },
              },
              null,
              2,
            )}\n`,
          );
        })
        .withArguments(['graphql'])
        .run(),
    /package\.json must declare at least one @nestjs dependency/,
  );
});

test('recreates missing shared NestJS scaffold files before adding a feature', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('restored-server');
  const envExamplePath = path.join(projectRoot, '.env.example');

  fs.rmSync(envExamplePath);

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['queue'])
    .run();

  assert.equal(fs.existsSync(envExamplePath), true);
  assert.match(fs.readFileSync(envExamplePath, 'utf8'), /REDIS_HOST=/);
});

test('fails when shared NestJS scaffold files have drifted before adding a feature', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('drifted-server');
  const appModulePath = path.join(projectRoot, 'src/modules/app.module.ts');

  fs.writeFileSync(appModulePath, `${fs.readFileSync(appModulePath, 'utf8')}\n// drift`);

  await assert.rejects(
    async () =>
      runResult
        .create(
          nestjsAddGeneratorPath,
          { cwd: projectRoot, tmpdir: false },
          undefined,
        )
        .withArguments(['queue'])
        .run(),
    /managed files do not match the expected scaffold/,
  );
});
