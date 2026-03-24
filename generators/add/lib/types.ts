import type {
  ManagedFile,
  PackageJson,
  TemplateContext,
} from '../../lib/types';

export interface InstalledFeatures {
  auth: boolean;
  uiLibrary: boolean;
  redux: boolean;
  reactQuery: boolean;
}

export interface AddGeneratorContext {
  featureName: string;
  projectRoot: string;
  packageJsonPath: string;
  envExamplePath: string;
  rootPackageJson: PackageJson;
  appName: string;
  appDisplayName: string;
  templateContext: TemplateContext;
  installedFeatures: InstalledFeatures;
  fs: {
    copyTpl(from: string, to: string, context: Record<string, string>): void;
    write(filePath: string, contents: string): void;
  };
  destinationRoot(rootPath?: string): string;
  destinationPath(...paths: string[]): string;
  templatePath(...paths: string[]): string;
  log(message?: string): void;
  _validateManagedFiles(
    featureLabel: string,
    managedFiles: ManagedFile[],
    stateLabel: string,
  ): void;
  _validateSharedScaffold(
    featureLabel: string,
    features: InstalledFeatures,
  ): void;
  _writeDependencies(dependencyMap: Record<string, string>): void;
  _writeDevDependencies(dependencyMap: Record<string, string>): void;
  _writeManagedFiles(templateDefinitions: ManagedFile[]): void;
  _writeSharedScaffold(features: InstalledFeatures): void;
}

export interface FeatureDefinition {
  name: string;
  label: string;
  isInstalled?(generator: AddGeneratorContext): boolean;
  validate(generator: AddGeneratorContext): void;
  write(generator: AddGeneratorContext): void;
  end(generator: AddGeneratorContext): void;
}
