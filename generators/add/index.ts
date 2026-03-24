import fs from 'node:fs';
import path from 'node:path';

import GeneratorBase from 'yeoman-generator';

import type { PackageJson } from '../lib/types';
import authFeature from './features/auth';
import bffFeature from './features/bff';
import reactQueryFeature from './features/react-query';
import reduxFeature from './features/redux';
import uiLibraryFeature from './features/ui-library';
import { REQUIRED_BASE_FILES, REQUIRED_BASE_SCRIPTS } from './lib/constants';
import {
  normalizeFeatureName,
  normalizeLineEndings,
  readAppDisplayName,
  readJson,
  renderTemplateFile,
  resolveTemplateAbsolutePath,
  toDisplayName,
} from './lib/helpers';
import { buildSharedScaffold } from './lib/shared-scaffold';
import type {
  FeatureDefinition,
  InstalledFeatures,
} from './lib/types';

interface AddGeneratorOptions extends GeneratorBase.GeneratorOptions {
  featureName?: string;
}

interface FeaturePromptAnswers extends GeneratorBase.Answers {
  featureName: string;
}

const FEATURES = [
  bffFeature,
  uiLibraryFeature,
  authFeature,
  reduxFeature,
  reactQueryFeature,
];
const FEATURE_BY_NAME = new Map(
  FEATURES.map((featureDefinition) => [
    featureDefinition.name,
    featureDefinition,
  ]),
);
const SUPPORTED_FEATURES = FEATURES.map(
  (featureDefinition) => featureDefinition.name,
);

function getFeatureLabel(featureName: string): string {
  return FEATURE_BY_NAME.get(featureName)?.label || `Feature "${featureName}"`;
}

export = class AddGenerator extends GeneratorBase {
  declare options: GeneratorBase['options'] & AddGeneratorOptions;

  featureName!: string;

  featureDefinition!: FeatureDefinition;

  projectRoot!: string;

  packageJsonPath!: string;

  envExamplePath!: string;

  rootPackageJson!: PackageJson;

  appName!: string;

  appDisplayName!: string;

  templateContext!: {
    appName: string;
    appDisplayName: string;
  };

  installedFeatures!: InstalledFeatures;

  constructor(args: string | string[], opts: AddGeneratorOptions) {
    super(args, opts);

    this.argument('featureName', {
      type: String,
      required: false,
      description: 'Feature name to add to an existing generated project.',
    });
  }

  async prompting(): Promise<void> {
    if (this.options.featureName) {
      return;
    }

    const answers = await this.prompt<FeaturePromptAnswers>([
      {
        type: 'list',
        name: 'featureName',
        message: 'Feature to add',
        choices: SUPPORTED_FEATURES,
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
    this.envExamplePath = this.destinationPath('.env.example');
    this.rootPackageJson = this._validateBaseApp();
    this.appName = String(
      this.rootPackageJson.name || path.basename(this.projectRoot) || 'app',
    );
    this.appDisplayName = readAppDisplayName(
      this.envExamplePath,
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
        `${featureLabel} can only be generated inside a t-generator base app. Missing package.json at the project root.`,
      );
    }

    let packageJson: PackageJson;

    try {
      packageJson = readJson<PackageJson>(this.packageJsonPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `${featureLabel} can only be generated inside a t-generator base app. Unable to read package.json: ${message}`,
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
        `${featureLabel} can only be generated inside a t-generator base app. ${details.join('; ')}.`,
      );
    }

    return packageJson;
  }

  _detectInstalledFeatures(): InstalledFeatures {
    return {
      auth: authFeature.isInstalled?.(this) ?? false,
      uiLibrary: uiLibraryFeature.isInstalled?.(this) ?? false,
      redux: reduxFeature.isInstalled?.(this) ?? false,
      reactQuery: reactQueryFeature.isInstalled?.(this) ?? false,
    };
  }

  _validateManagedFiles(
    featureLabel: string,
    managedFiles: {
      path: string;
      templatePath: string;
      templateSource: 'app' | 'add';
    }[],
    stateLabel: string,
  ): void {
    const missingManagedFiles = managedFiles
      .map(({ path: filePath }) => filePath)
      .filter((filePath) => !fs.existsSync(this.destinationPath(filePath)));

    if (missingManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because required scaffold files are missing: ${missingManagedFiles.join(', ')}.`,
      );
    }

    const modifiedManagedFiles = managedFiles
      .filter((templateDefinition) => {
        const destinationFilePath = this.destinationPath(
          templateDefinition.path,
        );
        const currentContent = normalizeLineEndings(
          fs.readFileSync(destinationFilePath, 'utf8'),
        );
        const expectedContent = normalizeLineEndings(
          renderTemplateFile(
            resolveTemplateAbsolutePath(templateDefinition),
            this.templateContext,
          ),
        );

        return currentContent !== expectedContent;
      })
      .map(({ path: filePath }) => filePath);

    if (modifiedManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because these managed files do not match the expected ${stateLabel} scaffold: ${modifiedManagedFiles.join(', ')}.`,
      );
    }
  }

  _validateSharedScaffold(
    featureLabel: string,
    features: InstalledFeatures,
  ): void {
    const expectedFiles = buildSharedScaffold(this.templateContext, features);
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

  _writeManagedFiles(
    templateDefinitions: {
      path: string;
      templatePath: string;
      templateSource: 'app' | 'add';
    }[],
  ): void {
    templateDefinitions.forEach((templateDefinition) => {
      this.fs.write(
        this.destinationPath(templateDefinition.path),
        renderTemplateFile(
          resolveTemplateAbsolutePath(templateDefinition),
          this.templateContext,
        ),
      );
    });
  }

  _writeSharedScaffold(features: InstalledFeatures): void {
    const scaffoldFiles = buildSharedScaffold(this.templateContext, features);

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
