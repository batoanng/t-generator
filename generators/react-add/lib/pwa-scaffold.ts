import { addManagedFile, appManagedFile } from './helpers';

export function buildPwaManagedFiles() {
  return [
    addManagedFile('vite.config.ts', 'pwa/vite.config.ts.ejs'),
    addManagedFile(
      'src/app/entrypoint/App.tsx',
      'pwa/src/app/entrypoint/App.tsx.ejs',
    ),
    addManagedFile('src/features/pwa/index.ts', 'pwa/src/features/pwa/index.ts.ejs'),
    addManagedFile(
      'src/features/pwa/model/index.ts',
      'pwa/src/features/pwa/model/index.ts.ejs',
    ),
    addManagedFile(
      'src/features/pwa/model/PwaProvider.tsx',
      'pwa/src/features/pwa/model/PwaProvider.tsx.ejs',
    ),
    addManagedFile(
      'src/features/pwa/ui/PwaStatus.tsx',
      'pwa/src/features/pwa/ui/PwaStatus.tsx.ejs',
    ),
    addManagedFile(
      'src/features/pwa/ui/pwa-status.css',
      'pwa/src/features/pwa/ui/pwa-status.css.ejs',
    ),
    addManagedFile('src/pages/pwa/index.ts', 'pwa/src/pages/pwa/index.ts.ejs'),
    addManagedFile(
      'src/pages/pwa/ui/PwaPage.tsx',
      'pwa/src/pages/pwa/ui/PwaPage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/pwa/ui/PwaPage.test.tsx',
      'pwa/src/pages/pwa/ui/PwaPage.test.tsx.ejs',
    ),
    addManagedFile('public/pwa-icon.svg', 'pwa/public/pwa-icon.svg.ejs'),
  ];
}

export const PWA_BASE_MANAGED_FILES = [
  appManagedFile('vite.config.ts', 'vite.config.ts.ejs'),
  appManagedFile('src/app/entrypoint/App.tsx', 'src/app/entrypoint/App.tsx.ejs'),
];

export const PWA_GUARD_DEPENDENCIES = ['vite-plugin-pwa'] as const;

export const PWA_MANAGED_PATHS = [
  'src/features/pwa',
  'src/pages/pwa',
  'public/pwa-icon.svg',
] as const;
