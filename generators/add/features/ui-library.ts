import fs from 'node:fs';

import type { ManagedFile } from '../../lib/types';
import { FEATURE_STATES, type FeatureState } from '../lib/constants';
import {
  addManagedFile,
  appManagedFile,
  hasPackageDependency,
} from '../lib/helpers';
import type { FeatureDefinition } from '../lib/types';

const UI_LIBRARY_MANAGED_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    appManagedFile(
      'src/app/providers/AppProviders.tsx',
      'src/app/providers/AppProviders.tsx.ejs',
    ),
    appManagedFile(
      'src/app/styles/global.css',
      'src/app/styles/global.css.ejs',
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
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'auth/src/app/providers/AppProviders.tsx.ejs',
    ),
    appManagedFile(
      'src/app/styles/global.css',
      'src/app/styles/global.css.ejs',
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
};

const UI_LIBRARY_OUTPUT_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/styles/global.css',
      'ui-library/src/app/styles/global.css.ejs',
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
  [FEATURE_STATES.auth]: [
    addManagedFile(
      'src/app/providers/AppProviders.tsx',
      'ui-library-auth/src/app/providers/AppProviders.tsx.ejs',
    ),
    addManagedFile(
      'src/app/styles/global.css',
      'ui-library/src/app/styles/global.css.ejs',
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

const UI_LIBRARY_NEW_FILES = [
  addManagedFile(
    'src/widgets/ui-library-showcase/index.ts',
    'ui-library/src/widgets/ui-library-showcase/index.ts.ejs',
  ),
  addManagedFile(
    'src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx',
    'ui-library/src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx.ejs',
  ),
];

const UI_LIBRARY_DEPENDENCIES = {
  '@batoanng/mui-components': '^3.0.30',
  '@emotion/react': '^11.13.5',
  '@emotion/styled': '^11.13.5',
  '@mui/icons-material': '6.1.8',
  '@mui/material': '6.1.8',
  '@mui/utils': '^6.1.8',
  '@mui/x-date-pickers': '7.22.2',
  'framer-motion': '^12.23.24',
  'react-dropzone': '^14.2.3',
  'react-easy-crop': '^5.0.2',
  'react-hook-form': '7.44.3',
  'react-idle-timer': '^5.7.2',
};

const UI_LIBRARY_MANAGED_DIRECTORY = 'src/widgets/ui-library-showcase';

const uiLibraryFeature: FeatureDefinition = {
  name: 'ui-library',
  label: 'UI library',
  isInstalled(generator) {
    return (
      hasPackageDependency(
        generator.rootPackageJson,
        '@batoanng/mui-components',
      ) ||
      fs.existsSync(generator.destinationPath(UI_LIBRARY_MANAGED_DIRECTORY))
    );
  },
  validate(generator) {
    if (this.isInstalled?.(generator)) {
      throw new Error(
        'UI library generation aborted because package.json already defines "@batoanng/mui-components".',
      );
    }

    if (
      fs.existsSync(generator.destinationPath(UI_LIBRARY_MANAGED_DIRECTORY))
    ) {
      throw new Error(
        `UI library generation aborted because "${UI_LIBRARY_MANAGED_DIRECTORY}/" already exists.`,
      );
    }

    const managedFiles = UI_LIBRARY_MANAGED_FILES[generator.projectState];

    if (!managedFiles) {
      throw new Error(
        `UI library generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._validateManagedFiles(
      'UI library',
      managedFiles,
      generator.projectState,
    );
  },
  write(generator) {
    const outputFiles = UI_LIBRARY_OUTPUT_FILES[generator.projectState];

    if (!outputFiles) {
      throw new Error(
        `UI library generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._writeDependencies(UI_LIBRARY_DEPENDENCIES);
    generator._writeManagedFiles([...outputFiles, ...UI_LIBRARY_NEW_FILES]);
  },
  end(generator) {
    generator.log(
      'UI library feature with theme wiring scaffolded in "./src/widgets/ui-library-showcase".',
    );
    generator.log('Next steps:');
    generator.log('  npm install');
    generator.log('  npm run dev');
  },
};

export = uiLibraryFeature;
