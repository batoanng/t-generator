const fs = require("node:fs");
const path = require("node:path");
const GeneratorModule = require("yeoman-generator");
const authFeature = require("./features/auth");
const bffFeature = require("./features/bff");
const uiLibraryFeature = require("./features/ui-library");
const {
  FEATURE_STATES,
  REQUIRED_BASE_FILES,
  REQUIRED_BASE_SCRIPTS,
} = require("./lib/constants");
const {
  normalizeFeatureName,
  normalizeLineEndings,
  readAppDisplayName,
  readJson,
  renderTemplateFile,
  resolveTemplateAbsolutePath,
  toDisplayName,
} = require("./lib/helpers");

const Generator = GeneratorModule.default || GeneratorModule;
const FEATURES = [bffFeature, uiLibraryFeature, authFeature];
const FEATURE_BY_NAME = new Map(
  FEATURES.map((featureDefinition) => [featureDefinition.name, featureDefinition]),
);
const SUPPORTED_FEATURES = FEATURES.map(
  (featureDefinition) => featureDefinition.name,
);

function getFeatureLabel(featureName) {
  return FEATURE_BY_NAME.get(featureName)?.label || `Feature "${featureName}"`;
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
    this.featureDefinition = FEATURE_BY_NAME.get(this.featureName);

    if (!this.featureDefinition) {
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

    this.featureDefinition.validate(this);
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
    const hasUiLibrary = uiLibraryFeature.isInstalled(this);
    const hasAuth = authFeature.isInstalled(this);

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

  _writeDependencies(dependencyMap) {
    const dependencies = { ...(this.rootPackageJson.dependencies || {}) };

    Object.entries(dependencyMap).forEach(([name, version]) => {
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
  }

  _writeManagedFiles(templateDefinitions) {
    templateDefinitions.forEach((templateDefinition) => {
      this.fs.write(
        this.destinationPath(templateDefinition.path),
        renderTemplateFile(
          resolveTemplateAbsolutePath(templateDefinition),
          this.templateContext,
        ),
      );
    });
  }

  writing() {
    this.featureDefinition.write(this);
  }

  end() {
    this.log("");
    this.featureDefinition.end(this);
  }
};
