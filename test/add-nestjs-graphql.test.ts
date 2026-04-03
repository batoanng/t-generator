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

test('adds the graphql feature to an existing generated NestJS base app', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('starter-graphql');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['graphql'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const resolverPath = path.join(
    projectRoot,
    'src/modules/graphql/graphql-demo.resolver.ts',
  );

  assert.equal(packageJson.dependencies?.['@apollo/server'], '^5.5.0');
  assert.equal(packageJson.dependencies?.['@as-integrations/fastify'], '^3.1.0');
  assert.equal(packageJson.dependencies?.['@nestjs/apollo'], '^13.2.4');
  assert.equal(packageJson.dependencies?.['@nestjs/graphql'], '^13.2.4');
  assert.equal(packageJson.dependencies?.graphql, '^16.13.2');

  yoAssert.file([
    path.join(projectRoot, 'src/modules/graphql/index.ts'),
    path.join(projectRoot, 'src/modules/graphql/graphql.module.ts'),
    path.join(projectRoot, 'src/modules/graphql/graphql-demo.type.ts'),
    resolverPath,
    path.join(
      projectRoot,
      'src/modules/graphql/security/current-graphql-user.decorator.ts',
    ),
    path.join(
      projectRoot,
      'src/modules/graphql/security/gql-optional-auth.guard.ts',
    ),
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'GraphQLModule.forRoot<ApolloDriverConfig>',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    "path: '/api/graphql'",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'GraphqlFeatureModule',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    "guestUserId: typeof headers['x-guest-user-id'] === 'string'",
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/server.ts'),
    "'x-guest-user-id'",
  );
  yoAssert.fileContent(
    path.join(
      projectRoot,
      'src/modules/graphql/security/gql-optional-auth.guard.ts',
    ),
    'handleRequest<TUser = { sub?: string } | null>(',
  );
  yoAssert.fileContent(
    path.join(
      projectRoot,
      'src/modules/graphql/security/gql-optional-auth.guard.ts',
    ),
    'return null as TUser;',
  );
  yoAssert.fileContent(resolverPath, "name: 'graphqlDemo'");
  yoAssert.fileContent(resolverPath, 'authenticated: Boolean(currentUser.user?.sub)');
  yoAssert.fileContent(resolverPath, 'service: "starter-graphql"');

  assert.equal(
    fs.existsSync(path.join(projectRoot, 'src/modules/graphql/graph.repository.ts')),
    false,
  );
  assert.equal(readFile(resolverPath).includes('atomsByArtifact'), false);
  assert.equal(readFile(resolverPath).includes('GraphRepository'), false);
});

test('prompt-based add can select the graphql feature for NestJS', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('prompted-graphql');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withPrompts({ featureName: 'graphql' })
    .run();

  yoAssert.file([
    path.join(projectRoot, 'src/modules/graphql/graphql.module.ts'),
    path.join(projectRoot, 'src/modules/graphql/graphql-demo.resolver.ts'),
  ]);
});
