import fs from 'node:fs';

import { buildApolloManagedFiles } from '../lib/apollo-scaffold';
import { addManagedFile, hasPackageDependency } from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const AUTH_NEW_FILES = [
  addManagedFile(
    'src/app/providers/auth/Auth0ProviderWithNavigate.tsx',
    'auth/src/app/providers/auth/Auth0ProviderWithNavigate.tsx.ejs',
  ),
  addManagedFile('src/pages/auth/index.ts', 'auth/src/pages/auth/index.ts.ejs'),
  addManagedFile(
    'src/pages/auth/ui/AuthPage.tsx',
    'auth/src/pages/auth/ui/AuthPage.tsx.ejs',
  ),
  addManagedFile(
    'src/pages/auth/ui/AuthPage.test.tsx',
    'auth/src/pages/auth/ui/AuthPage.test.tsx.ejs',
  ),
];

const AUTH_DEPENDENCIES = {
  '@auth0/auth0-react': '^2.8.0',
};

const AUTH_MANAGED_DIRECTORIES = [
  'src/app/providers/auth',
  'src/pages/auth',
] as const;

const authFeature: FeatureDefinition = {
  name: 'auth',
  label: 'Auth',
  isInstalled(generator) {
    return (
      hasPackageDependency(generator.rootPackageJson, '@auth0/auth0-react') ||
      AUTH_MANAGED_DIRECTORIES.some((directoryPath) =>
        fs.existsSync(generator.destinationPath(directoryPath)),
      )
    );
  },
  validate(generator) {
    if (this.isInstalled?.(generator)) {
      throw new Error(
        'Auth generation aborted because package.json already defines "@auth0/auth0-react".',
      );
    }

    const existingAuthDirectories = AUTH_MANAGED_DIRECTORIES.filter(
      (directoryPath) =>
        fs.existsSync(generator.destinationPath(directoryPath)),
    );

    if (existingAuthDirectories.length > 0) {
      throw new Error(
        `Auth generation aborted because these managed paths already exist: ${existingAuthDirectories.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('Auth', generator.installedFeatures);

    if (generator.installedFeatures.apollo) {
      generator._validateManagedFiles(
        'Auth',
        buildApolloManagedFiles(generator.installedFeatures),
        'Apollo scaffold',
      );
    }
  },
  write(generator) {
    generator._writeDependencies(AUTH_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      auth: true,
    });
    generator._writeManagedFiles(AUTH_NEW_FILES);

    if (generator.installedFeatures.apollo) {
      generator._writeManagedFiles(
        buildApolloManagedFiles({
          ...generator.installedFeatures,
          auth: true,
        }),
      );
    }
  },
  end(generator) {
    generator.log('Auth feature scaffolded in "./src/pages/auth".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  Add Auth0 values to .env.local');
    generator.log('  npm run dev');
    generator.log('  Open /auth');
  },
};

export = authFeature;
