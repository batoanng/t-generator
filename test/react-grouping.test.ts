import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { scaffoldReactApp } from './helpers';

test('react generators remain isolated from the NestJS server scaffold', async () => {
  const { projectRoot } = await scaffoldReactApp('react-only-app');

  assert.equal(fs.existsSync(path.join(projectRoot, 'src/server.ts')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'prisma/schema.prisma')), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/app.module.ts')),
    false,
  );
});
