import fs from "node:fs";

import { FEATURE_STATES, type FeatureState } from "../lib/constants";
import { addManagedFile, appManagedFile, hasPackageDependency } from "../lib/helpers";

import type { ManagedFile } from "../../lib/types";
import type { FeatureDefinition } from "../lib/types";

const AUTH_MANAGED_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    appManagedFile(".env.example", "_env.example.ejs"),
    appManagedFile("src/vite-env.d.ts", "src/vite-env.d.ts.ejs"),
    appManagedFile("src/shared/config/env.ts", "src/shared/config/env.ts.ejs"),
    appManagedFile(
      "src/app/providers/AppProviders.tsx",
      "src/app/providers/AppProviders.tsx.ejs",
    ),
    appManagedFile(
      "src/app/routes/AppRouter.tsx",
      "src/app/routes/AppRouter.tsx.ejs",
    ),
    appManagedFile(
      "src/pages/home/ui/HomePage.tsx",
      "src/pages/home/ui/HomePage.tsx.ejs",
    ),
    appManagedFile(
      "src/pages/home/ui/HomePage.test.tsx",
      "src/pages/home/ui/HomePage.test.tsx.ejs",
    ),
  ],
  [FEATURE_STATES.uiLibrary]: [
    appManagedFile(".env.example", "_env.example.ejs"),
    appManagedFile("src/vite-env.d.ts", "src/vite-env.d.ts.ejs"),
    appManagedFile("src/shared/config/env.ts", "src/shared/config/env.ts.ejs"),
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "ui-library/src/app/providers/AppProviders.tsx.ejs",
    ),
    appManagedFile(
      "src/app/routes/AppRouter.tsx",
      "src/app/routes/AppRouter.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.tsx",
      "ui-library/src/pages/home/ui/HomePage.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.test.tsx",
      "ui-library/src/pages/home/ui/HomePage.test.tsx.ejs",
    ),
  ],
};

const AUTH_OUTPUT_FILES: Partial<Record<FeatureState, ManagedFile[]>> = {
  [FEATURE_STATES.base]: [
    addManagedFile(".env.example", "auth/_env.example.ejs"),
    addManagedFile("src/vite-env.d.ts", "auth/src/vite-env.d.ts.ejs"),
    addManagedFile("src/shared/config/env.ts", "auth/src/shared/config/env.ts.ejs"),
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "auth/src/app/providers/AppProviders.tsx.ejs",
    ),
    addManagedFile(
      "src/app/routes/AppRouter.tsx",
      "auth/src/app/routes/AppRouter.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.tsx",
      "auth/src/pages/home/ui/HomePage.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.test.tsx",
      "auth/src/pages/home/ui/HomePage.test.tsx.ejs",
    ),
  ],
  [FEATURE_STATES.uiLibrary]: [
    addManagedFile(".env.example", "auth/_env.example.ejs"),
    addManagedFile("src/vite-env.d.ts", "auth/src/vite-env.d.ts.ejs"),
    addManagedFile("src/shared/config/env.ts", "auth/src/shared/config/env.ts.ejs"),
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "ui-library-auth/src/app/providers/AppProviders.tsx.ejs",
    ),
    addManagedFile(
      "src/app/routes/AppRouter.tsx",
      "auth/src/app/routes/AppRouter.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.tsx",
      "ui-library-auth/src/pages/home/ui/HomePage.tsx.ejs",
    ),
    addManagedFile(
      "src/pages/home/ui/HomePage.test.tsx",
      "ui-library-auth/src/pages/home/ui/HomePage.test.tsx.ejs",
    ),
  ],
};

const AUTH_NEW_FILES = [
  addManagedFile(
    "src/app/providers/auth/Auth0ProviderWithNavigate.tsx",
    "auth/src/app/providers/auth/Auth0ProviderWithNavigate.tsx.ejs",
  ),
  addManagedFile("src/pages/auth/index.ts", "auth/src/pages/auth/index.ts.ejs"),
  addManagedFile(
    "src/pages/auth/ui/AuthPage.tsx",
    "auth/src/pages/auth/ui/AuthPage.tsx.ejs",
  ),
  addManagedFile(
    "src/pages/auth/ui/AuthPage.test.tsx",
    "auth/src/pages/auth/ui/AuthPage.test.tsx.ejs",
  ),
];

const AUTH_DEPENDENCIES = {
  "@auth0/auth0-react": "^2.8.0",
};

const AUTH_MANAGED_DIRECTORIES = ["src/app/providers/auth", "src/pages/auth"] as const;

const authFeature: FeatureDefinition = {
  name: "auth",
  label: "Auth",
  isInstalled(generator) {
    return (
      hasPackageDependency(generator.rootPackageJson, "@auth0/auth0-react") ||
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

    const existingAuthDirectories = AUTH_MANAGED_DIRECTORIES.filter((directoryPath) =>
      fs.existsSync(generator.destinationPath(directoryPath)),
    );

    if (existingAuthDirectories.length > 0) {
      throw new Error(
        `Auth generation aborted because these managed paths already exist: ${existingAuthDirectories.join(", ")}.`,
      );
    }

    const managedFiles = AUTH_MANAGED_FILES[generator.projectState];

    if (!managedFiles) {
      throw new Error(
        `Auth generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._validateManagedFiles("Auth", managedFiles, generator.projectState);
  },
  write(generator) {
    const outputFiles = AUTH_OUTPUT_FILES[generator.projectState];

    if (!outputFiles) {
      throw new Error(
        `Auth generation aborted because the current project state "${generator.projectState}" is not supported.`,
      );
    }

    generator._writeDependencies(AUTH_DEPENDENCIES);
    generator._writeManagedFiles([...outputFiles, ...AUTH_NEW_FILES]);
  },
  end(generator) {
    generator.log('Auth feature scaffolded in "./src/pages/auth".');
    generator.log("Next steps:");
    generator.log("  npm install");
    generator.log("  Add Auth0 values to .env.local");
    generator.log("  npm run dev");
    generator.log("  Open /auth");
  },
};

export = authFeature;
