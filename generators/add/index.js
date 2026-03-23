const fs = require("node:fs");
const path = require("node:path");
const GeneratorModule = require("yeoman-generator");

const Generator = GeneratorModule.default || GeneratorModule;

const REQUIRED_BASE_SCRIPTS = ["dev", "build", "preview", "lint", "test"];
const REQUIRED_BASE_FILES = [
  "src/app/entrypoint/App.tsx",
  "src/app/providers/AppProviders.tsx",
  "src/app/routes/AppRouter.tsx",
  "src/shared/config/env.ts",
];
const BFF_MANAGED_SCRIPTS = ["dev:client", "dev:server", "dev:full"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toDisplayName(appName) {
  return String(appName || "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

module.exports = class AddGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("featureName", {
      type: String,
      required: true,
      description: "Feature name to add to an existing generated project.",
    });
  }

  configuring() {
    this.featureName = String(this.options.featureName || "").trim().toLowerCase();

    if (this.featureName !== "bff") {
      throw new Error(
        `Unknown feature "${this.featureName}". Supported features: bff.`,
      );
    }

    this.projectRoot = this.destinationRoot();
    this.packageJsonPath = this.destinationPath("package.json");

    this.rootPackageJson = this.validateBaseApp();
    this.validateBffPrerequisites();

    this.appName = String(
      this.rootPackageJson.name || path.basename(this.projectRoot) || "app",
    );
    this.appDisplayName = toDisplayName(this.appName);
  }

  validateBaseApp() {
    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error(
        "BFF can only be generated inside a t-generator base app. Missing package.json at the project root.",
      );
    }

    let packageJson;

    try {
      packageJson = readJson(this.packageJsonPath);
    } catch (error) {
      throw new Error(
        `BFF can only be generated inside a t-generator base app. Unable to read package.json: ${error.message}`,
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
        `BFF can only be generated inside a t-generator base app. ${details.join("; ")}.`,
      );
    }

    return packageJson;
  }

  validateBffPrerequisites() {
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

  writing() {
    const templateContext = {
      appName: this.appName,
      appDisplayName: this.appDisplayName,
    };
    const templateFiles = [
      ["bff/server/package.json.ejs", "server/package.json"],
      ["bff/server/server.js.ejs", "server/server.js"],
      ["bff/server/README.md.ejs", "server/README.md"],
      ["bff/server/_gitignore.ejs", "server/.gitignore"],
      ["bff/server/_env.development.ejs", "server/.env.development"],
      ["bff/server/_env.production.ejs", "server/.env.production"],
    ];

    templateFiles.forEach(([from, to]) => {
      this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), templateContext);
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
        concurrently: this.rootPackageJson.devDependencies?.concurrently || "^9.0.1",
      },
    };

    this.fs.write(
      this.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );
  }

  end() {
    this.log("");
    this.log('BFF feature scaffolded in "./server".');
    this.log("Next steps:");
    this.log("  npm install");
    this.log("  npm --prefix server install");
    this.log("  npm run dev:full");
  }
};
