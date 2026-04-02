import fs from 'node:fs';

import {
  buildLlmFeatureFiles,
  LLM_GUARD_DEPENDENCIES,
  LLM_MANAGED_PATHS,
} from '../lib/feature-scaffolds';
import { hasPackageDependency } from '../lib/helpers';
import type { ServerFeatureDefinition } from '../lib/types';

const LLM_DEPENDENCIES = {
  openai: '^6.33.0',
};

const llmFeature: ServerFeatureDefinition = {
  name: 'llm',
  label: 'LLM',
  isInstalled(generator) {
    return (
      LLM_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      LLM_MANAGED_PATHS.some((managedPath) =>
        fs.existsSync(generator.destinationPath(managedPath)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = LLM_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `LLM generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = LLM_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `LLM generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('LLM', generator.installedFeatures);
  },
  write(generator) {
    generator._writeDependencies(LLM_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      llm: true,
    });
    generator._writeFiles(buildLlmFeatureFiles());
  },
  end(generator) {
    generator.log('LLM feature scaffolded in "./src/modules/llm".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  POST /api/v1/llm/demo');
  },
};

export = llmFeature;
