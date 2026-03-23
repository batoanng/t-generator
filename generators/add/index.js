const fs = require("node:fs");
const path = require("node:path");
const GeneratorModule = require("yeoman-generator");

const Generator = GeneratorModule.default || GeneratorModule;

const APP_TEMPLATE_ROOT = path.join(__dirname, "../app/templates");
const ADD_TEMPLATE_ROOT = path.join(__dirname, "templates");
const REQUIRED_BASE_SCRIPTS = ["dev", "build", "preview", "lint", "test"];
const REQUIRED_BASE_FILES = [
  "src/app/entrypoint/App.tsx",
  "src/app/providers/AppProviders.tsx",
  "src/app/routes/AppRouter.tsx",
  "src/shared/config/env.ts",
];
const FEATURE_STATES = {
  base: "base",
  auth: "auth",
  uiLibrary: "ui-library",
  uiLibraryAuth: "ui-library-auth",
};
const SUPPORTED_FEATURES = ["bff", "ui-library", "auth"];
const BFF_MANAGED_SCRIPTS = ["dev:client", "dev:server", "dev:full"];

function appManagedFile(filePath, templatePath) {
  return {
    path: filePath,
    templatePath,
    templateSource: "app",
  };
}

function addManagedFile(filePath, templatePath) {
  return {
    path: filePath,
    templatePath,
    templateSource: "add",
  };
}

const UI_LIBRARY_MANAGED_FILES = {
  [FEATURE_STATES.base]: [
    appManagedFile(
      "src/app/providers/AppProviders.tsx",
      "src/app/providers/AppProviders.tsx.ejs",
    ),
    appManagedFile(
      "src/app/styles/global.css",
      "src/app/styles/global.css.ejs",
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
  [FEATURE_STATES.auth]: [
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "auth/src/app/providers/AppProviders.tsx.ejs",
    ),
    appManagedFile(
      "src/app/styles/global.css",
      "src/app/styles/global.css.ejs",
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
};
const UI_LIBRARY_OUTPUT_FILES = {
  [FEATURE_STATES.base]: [
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "ui-library/src/app/providers/AppProviders.tsx.ejs",
    ),
    addManagedFile(
      "src/app/styles/global.css",
      "ui-library/src/app/styles/global.css.ejs",
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
  [FEATURE_STATES.auth]: [
    addManagedFile(
      "src/app/providers/AppProviders.tsx",
      "ui-library-auth/src/app/providers/AppProviders.tsx.ejs",
    ),
    addManagedFile(
      "src/app/styles/global.css",
      "ui-library/src/app/styles/global.css.ejs",
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
const UI_LIBRARY_NEW_FILES = [
  addManagedFile(
    "src/widgets/ui-library-showcase/index.ts",
    "ui-library/src/widgets/ui-library-showcase/index.ts.ejs",
  ),
  addManagedFile(
    "src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx",
    "ui-library/src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx.ejs",
  ),
];
const UI_LIBRARY_DEPENDENCIES = {
  "@batoanng/mui-components": "^3.0.30",
  "@emotion/react": "^11.13.5",
  "@emotion/styled": "^11.13.5",
  "@mui/icons-material": "6.1.8",
  "@mui/material": "6.1.8",
  "@mui/utils": "^6.1.8",
  "@mui/x-date-pickers": "7.22.2",
  "framer-motion": "^12.23.24",
  "react-dropzone": "^14.2.3",
  "react-easy-crop": "^5.0.2",
  "react-hook-form": "7.44.3",
  "react-idle-timer": "^5.7.2",
};
const UI_LIBRARY_MANAGED_DIRECTORY = "src/widgets/ui-library-showcase";

const AUTH_MANAGED_FILES = {
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
const AUTH_OUTPUT_FILES = {
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
const AUTH_MANAGED_DIRECTORIES = [
  "src/app/providers/auth",
  "src/pages/auth",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeFeatureName(input) {
  return String(input || "").trim().toLowerCase();
}

function toDisplayName(appName) {
  return String(appName || "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getFeatureLabel(featureName) {
  if (featureName === "bff") {
    return "BFF";
  }

  if (featureName === "ui-library") {
    return "UI library";
  }

  if (featureName === "auth") {
    return "Auth";
  }

  return `Feature "${featureName}"`;
}

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n/g, "\n");
}

function readAppDisplayName(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const match = normalizeLineEndings(fs.readFileSync(filePath, "utf8")).match(
    /^VITE_APP_NAME=(.+)$/m,
  );
  const value = match?.[1]?.trim();

  return value || fallback;
}

function renderTemplateContent(template, context) {
  return String(template)
    .replace(/<%=\s*appName\s*%>/g, context.appName)
    .replace(/<%=\s*appDisplayName\s*%>/g, context.appDisplayName);
}

function renderTemplateFile(filePath, context) {
  return renderTemplateContent(fs.readFileSync(filePath, "utf8"), context);
}

function hasPackageDependency(packageJson, dependencyName) {
  return (
    typeof packageJson.dependencies?.[dependencyName] === "string" ||
    typeof packageJson.devDependencies?.[dependencyName] === "string"
  );
}

function resolveTemplateAbsolutePath(templateDefinition) {
  const templateRoot =
    templateDefinition.templateSource === "app" ? APP_TEMPLATE_ROOT : ADD_TEMPLATE_ROOT;

  return path.join(templateRoot, templateDefinition.templatePath);
}

module.exports = class AddGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("featureName", {
      type: String,
      required: false,
      description: "Feature name to add to an existing generated project.",
    });
  }

  async prompting() {
    if (this.options.featureName) {
      return;
    }

    const answers = await this.prompt([
      {
        type: "list",
        name: "featureName",
        message: "Feature to add",
        choices: SUPPORTED_FEATURES,
      },
    ]);

    this.options.featureName = answers.featureName;
  }

  configuring() {
    this.featureName = normalizeFeatureName(this.options.featureName);

    if (!SUPPORTED_FEATURES.includes(this.featureName)) {
      throw new Error(
        `Unknown feature "${this.featureName}". Supported features: ${SUPPORTED_FEATURES.join(", ")}.`,
      );
    }

    this.projectRoot = this.destinationRoot();
    this.packageJsonPath = this.destinationPath("package.json");
    this.envExamplePath = this.destinationPath(".env.example");
    this.rootPackageJson = this._validateBaseApp();
    this.appName = String(
      this.rootPackageJson.name || path.basename(this.projectRoot) || "app",
    );
    this.appDisplayName = readAppDisplayName(
      this.envExamplePath,
      toDisplayName(this.appName),
    );
    this.templateContext = {
      appName: this.appName,
      appDisplayName: this.appDisplayName,
    };
    this.projectState = this._detectProjectState();

    if (this.featureName === "bff") {
      this._validateBffPrerequisites();
      return;
    }

    if (this.featureName === "ui-library") {
      this._validateUiLibraryPrerequisites();
      return;
    }

    if (this.featureName === "auth") {
      this._validateAuthPrerequisites();
    }
  }

  _validateBaseApp() {
    const featureLabel = getFeatureLabel(this.featureName);

    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error(
        `${featureLabel} can only be generated inside a t-generator base app. Missing package.json at the project root.`,
      );
    }

    let packageJson;

    try {
      packageJson = readJson(this.packageJsonPath);
    } catch (error) {
      throw new Error(
        `${featureLabel} can only be generated inside a t-generator base app. Unable to read package.json: ${error.message}`,
      );
    }

    const missingScripts = REQUIRED_BASE_SCRIPTS.filter(
      (scriptName) => typeof packageJson.scripts?.[scriptName] !== "string",
    );
    const missingFiles = REQUIRED_BASE_FILES.filter(
      (relativePath) => !fs.existsSync(this.destinationPath(relativePath)),
    );

    if (missingScripts.length > 0 || missingFiles.length > 0) {
      const details = [];

      if (missingScripts.length > 0) {
        details.push(`missing scripts: ${missingScripts.join(", ")}`);
      }

      if (missingFiles.length > 0) {
        details.push(`missing files: ${missingFiles.join(", ")}`);
      }

      throw new Error(
        `${featureLabel} can only be generated inside a t-generator base app. ${details.join("; ")}.`,
      );
    }

    return packageJson;
  }

  _detectProjectState() {
    const hasUiLibrary =
      hasPackageDependency(this.rootPackageJson, "@batoanng/mui-components") ||
      fs.existsSync(this.destinationPath(UI_LIBRARY_MANAGED_DIRECTORY));
    const hasAuth =
      hasPackageDependency(this.rootPackageJson, "@auth0/auth0-react") ||
      AUTH_MANAGED_DIRECTORIES.some((directoryPath) =>
        fs.existsSync(this.destinationPath(directoryPath)),
      );

    if (hasUiLibrary && hasAuth) {
      return FEATURE_STATES.uiLibraryAuth;
    }

    if (hasUiLibrary) {
      return FEATURE_STATES.uiLibrary;
    }

    if (hasAuth) {
      return FEATURE_STATES.auth;
    }

    return FEATURE_STATES.base;
  }

  _validateBffPrerequisites() {
    if (fs.existsSync(this.destinationPath("server"))) {
      throw new Error(
        'BFF generation aborted because "server/" already exists.',
      );
    }

    const existingManagedScripts = BFF_MANAGED_SCRIPTS.filter(
      (scriptName) => typeof this.rootPackageJson.scripts?.[scriptName] === "string",
    );

    if (existingManagedScripts.length > 0) {
      throw new Error(
        `BFF generation aborted because package.json already defines: ${existingManagedScripts.join(", ")}.`,
      );
    }
  }

  _validateManagedFiles(featureLabel, managedFiles, stateLabel) {
    const missingManagedFiles = managedFiles
      .map(({ path: filePath }) => filePath)
      .filter((filePath) => !fs.existsSync(this.destinationPath(filePath)));

    if (missingManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because required scaffold files are missing: ${missingManagedFiles.join(", ")}.`,
      );
    }

    const modifiedManagedFiles = managedFiles
      .filter((templateDefinition) => {
        const destinationFilePath = this.destinationPath(templateDefinition.path);
        const currentContent = normalizeLineEndings(
          fs.readFileSync(destinationFilePath, "utf8"),
        );
        const expectedContent = normalizeLineEndings(
          renderTemplateFile(
            resolveTemplateAbsolutePath(templateDefinition),
            this.templateContext,
          ),
        );

        return currentContent !== expectedContent;
      })
      .map(({ path: filePath }) => filePath);

    if (modifiedManagedFiles.length > 0) {
      throw new Error(
        `${featureLabel} generation aborted because these managed files do not match the expected ${stateLabel} scaffold: ${modifiedManagedFiles.join(", ")}.`,
      );
    }
  }

  _validateUiLibraryPrerequisites() {
    if (this.projectState === FEATURE_STATES.uiLibraryAuth) {
      throw new Error(
        'UI library generation aborted because package.json already defines "@batoanng/mui-components".',
      );
    }

    if (this.projectState === FEATURE_STATES.uiLibrary) {
      throw new Error(
        'UI library generation aborted because package.json already defines "@batoanng/mui-components".',
      );
    }

    if (fs.existsSync(this.destinationPath(UI_LIBRARY_MANAGED_DIRECTORY))) {
      throw new Error(
        `UI library generation aborted because "${UI_LIBRARY_MANAGED_DIRECTORY}/" already exists.`,
      );
    }

    const managedFiles = UI_LIBRARY_MANAGED_FILES[this.projectState];

    if (!managedFiles) {
      throw new Error(
        `UI library generation aborted because the current project state "${this.projectState}" is not supported.`,
      );
    }

    this._validateManagedFiles("UI library", managedFiles, this.projectState);
  }

  _validateAuthPrerequisites() {
    if (this.projectState === FEATURE_STATES.auth) {
      throw new Error(
        'Auth generation aborted because package.json already defines "@auth0/auth0-react".',
      );
    }

    if (this.projectState === FEATURE_STATES.uiLibraryAuth) {
      throw new Error(
        'Auth generation aborted because package.json already defines "@auth0/auth0-react".',
      );
    }

    if (hasPackageDependency(this.rootPackageJson, "@auth0/auth0-react")) {
      throw new Error(
        'Auth generation aborted because package.json already defines "@auth0/auth0-react".',
      );
    }

    const existingAuthDirectories = AUTH_MANAGED_DIRECTORIES.filter((directoryPath) =>
      fs.existsSync(this.destinationPath(directoryPath)),
    );

    if (existingAuthDirectories.length > 0) {
      throw new Error(
        `Auth generation aborted because these managed paths already exist: ${existingAuthDirectories.join(", ")}.`,
      );
    }

    const managedFiles = AUTH_MANAGED_FILES[this.projectState];

    if (!managedFiles) {
      throw new Error(
        `Auth generation aborted because the current project state "${this.projectState}" is not supported.`,
      );
    }

    this._validateManagedFiles("Auth", managedFiles, this.projectState);
  }

  writing() {
    if (this.featureName === "bff") {
      this._writeBff();
      return;
    }

    if (this.featureName === "ui-library") {
      this._writeUiLibrary();
      return;
    }

    if (this.featureName === "auth") {
      this._writeAuth();
    }
  }

  _writeBff() {
    const templateFiles = [
      ["bff/server/package.json.ejs", "server/package.json"],
      ["bff/server/server.js.ejs", "server/server.js"],
      ["bff/server/README.md.ejs", "server/README.md"],
      ["bff/server/_gitignore.ejs", "server/.gitignore"],
      ["bff/server/_env.development.ejs", "server/.env.development"],
      ["bff/server/_env.production.ejs", "server/.env.production"],
    ];

    templateFiles.forEach(([from, to]) => {
      this.fs.copyTpl(
        this.templatePath(from),
        this.destinationPath(to),
        this.templateContext,
      );
    });

    const updatedPackageJson = {
      ...this.rootPackageJson,
      scripts: {
        ...this.rootPackageJson.scripts,
        "dev:client": this.rootPackageJson.scripts.dev,
        "dev:server": "npm --prefix server run start",
        "dev:full":
          'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
      },
      devDependencies: {
        ...this.rootPackageJson.devDependencies,
        concurrently:
          this.rootPackageJson.devDependencies?.concurrently || "^9.0.1",
      },
    };

    this.fs.write(
      this.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );
  }

  _writeUiLibrary() {
    const dependencies = { ...(this.rootPackageJson.dependencies || {}) };

    Object.entries(UI_LIBRARY_DEPENDENCIES).forEach(([name, version]) => {
      if (typeof dependencies[name] !== "string") {
        dependencies[name] = version;
      }
    });

    const updatedPackageJson = {
      ...this.rootPackageJson,
      dependencies,
    };

    this.fs.write(
      this.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );

    [
      ...UI_LIBRARY_OUTPUT_FILES[this.projectState],
      ...UI_LIBRARY_NEW_FILES,
    ].forEach((templateDefinition) => {
      this.fs.write(
        this.destinationPath(templateDefinition.path),
        renderTemplateFile(
          resolveTemplateAbsolutePath(templateDefinition),
          this.templateContext,
        ),
      );
    });
  }

  _writeAuth() {
    const dependencies = { ...(this.rootPackageJson.dependencies || {}) };

    Object.entries(AUTH_DEPENDENCIES).forEach(([name, version]) => {
      if (typeof dependencies[name] !== "string") {
        dependencies[name] = version;
      }
    });

    const updatedPackageJson = {
      ...this.rootPackageJson,
      dependencies,
    };

    this.fs.write(
      this.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );

    [...AUTH_OUTPUT_FILES[this.projectState], ...AUTH_NEW_FILES].forEach(
      (templateDefinition) => {
        this.fs.write(
          this.destinationPath(templateDefinition.path),
          renderTemplateFile(
            resolveTemplateAbsolutePath(templateDefinition),
            this.templateContext,
          ),
        );
      },
    );
  }

  end() {
    this.log("");

    if (this.featureName === "bff") {
      this.log('BFF feature scaffolded in "./server".');
      this.log("Next steps:");
      this.log("  npm install");
      this.log("  npm --prefix server install");
      this.log("  npm run dev:full");
      return;
    }

    if (this.featureName === "ui-library") {
      this.log(
        'UI library feature with theme wiring scaffolded in "./src/widgets/ui-library-showcase".',
      );
      this.log("Next steps:");
      this.log("  npm install");
      this.log("  npm run dev");
      return;
    }

    if (this.featureName === "auth") {
      this.log('Auth feature scaffolded in "./src/pages/auth".');
      this.log("Next steps:");
      this.log("  npm install");
      this.log("  Add Auth0 values to .env.local");
      this.log("  npm run dev");
      this.log("  Open /auth");
    }
  }
};
