import { addManagedFile } from './helpers';
import type { InstalledFeatures } from './types';

function resolveApolloProviderTemplate(
  features: Pick<InstalledFeatures, 'auth'>,
): string {
  return features.auth
    ? 'apollo/src/shared/apollo/ApolloWithAuthProvider.auth.tsx.ejs'
    : 'apollo/src/shared/apollo/ApolloWithAuthProvider.tsx.ejs';
}

export function buildApolloManagedFiles(
  features: Pick<InstalledFeatures, 'auth'>,
) {
  return [
    addManagedFile(
      'src/shared/apollo/ApolloWithAuthProvider.tsx',
      resolveApolloProviderTemplate(features),
    ),
    addManagedFile(
      'src/shared/apollo/index.ts',
      'apollo/src/shared/apollo/index.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/index.ts',
      'apollo/src/features/apollo-demo/index.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/api/index.ts',
      'apollo/src/features/apollo-demo/api/index.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/api/useApolloDemoRootTypeQuery.ts',
      'apollo/src/features/apollo-demo/api/useApolloDemoRootTypeQuery.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/model/index.ts',
      'apollo/src/features/apollo-demo/model/index.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/model/queries.ts',
      'apollo/src/features/apollo-demo/model/queries.ts.ejs',
    ),
    addManagedFile(
      'src/features/apollo-demo/model/types.ts',
      'apollo/src/features/apollo-demo/model/types.ts.ejs',
    ),
    addManagedFile(
      'src/pages/apollo/index.ts',
      'apollo/src/pages/apollo/index.ts.ejs',
    ),
    addManagedFile(
      'src/pages/apollo/ui/ApolloPage.tsx',
      'apollo/src/pages/apollo/ui/ApolloPage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/apollo/ui/ApolloPage.test.tsx',
      'apollo/src/pages/apollo/ui/ApolloPage.test.tsx.ejs',
    ),
  ];
}

export const APOLLO_GUARD_DEPENDENCIES = [
  '@apollo/client',
  'graphql',
] as const;

export const APOLLO_MANAGED_PATHS = [
  'src/shared/apollo',
  'src/features/apollo-demo',
  'src/pages/apollo',
] as const;
