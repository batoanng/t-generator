import fs from 'node:fs';

import {
  APOLLO_GUARD_DEPENDENCIES,
  APOLLO_MANAGED_PATHS,
  buildApolloManagedFiles,
} from '../lib/apollo-scaffold';
import { hasPackageDependency } from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const APOLLO_DEPENDENCIES = {
  '@apollo/client': '^4.0.7',
  graphql: '^16.11.0',
};

const apolloFeature: FeatureDefinition = {
  name: 'apollo',
  label: 'Apollo',
  isInstalled(generator) {
    return (
      APOLLO_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      APOLLO_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = APOLLO_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `Apollo generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = APOLLO_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `Apollo generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('Apollo', generator.installedFeatures);
  },
  write(generator) {
    generator._writeDependencies(APOLLO_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      apollo: true,
    });
    generator._writeManagedFiles(buildApolloManagedFiles(generator.installedFeatures));
  },
  end(generator) {
    generator.log('Apollo feature scaffolded in "./src/pages/apollo".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  Open /apollo');
  },
};

export = apolloFeature;
