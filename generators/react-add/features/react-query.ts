import fs from 'node:fs';

import { addManagedFile, appManagedFile, hasPackageDependency } from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const REACT_QUERY_NEW_FILES = [
  addManagedFile(
    'src/shared/api/createApiClient.ts',
    'react-query/src/shared/api/createApiClient.ts.ejs',
  ),
  addManagedFile(
    'src/shared/api/createQueryClient.ts',
    'react-query/src/shared/api/createQueryClient.ts.ejs',
  ),
  addManagedFile(
    'src/shared/api/useApiMutation.ts',
    'react-query/src/shared/api/useApiMutation.ts.ejs',
  ),
  addManagedFile(
    'src/shared/api/useApiQuery.ts',
    'react-query/src/shared/api/useApiQuery.ts.ejs',
  ),
  addManagedFile(
    'src/shared/api/index.ts',
    'react-query/src/shared/api/index.ts.ejs',
  ),
  addManagedFile(
    'src/shared/lib/decryptData.ts',
    'react-query/src/shared/lib/decryptData.ts.ejs',
  ),
  addManagedFile(
    'src/shared/lib/index.ts',
    'react-query/src/shared/lib/index.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/index.ts',
    'react-query/src/features/react-query-demo/index.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/api/index.ts',
    'react-query/src/features/react-query-demo/api/index.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/api/useCallChatMutation.ts',
    'react-query/src/features/react-query-demo/api/useCallChatMutation.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/api/useGetChatMessages.ts',
    'react-query/src/features/react-query-demo/api/useGetChatMessages.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/model/index.ts',
    'react-query/src/features/react-query-demo/model/index.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/model/CacheKeys.ts',
    'react-query/src/features/react-query-demo/model/CacheKeys.ts.ejs',
  ),
  addManagedFile(
    'src/features/react-query-demo/model/types.ts',
    'react-query/src/features/react-query-demo/model/types.ts.ejs',
  ),
  addManagedFile(
    'src/pages/react-query/index.ts',
    'react-query/src/pages/react-query/index.ts.ejs',
  ),
  addManagedFile(
    'src/pages/react-query/ui/ReactQueryPage.tsx',
    'react-query/src/pages/react-query/ui/ReactQueryPage.tsx.ejs',
  ),
  addManagedFile(
    'src/pages/react-query/ui/ReactQueryPage.test.tsx',
    'react-query/src/pages/react-query/ui/ReactQueryPage.test.tsx.ejs',
  ),
];

const REACT_QUERY_MANAGED_FILES = [
  appManagedFile('src/shared/api/index.ts', 'src/shared/api/index.ts.ejs'),
  appManagedFile('src/shared/lib/index.ts', 'src/shared/lib/index.ts.ejs'),
];

const REACT_QUERY_DEPENDENCIES = {
  '@tanstack/react-query': '^5.64.2',
  '@tanstack/react-query-devtools': '5.64.2',
  axios: '1.9.0',
};

const REACT_QUERY_MANAGED_PATHS = [
  'src/shared/api/createApiClient.ts',
  'src/shared/api/createQueryClient.ts',
  'src/shared/api/useApiMutation.ts',
  'src/shared/api/useApiQuery.ts',
  'src/shared/lib/decryptData.ts',
  'src/features/react-query-demo',
  'src/pages/react-query',
] as const;

const REACT_QUERY_GUARD_DEPENDENCIES = [
  '@tanstack/react-query',
  '@tanstack/react-query-devtools',
  'axios',
] as const;

const reactQueryFeature: FeatureDefinition = {
  name: 'react-query',
  label: 'React Query',
  isInstalled(generator) {
    return (
      REACT_QUERY_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      REACT_QUERY_MANAGED_PATHS.some((path) =>
        fs.existsSync(generator.destinationPath(path)),
      )
    );
  },
  validate(generator) {
    const existingDependencies = REACT_QUERY_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingDependencies.length > 0) {
      throw new Error(
        `React Query generation aborted because package.json already defines: ${existingDependencies.join(', ')}.`,
      );
    }

    const existingPaths = REACT_QUERY_MANAGED_PATHS.filter((managedPath) =>
      fs.existsSync(generator.destinationPath(managedPath)),
    );

    if (existingPaths.length > 0) {
      throw new Error(
        `React Query generation aborted because these managed paths already exist: ${existingPaths.join(', ')}.`,
      );
    }

    generator._validateSharedScaffold('React Query', generator.installedFeatures);
    generator._validateManagedFiles(
      'React Query',
      REACT_QUERY_MANAGED_FILES,
      'base shared API scaffold',
    );
  },
  write(generator) {
    generator._writeDependencies(REACT_QUERY_DEPENDENCIES);
    generator._writeSharedScaffold({
      ...generator.installedFeatures,
      reactQuery: true,
    });
    generator._writeManagedFiles(REACT_QUERY_NEW_FILES);
  },
  end(generator) {
    generator.log('React Query feature scaffolded in "./src/pages/react-query".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  Open /react-query');
  },
};

export = reactQueryFeature;
