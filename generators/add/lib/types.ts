import type {
  ManagedFile,
  PackageJson,
  TemplateContext,
} from '../../lib/types';
import type { FeatureState } from './constants';

export interface AddGeneratorContext {
  featureName: string;
  projectRoot: string;
  packageJsonPath: string;
  envExamplePath: string;
  rootPackageJson: PackageJson;
  appName: string;
  appDisplayName: string;
  templateContext: TemplateContext;
  projectState: FeatureState;
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
  _writeDependencies(dependencyMap: Record<string, string>): void;
  _writeDevDependencies(dependencyMap: Record<string, string>): void;
  _writeManagedFiles(templateDefinitions: ManagedFile[]): void;
}

export interface FeatureDefinition {
  name: string;
  label: string;
  isInstalled?(generator: AddGeneratorContext): boolean;
  validate(generator: AddGeneratorContext): void;
  write(generator: AddGeneratorContext): void;
  end(generator: AddGeneratorContext): void;
}
