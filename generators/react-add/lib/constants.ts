import path from 'node:path';

export const APP_TEMPLATE_ROOT = path.join(
  __dirname,
  '../../react-app/templates',
);
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
