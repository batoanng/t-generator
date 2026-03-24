import path from 'node:path';

export const APP_TEMPLATE_ROOT = path.join(__dirname, '../../app/templates');
export const ADD_TEMPLATE_ROOT = path.join(__dirname, '../templates');
export const REQUIRED_BASE_SCRIPTS = [
  'dev',
  'build',
  'preview',
  'lint',
  'test',
];
export const REQUIRED_BASE_FILES = [
  'src/app/entrypoint/App.tsx',
  'src/app/providers/AppProviders.tsx',
  'src/app/routes/AppRouter.tsx',
  'src/shared/config/env.ts',
];
export const FEATURE_STATES = {
  base: 'base',
  auth: 'auth',
  uiLibrary: 'ui-library',
  uiLibraryAuth: 'ui-library-auth',
  redux: 'redux',
  authRedux: 'auth-redux',
  uiLibraryRedux: 'ui-library-redux',
  uiLibraryAuthRedux: 'ui-library-auth-redux',
} as const;

export type FeatureState = (typeof FEATURE_STATES)[keyof typeof FEATURE_STATES];
