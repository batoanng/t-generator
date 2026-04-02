import fs from 'node:fs';

import {
  buildGraphqlFeatureFiles,
  GRAPHQL_GUARD_DEPENDENCIES,
  GRAPHQL_MANAGED_PATHS,
} from '../lib/feature-scaffolds';
import { hasPackageDependency } from '../lib/helpers';
import type { ServerFeatureDefinition } from '../lib/types';

const GRAPHQL_DEPENDENCIES = {
  '@apollo/server': '^5.5.0',
  '@as-integrations/fastify': '^3.1.0',
  '@nestjs/apollo': '^13.2.4',
  '@nestjs/graphql': '^13.2.4',
  graphql: '^16.13.2',
};

const graphqlFeature: ServerFeatureDefinition = {
  name: 'graphql',
  label: 'GraphQL',
  isInstalled(generator) {
    return (
      GRAPHQL_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      GRAPHQL_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = GRAPHQL_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `GraphQL generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = GRAPHQL_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `GraphQL generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('GraphQL', generator.installedFeatures);
  },
  write(generator) {
    generator._writeDependencies(GRAPHQL_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      graphql: true,
    });
    generator._writeFiles(buildGraphqlFeatureFiles(generator.templateContext));
  },
  end(generator) {
    generator.log('GraphQL feature scaffolded in "./src/modules/graphql".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  Query /api/graphql');
  },
};

export = graphqlFeature;
