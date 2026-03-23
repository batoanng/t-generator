const fs = require("node:fs");
const path = require("node:path");
const GeneratorModule = require("yeoman-generator");

const Generator = GeneratorModule.default || GeneratorModule;

const APP_TEMPLATE_ROOT = path.join(__dirname, "../app/templates");
const REQUIRED_BASE_SCRIPTS = ["dev", "build", "preview", "lint", "test"];
const REQUIRED_BASE_FILES = [
  "src/app/entrypoint/App.tsx",
  "src/app/providers/AppProviders.tsx",
  "src/app/routes/AppRouter.tsx",
  "src/shared/config/env.ts",
];
const SUPPORTED_FEATURES = ["bff", "ui-library"];
const BFF_MANAGED_SCRIPTS = ["dev:client", "dev:server", "dev:full"];
const UI_LIBRARY_MANAGED_FILES = [
  {
    path: "src/app/providers/AppProviders.tsx",
    baseTemplate: "src/app/providers/AppProviders.tsx.ejs",
    featureTemplate: "ui-library/src/app/providers/AppProviders.tsx.ejs",
  },
  {
    path: "src/app/styles/global.css",
    baseTemplate: "src/app/styles/global.css.ejs",
    featureTemplate: "ui-library/src/app/styles/global.css.ejs",
  },
  {
    path: "src/pages/home/ui/HomePage.tsx",
    baseTemplate: "src/pages/home/ui/HomePage.tsx.ejs",
    featureTemplate: "ui-library/src/pages/home/ui/HomePage.tsx.ejs",
  },
  {
    path: "src/pages/home/ui/HomePage.test.tsx",
    baseTemplate: "src/pages/home/ui/HomePage.test.tsx.ejs",
    featureTemplate: "ui-library/src/pages/home/ui/HomePage.test.tsx.ejs",
  },
];
const UI_LIBRARY_NEW_FILES = [
  {
    path: "src/widgets/ui-library-showcase/index.ts",
    featureTemplate: "ui-library/src/widgets/ui-library-showcase/index.ts.ejs",
  },
  {
    path: "src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx",
    featureTemplate:
      "ui-library/src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx.ejs",
  },
];
const UI_LIBRARY_DEPENDENCIES = {
  "@batoanng/mui-components": "^3.0.30",
  "@emotion/react": "^11.13.5",
  "@emotion/styled": "^11.13.5",
  "@mui/icons-material": "6.1.8",
  "@mui/material": "6.1.8",
};
const UI_LIBRARY_MANAGED_DIRECTORY = "src/widgets/ui-library-showcase";

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

    if (this.featureName === "bff") {
      this._validateBffPrerequisites();
      return;
    }

    if (this.featureName === "ui-library") {
      this._validateUiLibraryPrerequisites();
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

  _validateUiLibraryPrerequisites() {
    if (
      typeof this.rootPackageJson.dependencies?.["@batoanng/mui-components"] ===
        "string" ||
      typeof this.rootPackageJson.devDependencies?.["@batoanng/mui-components"] ===
        "string"
    ) {
      throw new Error(
        'UI library generation aborted because package.json already defines "@batoanng/mui-components".',
      );
    }

    if (fs.existsSync(this.destinationPath(UI_LIBRARY_MANAGED_DIRECTORY))) {
      throw new Error(
        `UI library generation aborted because "${UI_LIBRARY_MANAGED_DIRECTORY}/" already exists.`,
      );
    }

    const missingManagedFiles = UI_LIBRARY_MANAGED_FILES.map(
      ({ path: filePath }) => filePath,
    ).filter((filePath) => !fs.existsSync(this.destinationPath(filePath)));

    if (missingManagedFiles.length > 0) {
      throw new Error(
        `UI library generation aborted because required base files are missing: ${missingManagedFiles.join(", ")}.`,
      );
    }

    const modifiedManagedFiles = UI_LIBRARY_MANAGED_FILES.filter(
      ({ path: filePath, baseTemplate }) =>
        normalizeLineEndings(
          fs.readFileSync(this.destinationPath(filePath), "utf8"),
        ) !==
        normalizeLineEndings(
          renderTemplateFile(
            path.join(APP_TEMPLATE_ROOT, baseTemplate),
            this.templateContext,
          ),
        ),
    ).map(({ path: filePath }) => filePath);

    if (modifiedManagedFiles.length > 0) {
      throw new Error(
        `UI library generation aborted because these managed files do not match the expected base scaffold: ${modifiedManagedFiles.join(", ")}.`,
      );
    }
  }

  writing() {
    if (this.featureName === "bff") {
      this._writeBff();
      return;
    }

    if (this.featureName === "ui-library") {
      this._writeUiLibrary();
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

    [...UI_LIBRARY_MANAGED_FILES, ...UI_LIBRARY_NEW_FILES].forEach(
      ({ path: destinationPath, featureTemplate }) => {
        this.fs.write(
          this.destinationPath(destinationPath),
          renderTemplateFile(
            this.templatePath(featureTemplate),
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
        'UI library feature scaffolded in "./src/widgets/ui-library-showcase".',
      );
      this.log("Next steps:");
      this.log("  npm install");
      this.log("  npm run dev");
    }
  }
};
