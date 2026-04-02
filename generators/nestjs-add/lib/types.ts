import type { PackageJson, TemplateContext } from '../../lib/types';
import type { InstalledServerFeatures } from '../../nestjs-app/lib/types';

export interface ServerAddGeneratorContext {
  featureName: string;
  projectRoot: string;
  packageJsonPath: string;
  rootPackageJson: PackageJson;
  appName: string;
  appDisplayName: string;
  templateContext: TemplateContext;
  installedFeatures: InstalledServerFeatures;
  fs: {
    write(filePath: string, contents: string): void;
  };
  destinationRoot(rootPath?: string): string;
  destinationPath(...paths: string[]): string;
  log(message?: string): void;
  _validateSharedScaffold(
    featureLabel: string,
    features: InstalledServerFeatures,
  ): void;
  _writeDependencies(dependencyMap: Record<string, string>): void;
  _writeDevDependencies(dependencyMap: Record<string, string>): void;
  _writeFiles(files: Record<string, string>): void;
  _writeSharedScaffold(features: InstalledServerFeatures): void;
}

export interface ServerFeatureDefinition {
  name: keyof InstalledServerFeatures;
  label: string;
  isInstalled(generator: ServerAddGeneratorContext): boolean;
  validate(generator: ServerAddGeneratorContext): void;
  write(generator: ServerAddGeneratorContext): void;
  end(generator: ServerAddGeneratorContext): void;
}
