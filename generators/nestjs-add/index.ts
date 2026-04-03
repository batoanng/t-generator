import fs from 'node:fs';
import path from 'node:path';

import GeneratorBase from 'yeoman-generator';

import type { PackageJson } from '../lib/types';
import type { InstalledServerFeatures } from '../nestjs-app/lib/types';
import { buildServerSharedScaffold } from '../nestjs-app/lib/shared-scaffold';
import cacheFeature from './features/cache';
import graphqlFeature from './features/graphql';
import llmFeature from './features/llm';
import queueFeature from './features/queue';
import {
  hasNestJsDependency,
  normalizeFeatureName,
  normalizeLineEndings,
  readJson,
  readServerDisplayName,
  toDisplayName,
} from './lib/helpers';
import type {
  ServerAddGeneratorContext,
  ServerFeatureDefinition,
} from './lib/types';

interface NestAddGeneratorOptions extends GeneratorBase.GeneratorOptions {
  featureName?: string;
}

interface FeaturePromptAnswers extends GeneratorBase.Answers {
  featureName: string;
}

const FEATURES = [graphqlFeature, queueFeature, cacheFeature, llmFeature];
const FEATURE_BY_NAME = new Map<string, ServerFeatureDefinition>(
  FEATURES.map((featureDefinition) => [
    featureDefinition.name,
    featureDefinition,
  ]),
);
const FEATURE_PROMPT_CHOICES = [
  {
    name: 'GraphQL (Apollo code-first)',
    value: 'graphql',
    hint: 'Adds GraphQL infra, /api/graphql, and a self-contained demo resolver.',
  },
  {
    name: 'Queue (BullMQ infra)',
    value: 'queue',
    hint: 'Adds Redis-backed BullMQ root config and a generic producer demo.',
  },
  {
    name: 'Cache (Redis-backed)',
    value: 'cache',
    hint: 'Adds shared Redis cache infrastructure and a generic cache demo module.',
  },
  {
    name: 'LLM (OpenAI demo)',
    value: 'llm',
    hint: 'Adds OpenAI client wiring and a minimal prompt-chain demo endpoint.',
  },
] as const;
const SUPPORTED_FEATURES = FEATURE_PROMPT_CHOICES.map(
  (choice) => choice.value,
);

function getFeatureLabel(featureName: string): string {
  return FEATURE_BY_NAME.get(featureName)?.label || `Feature "${featureName}"`;
}

export = class NestAddGenerator
  extends GeneratorBase
  implements ServerAddGeneratorContext
{
  declare options: GeneratorBase['options'] & NestAddGeneratorOptions;

  featureName!: string;

  featureDefinition!: ServerFeatureDefinition;

  projectRoot!: string;

  packageJsonPath!: string;

  rootPackageJson!: PackageJson;

  appName!: string;

  appDisplayName!: string;

  templateContext!: {
    appName: string;
    appDisplayName: string;
  };

  installedFeatures!: InstalledServerFeatures;

  constructor(args: string | string[], opts: NestAddGeneratorOptions) {
    super(args, opts);

    this.argument('featureName', {
      type: String,
      required: false,
      description: 'Server feature name to add to an existing generated project.',
    });
  }

  async prompting(): Promise<void> {
    if (this.options.featureName) {
      return;
    }

    const answers = await this.prompt<FeaturePromptAnswers>([
      {
        type: 'select',
        name: 'featureName',
        message: 'Server feature to add',
        choices: FEATURE_PROMPT_CHOICES,
      },
    ]);

    this.options.featureName = answers.featureName;
  }

  configuring(): void {
    this.featureName = normalizeFeatureName(this.options.featureName);
    const featureDefinition = FEATURE_BY_NAME.get(this.featureName);

    if (!featureDefinition) {
      throw new Error(
        `Unknown feature "${this.featureName}". Supported features: ${SUPPORTED_FEATURES.join(', ')}.`,
      );
    }

    this.featureDefinition = featureDefinition;
    this.projectRoot = this.destinationRoot();
    this.packageJsonPath = this.destinationPath('package.json');
    this.rootPackageJson = this._validateBaseApp();
    this.appName = String(
      this.rootPackageJson.name || path.basename(this.projectRoot) || 'server',
    );
    this.appDisplayName = readServerDisplayName(
      this.rootPackageJson,
      toDisplayName(this.appName),
    );
    this.templateContext = {
      appName: this.appName,
      appDisplayName: this.appDisplayName,
    };
    this.installedFeatures = this._detectInstalledFeatures();

    this.featureDefinition.validate(this);
  }

  _validateBaseApp(): PackageJson {
    const featureLabel = getFeatureLabel(this.featureName);

    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error(
        `${featureLabel} can only be generated inside a NestJS server project. Missing package.json at the project root.`,
      );
    }

    let packageJson: PackageJson;

    try {
      packageJson = readJson<PackageJson>(this.packageJsonPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `${featureLabel} can only be generated inside a NestJS server project. Unable to read package.json: ${message}`,
      );
    }

    if (!hasNestJsDependency(packageJson)) {
      throw new Error(
        `${featureLabel} can only be generated inside a NestJS server project. package.json must declare at least one @nestjs dependency.`,
      );
    }

    return packageJson;
  }

  _detectInstalledFeatures(): InstalledServerFeatures {
    return {
      graphql: graphqlFeature.isInstalled(this),
      queue: queueFeature.isInstalled(this),
      cache: cacheFeature.isInstalled(this),
      llm: llmFeature.isInstalled(this),
    };
  }

  _validateSharedScaffold(
    featureLabel: string,
    features: InstalledServerFeatures,
  ): void {
    const expectedFiles = buildServerSharedScaffold(this.templateContext, features);
    const modifiedManagedFiles = Object.entries(expectedFiles)
      .filter(([filePath, expectedContent]) => {
        const absolutePath = this.destinationPath(filePath);

        if (!fs.existsSync(absolutePath)) {
          return false;
        }

        const currentContent = normalizeLineEndings(
          fs.readFileSync(absolutePath, 'utf8'),
        );

        return currentContent !== normalizeLineEndings(expectedContent);
      })
      .map(([filePath]) => filePath);

    if (modifiedManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because these managed files do not match the expected scaffold: ${modifiedManagedFiles.join(', ')}.`,
      );
    }
  }

  _writePackageCollection(
    fieldName: 'dependencies' | 'devDependencies',
    dependencyMap: Record<string, string>,
  ): void {
    const packageCollection = { ...(this.rootPackageJson[fieldName] || {}) };

    Object.entries(dependencyMap).forEach(([name, version]) => {
      if (typeof packageCollection[name] !== 'string') {
        packageCollection[name] = version;
      }
    });

    const updatedPackageJson = {
      ...this.rootPackageJson,
      [fieldName]: packageCollection,
    };

    this.rootPackageJson = updatedPackageJson;
    this.fs.write(
      this.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );
  }

  _writeDependencies(dependencyMap: Record<string, string>): void {
    this._writePackageCollection('dependencies', dependencyMap);
  }

  _writeDevDependencies(dependencyMap: Record<string, string>): void {
    this._writePackageCollection('devDependencies', dependencyMap);
  }

  _writeFiles(files: Record<string, string>): void {
    Object.entries(files).forEach(([filePath, contents]) => {
      this.fs.write(this.destinationPath(filePath), contents);
    });
  }

  _writeSharedScaffold(features: InstalledServerFeatures): void {
    const scaffoldFiles = buildServerSharedScaffold(this.templateContext, features);

    Object.entries(scaffoldFiles).forEach(([filePath, contents]) => {
      this.fs.write(this.destinationPath(filePath), contents);
    });
  }

  writing(): void {
    this.featureDefinition.write(this);
  }

  end(): void {
    this.log('');
    this.featureDefinition.end(this);
  }
};
