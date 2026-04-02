import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  addGeneratorPath,
  reactAddGeneratorPath,
  scaffoldBaseApp,
  scaffoldReactApp,
  snapshotDirectory,
} from './helpers';

test('react-app matches the legacy app generator output byte-for-byte', async () => {
  const legacy = await scaffoldBaseApp('matching-react-app');
  const legacySnapshot = snapshotDirectory(legacy.projectRoot);
  const explicit = await scaffoldReactApp('matching-react-app');
  const explicitSnapshot = snapshotDirectory(explicit.projectRoot);

  assert.deepEqual(legacySnapshot, explicitSnapshot);
});

test('react-add matches the legacy add generator output byte-for-byte', async () => {
  const legacy = await scaffoldReactApp('matching-react-add');
  await legacy.runResult
    .create(addGeneratorPath, { cwd: legacy.projectRoot, tmpdir: false }, undefined)
    .withArguments(['pwa'])
    .run();
  const legacySnapshot = snapshotDirectory(legacy.projectRoot);

  const explicit = await scaffoldReactApp('matching-react-add');
  await explicit.runResult
    .create(
      reactAddGeneratorPath,
      { cwd: explicit.projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['pwa'])
    .run();
  const explicitSnapshot = snapshotDirectory(explicit.projectRoot);

  assert.deepEqual(legacySnapshot, explicitSnapshot);
});

test('react generators remain isolated from the NestJS server scaffold', async () => {
  const { projectRoot } = await scaffoldReactApp('react-only-app');

  assert.equal(fs.existsSync(path.join(projectRoot, 'src/server.ts')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'prisma/schema.prisma')), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/app.module.ts')),
    false,
  );
});
