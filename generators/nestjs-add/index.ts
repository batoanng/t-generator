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
import { REQUIRED_BASE_FILES, REQUIRED_BASE_SCRIPTS } from './lib/constants';
import {
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
        `${featureLabel} can only be generated inside a t-generator NestJS base app. Missing package.json at the project root.`,
      );
    }

    let packageJson: PackageJson;

    try {
      packageJson = readJson<PackageJson>(this.packageJsonPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `${featureLabel} can only be generated inside a t-generator NestJS base app. Unable to read package.json: ${message}`,
      );
    }

    const missingScripts = REQUIRED_BASE_SCRIPTS.filter(
      (scriptName) => typeof packageJson.scripts?.[scriptName] !== 'string',
    );
    const missingFiles = REQUIRED_BASE_FILES.filter(
      (relativePath) => !fs.existsSync(this.destinationPath(relativePath)),
    );

    if (missingScripts.length > 0 || missingFiles.length > 0) {
      const details: string[] = [];

      if (missingScripts.length > 0) {
        details.push(`missing scripts: ${missingScripts.join(', ')}`);
      }

      if (missingFiles.length > 0) {
        details.push(`missing files: ${missingFiles.join(', ')}`);
      }

      throw new Error(
        `${featureLabel} can only be generated inside a t-generator NestJS base app. ${details.join('; ')}.`,
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
    const missingManagedFiles = Object.keys(expectedFiles).filter(
      (filePath) => !fs.existsSync(this.destinationPath(filePath)),
    );

    if (missingManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because required scaffold files are missing: ${missingManagedFiles.join(', ')}.`,
      );
    }

    const modifiedManagedFiles = Object.entries(expectedFiles)
      .filter(([filePath, expectedContent]) => {
        const currentContent = normalizeLineEndings(
          fs.readFileSync(this.destinationPath(filePath), 'utf8'),
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
