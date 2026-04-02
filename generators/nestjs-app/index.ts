import fs from 'node:fs';
import path from 'node:path';

import GeneratorBase from 'yeoman-generator';

import type { TemplateContext } from '../lib/types';
import { buildServerSharedScaffold } from './lib/shared-scaffold';

interface NestAppGeneratorOptions extends GeneratorBase.GeneratorOptions {
  appName?: string;
}

interface AppPromptAnswers extends GeneratorBase.Answers {
  appName: string;
}

function normalizeAppName(input: unknown): string {
  const normalizedInput = typeof input === 'string' ? input : '';

  return normalizedInput
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDisplayName(input: unknown, fallback: string): string {
  const trimmed = (typeof input === 'string' ? input : '').trim();

  if (trimmed) {
    return trimmed;
  }

  return fallback
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export = class NestAppGenerator extends GeneratorBase {
  declare options: GeneratorBase['options'] & NestAppGeneratorOptions;

  private rawAppName?: string;

  private appName!: string;

  private displayName!: string;

  constructor(args: string | string[], opts: NestAppGeneratorOptions) {
    super(args, opts);
    this.sourceRoot(path.join(__dirname, 'templates'));

    this.argument('appName', {
      type: String,
      required: false,
      description: 'Name of the NestJS application directory to generate.',
    });

    this.rawAppName = this.options.appName;
  }

  async prompting(): Promise<void> {
    if (this.options.appName) {
      return;
    }

    const answers = await this.prompt<AppPromptAnswers>([
      {
        type: 'input',
        name: 'appName',
        message: 'NestJS application name',
        default: 'my-server',
        validate: (value) => {
          if (!normalizeAppName(value)) {
            return 'Enter a valid application name.';
          }

          return true;
        },
      },
    ]);

    this.rawAppName = answers.appName;
    this.options.appName = answers.appName;
  }

  configuring(): void {
    const providedName = this.rawAppName || this.options.appName;
    const normalizedAppName = normalizeAppName(providedName);

    if (!normalizedAppName) {
      throw new Error('A valid application name is required.');
    }

    const projectRoot = path.resolve(this.destinationRoot(), normalizedAppName);

    if (fs.existsSync(projectRoot) && fs.readdirSync(projectRoot).length > 0) {
      throw new Error(
        `Target directory "${normalizedAppName}" already exists and is not empty.`,
      );
    }

    this.appName = normalizedAppName;
    this.displayName = toDisplayName(providedName, normalizedAppName);
    this.destinationRoot(projectRoot);
  }

  writing(): void {
    const templateContext: TemplateContext = {
      appName: this.appName,
      appDisplayName: this.displayName,
    };

    const templateFiles = [
      ['tsconfig.json.ejs', 'tsconfig.json'],
      ['tsconfig.eslint.json.ejs', 'tsconfig.eslint.json'],
      ['vitest.config.ts.ejs', 'vitest.config.ts'],
      ['nodemon.json.ejs', 'nodemon.json'],
      ['index.js.ejs', 'index.js'],
      ['_eslintrc.cjs.ejs', '.eslintrc.cjs'],
      ['prettier.config.js.ejs', 'prettier.config.js'],
      ['_gitignore.ejs', '.gitignore'],
      ['prisma/schema.prisma.ejs', 'prisma/schema.prisma'],
      ['src/server.ts.ejs', 'src/server.ts'],
      ['src/modules/common/common.module.ts.ejs', 'src/modules/common/common.module.ts'],
      ['src/modules/common/index.ts.ejs', 'src/modules/common/index.ts'],
      ['src/modules/common/controller/index.ts.ejs', 'src/modules/common/controller/index.ts'],
      ['src/modules/common/controller/health.controller.ts.ejs', 'src/modules/common/controller/health.controller.ts'],
      ['src/modules/common/flow/index.ts.ejs', 'src/modules/common/flow/index.ts'],
      ['src/modules/common/flow/log.interceptor.ts.ejs', 'src/modules/common/flow/log.interceptor.ts'],
      ['src/modules/common/provider/index.ts.ejs', 'src/modules/common/provider/index.ts'],
      ['src/modules/common/provider/prisma.provider.ts.ejs', 'src/modules/common/provider/prisma.provider.ts'],
      ['src/modules/common/security/index.ts.ejs', 'src/modules/common/security/index.ts'],
      ['src/modules/common/security/health.guard.ts.ejs', 'src/modules/common/security/health.guard.ts'],
      ['src/modules/auth/auth.module.ts.ejs', 'src/modules/auth/auth.module.ts'],
      ['src/modules/auth/jwt.strategy.ts.ejs', 'src/modules/auth/jwt.strategy.ts'],
      ['src/test/health.test.ts.ejs', 'src/test/health.test.ts'],
      ['src/modules/tokens.ts.ejs', 'src/modules/tokens.ts'],
    ] as const;

    templateFiles.forEach(([from, to]) => {
      this.fs.copyTpl(
        this.templatePath(from),
        this.destinationPath(to),
        templateContext,
      );
    });

    const sharedScaffold = buildServerSharedScaffold(templateContext, {
      graphql: false,
      queue: false,
      webPush: false,
      llm: false,
    });

    Object.entries(sharedScaffold).forEach(([filePath, contents]) => {
      this.fs.write(this.destinationPath(filePath), contents);
    });
  }

  end(): void {
    this.log('');
    this.log(`NestJS base scaffolded in ./${this.appName}`);
    this.log('Next steps:');
    this.log(`  cd ${this.appName}`);
    this.log('  npm install');
    this.log('  npm run dev');
  }
};
