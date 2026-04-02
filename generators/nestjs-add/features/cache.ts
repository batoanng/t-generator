import fs from 'node:fs';

import {
  buildCacheFeatureFiles,
  CACHE_GUARD_DEPENDENCIES,
  CACHE_MANAGED_PATHS,
} from '../lib/feature-scaffolds';
import { hasPackageDependency } from '../lib/helpers';
import type { ServerFeatureDefinition } from '../lib/types';

const CACHE_DEPENDENCIES = {
  '@keyv/redis': '^5.1.6',
  '@nestjs/cache-manager': '^3.1.0',
  'cache-manager': '^7.2.8',
};

const cacheFeature: ServerFeatureDefinition = {
  name: 'cache',
  label: 'Cache',
  isInstalled(generator) {
    return (
      CACHE_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      CACHE_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = CACHE_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `Cache generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = CACHE_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `Cache generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('Cache', generator.installedFeatures);
  },
  write(generator) {
    generator._writeDependencies(CACHE_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      cache: true,
    });
    generator._writeFiles(buildCacheFeatureFiles());
  },
  end(generator) {
    generator.log('Cache feature scaffolded in "./src/modules/cache".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  POST /api/v1/cache/demo');
  },
};

export = cacheFeature;
