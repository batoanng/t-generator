import fs from 'node:fs';

import {
  buildPwaManagedFiles,
  PWA_BASE_MANAGED_FILES,
  PWA_GUARD_DEPENDENCIES,
  PWA_MANAGED_PATHS,
} from '../lib/pwa-scaffold';
import { hasPackageDependency } from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const PWA_DEV_DEPENDENCIES = {
  'vite-plugin-pwa': '^1.0.3',
};

const pwaFeature: FeatureDefinition = {
  name: 'pwa',
  label: 'PWA',
  isInstalled(generator) {
    return (
      PWA_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      PWA_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = PWA_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `PWA generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = PWA_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `PWA generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('PWA', generator.installedFeatures);
    generator._validateManagedFiles(
      'PWA',
      PWA_BASE_MANAGED_FILES,
      'base app shell scaffold',
    );
  },
  write(generator) {
    generator._writeDevDependencies(PWA_DEV_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      pwa: true,
    });
    generator._writeManagedFiles(buildPwaManagedFiles());
  },
  end(generator) {
    generator.log('PWA feature scaffolded in "./src/pages/pwa".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  Open /pwa');
  },
};

export = pwaFeature;
