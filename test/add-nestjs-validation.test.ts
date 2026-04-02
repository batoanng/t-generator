import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  createYeomanTestHelpers,
  nestjsAddGeneratorPath,
  scaffoldNestApp,
} from './helpers';

test('fails when nestjs-add is run outside the generated NestJS base app', async () => {
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
    /can only be generated inside a t-generator NestJS base app/,
  );

  assert.equal(fs.readdirSync(tmpDir).length, 0);
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
