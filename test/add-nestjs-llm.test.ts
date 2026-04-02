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

test('adds the llm feature to an existing generated NestJS base app', async () => {
  const { projectRoot, runResult } = await scaffoldNestApp('starter-llm');

  await runResult
    .create(
      nestjsAddGeneratorPath,
      { cwd: projectRoot, tmpdir: false },
      undefined,
    )
    .withArguments(['llm'])
    .run();

  const packageJson = readJson<PackageJson>(
    path.join(projectRoot, 'package.json'),
  );
  const llmServicePath = path.join(projectRoot, 'src/modules/llm/llm.service.ts');

  assert.equal(packageJson.dependencies?.openai, '^6.33.0');
  assert.equal(packageJson.dependencies?.['@langchain/core'], undefined);
  assert.equal(packageJson.dependencies?.['@langchain/openai'], undefined);
  assert.equal(packageJson.dependencies?.['@langchain/deepseek'], undefined);

  yoAssert.file([
    path.join(projectRoot, 'src/modules/llm/index.ts'),
    path.join(projectRoot, 'src/modules/llm/llm.schemas.ts'),
    path.join(projectRoot, 'src/modules/llm/openai.provider.ts'),
    path.join(projectRoot, 'src/modules/llm/llm.controller.ts'),
    path.join(projectRoot, 'src/modules/llm/llm.module.ts'),
    llmServicePath,
  ]);

  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'OPENAI_API_KEY=sk-proj-...');
  yoAssert.fileContent(path.join(projectRoot, '.env.example'), 'OPENAI_MODEL=gpt-5');
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/app.module.ts'),
    'LlmFeatureModule',
  );
  yoAssert.fileContent(
    path.join(projectRoot, 'src/modules/llm/llm.controller.ts'),
    "@Controller('llm')",
  );
  yoAssert.fileContent(llmServicePath, 'this.openAi.chat.completions.create({');
  yoAssert.fileContent(
    llmServicePath,
    'Summarize the intent of the following prompt in one short paragraph.',
  );

  assert.equal(readFile(path.join(projectRoot, '.env.example')).includes('DEEPSEEK_'), false);
  assert.equal(readFile(llmServicePath).includes('DeepSeek'), false);
  assert.equal(readFile(llmServicePath).includes('embeddings'), false);
  assert.equal(readFile(llmServicePath).includes('vector'), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'src/llm')), false);
});
