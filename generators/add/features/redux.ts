import fs from 'node:fs';

import type { ManagedFile } from '../../lib/types';
import { FEATURE_STATES, type FeatureState } from '../lib/constants';
import {
  addManagedFile,
  appManagedFile,
  hasPackageDependency,
} from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const REDUX_MANAGED_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    appManagedFile('.env.example', '_env.example.ejs'),
    appManagedFile('src/vite-env.d.ts', 'src/vite-env.d.ts.ejs'),
    appManagedFile('src/shared/config/env.ts', 'src/shared/config/env.ts.ejs'),
    appManagedFile(
      'src/app/providers/AppProviders.tsx',
      'src/app/providers/AppProviders.tsx.ejs',
    ),
    appManagedFile(
      'src/app/routes/AppRouter.tsx',
      'src/app/routes/AppRouter.tsx.ejs',
    ),
    appManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'src/pages/home/ui/HomePage.tsx.ejs',
    ),
    appManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.auth]: [
    addManagedFile('.env.example', 'auth/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'auth/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'auth/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'auth/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'auth/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'auth/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'auth/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.uiLibrary]: [
    appManagedFile('.env.example', '_env.example.ejs'),
    appManagedFile('src/vite-env.d.ts', 'src/vite-env.d.ts.ejs'),
    appManagedFile('src/shared/config/env.ts', 'src/shared/config/env.ts.ejs'),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library/src/app/providers/AppProviders.tsx.ejs',
    ),
    appManagedFile(
      'src/app/routes/AppRouter.tsx',
      'src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'ui-library/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'ui-library/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.uiLibraryAuth]: [
    addManagedFile('.env.example', 'auth/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'auth/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'auth/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library-auth/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'auth/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'ui-library-auth/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'ui-library-auth/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
};

const REDUX_OUTPUT_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    addManagedFile('.env.example', 'redux/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'redux/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'redux/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'redux/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'redux/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'redux/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'redux/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.auth]: [
    addManagedFile('.env.example', 'auth-redux/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'auth-redux/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'auth-redux/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'auth-redux/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'auth-redux/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'auth-redux/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'auth-redux/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.uiLibrary]: [
    addManagedFile('.env.example', 'redux/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'redux/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'redux/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library-redux/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'redux/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'ui-library-redux/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'ui-library-redux/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
  [FEATURE_STATES.uiLibraryAuth]: [
    addManagedFile('.env.example', 'auth-redux/_env.example.ejs'),
    addManagedFile('src/vite-env.d.ts', 'auth-redux/src/vite-env.d.ts.ejs'),
    addManagedFile(
      'src/shared/config/env.ts',
      'auth-redux/src/shared/config/env.ts.ejs',
    ),
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library-auth-redux/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/routes/AppRouter.tsx',
      'auth-redux/src/app/routes/AppRouter.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.tsx',
      'ui-library-auth-redux/src/pages/home/ui/HomePage.tsx.ejs',
    ),
    addManagedFile(
      'src/pages/home/ui/HomePage.test.tsx',
      'ui-library-auth-redux/src/pages/home/ui/HomePage.test.tsx.ejs',
    ),
  ],
};

const REDUX_NEW_FILES = [
  addManagedFile('src/app/store/index.ts', 'redux/src/app/store/index.ts.ejs'),
  addManagedFile(
    'src/app/store/GlobalSlice.ts',
    'redux/src/app/store/GlobalSlice.ts.ejs',
  ),
  addManagedFile(
    'src/app/store/actions.ts',
    'redux/src/app/store/actions.ts.ejs',
  ),
  addManagedFile(
    'src/pages/redux/index.ts',
    'redux/src/pages/redux/index.ts.ejs',
  ),
  addManagedFile(
    'src/pages/redux/ui/ReduxPage.tsx',
    'redux/src/pages/redux/ui/ReduxPage.tsx.ejs',
  ),
  addManagedFile(
    'src/pages/redux/ui/ReduxPage.test.tsx',
    'redux/src/pages/redux/ui/ReduxPage.test.tsx.ejs',
  ),
];

const REDUX_DEPENDENCIES = {
  '@reduxjs/toolkit': '^2.2.7',
  'react-redux': '^8.0.2',
  redux: '^4.2.0',
  'redux-persist': '^6.0.0',
};

const REDUX_DEV_DEPENDENCIES = {
  '@types/redux-immutable-state-invariant': '^2.1.4',
  '@types/redux-logger': '^3.0.13',
  'redux-immutable-state-invariant': '^2.1.0',
  'redux-logger': '^3.0.6',
};

const REDUX_MANAGED_DIRECTORIES = ['src/app/store', 'src/pages/redux'] as const;
const REDUX_GUARD_DEPENDENCIES = [
  '@reduxjs/toolkit',
  'react-redux',
  'redux',
  'redux-persist',
  'redux-immutable-state-invariant',
  'redux-logger',
] as const;

const reduxFeature: FeatureDefinition = {
  name: 'redux',
  label: 'Redux',
  isInstalled(generator) {
    return (
      REDUX_GUARD_DEPENDENCIES.some((dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
      ) ||
      REDUX_MANAGED_DIRECTORIES.some((directoryPath) =>
        fs.existsSync(generator.destinationPath(directoryPath)),
      )
    );
  },
  validate(generator) {
    const existingReduxDependencies = REDUX_GUARD_DEPENDENCIES.filter(
      (dependencyName) =>
        hasPackageDependency(generator.rootPackageJson, dependencyName),
    );

    if (existingReduxDependencies.length > 0) {
      throw new Error(
        `Redux generation aborted because package.json already defines: ${existingReduxDependencies.join(', ')}.`,
      );
    }

    const existingReduxDirectories = REDUX_MANAGED_DIRECTORIES.filter(
      (directoryPath) =>
        fs.existsSync(generator.destinationPath(directoryPath)),
    );

    if (existingReduxDirectories.length > 0) {
      throw new Error(
        `Redux generation aborted because these managed paths already exist: ${existingReduxDirectories.join(', ')}.`,
      );
    }

    const managedFiles = REDUX_MANAGED_FILES[generator.projectState];

    if (!managedFiles) {
      throw new Error(
        `Redux generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._validateManagedFiles(
      'Redux',
      managedFiles,
      generator.projectState,
    );
  },
  write(generator) {
    const outputFiles = REDUX_OUTPUT_FILES[generator.projectState];

    if (!outputFiles) {
      throw new Error(
        `Redux generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._writeDependencies(REDUX_DEPENDENCIES);
    generator._writeDevDependencies(REDUX_DEV_DEPENDENCIES);
    generator._writeManagedFiles([...outputFiles, ...REDUX_NEW_FILES]);
  },
  end(generator) {
    generator.log('Redux feature scaffolded in "./src/app/store".');
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
    generator.log('  Open /redux');
  },
};

export = reduxFeature;
