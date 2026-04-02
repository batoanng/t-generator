import fs from 'node:fs';

import {
  buildQueueFeatureFiles,
  QUEUE_GUARD_DEPENDENCIES,
  QUEUE_MANAGED_PATHS,
} from '../lib/feature-scaffolds';
import { hasPackageDependency } from '../lib/helpers';
import type { ServerFeatureDefinition } from '../lib/types';

const QUEUE_DEPENDENCIES = {
  '@nestjs/bullmq': '^11.0.4',
  bullmq: '^5.72.1',
};

const queueFeature: ServerFeatureDefinition = {
  name: 'queue',
  label: 'Queue',
  isInstalled(generator) {
    return (
      QUEUE_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      QUEUE_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = QUEUE_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `Queue generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = QUEUE_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `Queue generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('Queue', generator.installedFeatures);
  },
  write(generator) {
    generator._writeDependencies(QUEUE_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      queue: true,
    });
    generator._writeFiles(buildQueueFeatureFiles());
  },
  end(generator) {
    generator.log('Queue feature scaffolded in "./src/modules/queue".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  POST /api/v1/queue/demo');
  },
};

export = queueFeature;
